#!/bin/sh
set -eu

usage() {
  cat >&2 <<'EOF'
usage: native-package-qa.sh --distro DISTRO --backend BACKEND --arch ARCH --version VERSION --package-format FORMAT --package-dir DIR [options]

Options:
  --backend-version VERSION      Backend toolkit version for CUDA/ROCm rows.
  --runtime-base-image IMAGE     Runtime image used for install tests.
  --install                      Install the package with the distro package manager.
  --expected-only                Only verify the exact expected filename exists.

Environment:
  NATIVE_PACKAGE_QA_LINTIAN=1    Run lintian for .deb packages through a Debian container.
EOF
  exit 2
}

distro=""
backend=""
backend_version=""
arch=""
version=""
package_format=""
package_dir=""
runtime_base_image=""
install=false
expected_only=false

while [ "$#" -gt 0 ]; do
  case "$1" in
    --distro) distro="${2:-}"; shift 2 ;;
    --backend) backend="${2:-}"; shift 2 ;;
    --backend-version) backend_version="${2:-}"; shift 2 ;;
    --arch) arch="${2:-}"; shift 2 ;;
    --version) version="${2:-}"; shift 2 ;;
    --package-format) package_format="${2:-}"; shift 2 ;;
    --package-dir) package_dir="${2:-}"; shift 2 ;;
    --runtime-base-image) runtime_base_image="${2:-}"; shift 2 ;;
    --install) install=true; shift ;;
    --expected-only) expected_only=true; shift ;;
    -h|--help) usage ;;
    *) echo "unknown argument: $1" >&2; usage ;;
  esac
done

[ -n "$distro" ] || usage
[ -n "$backend" ] || usage
[ -n "$arch" ] || usage
[ -n "$version" ] || usage
[ -n "$package_format" ] || usage
[ -n "$package_dir" ] || usage

backend_suffix="$backend"
if [ "$backend" != "cpu" ] && [ -n "$backend_version" ]; then
  backend_suffix="${backend}${backend_version}"
fi

case "$distro:$package_format" in
  ubuntu:deb|alpine:apk|arch:pkg.tar.zst) ;;
  *)
    echo "unsupported distro/package format pair: $distro/$package_format" >&2
    exit 1
    ;;
esac

sha256_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{ print $1 }'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{ print $1 }'
  else
    echo "sha256sum or shasum is required for native package checksum generation" >&2
    exit 1
  fi
}

expected_file="mesh-llm-${version}-${distro}-${arch}-${backend_suffix}.${package_format}"
package_path="${package_dir%/}/$expected_file"

if [ ! -f "$package_path" ]; then
  echo "expected native package not found: $package_path" >&2
  echo "available native package artifacts:" >&2
  find "$package_dir" -maxdepth 1 -type f -print >&2 || true
  exit 1
fi

matching_count="$(find "$package_dir" -maxdepth 1 -type f -name "*.${package_format}" | wc -l | tr -d ' ')"
if [ "$matching_count" != "1" ]; then
  echo "expected exactly one *.${package_format} package, found $matching_count" >&2
  find "$package_dir" -maxdepth 1 -type f -name "*.${package_format}" -print >&2 || true
  exit 1
fi

package_sha256="$(sha256_file "$package_path")"
printf '%s  %s\n' "$package_sha256" "$expected_file" > "${package_path}.sha256"
printf '%s  %s\n' "$package_sha256" "$expected_file" > "${package_dir%/}/SHA256SUMS"

if [ "$expected_only" = true ]; then
  printf 'validated expected native package filename: %s\n' "$expected_file"
  exit 0
fi

command -v docker >/dev/null 2>&1 || {
  echo "docker is required for distro-native package QA checks" >&2
  exit 1
}

abs_package_dir="$(cd "$package_dir" && pwd -P)"

run_package_container() {
  image="$1"
  script="$2"
  docker run --rm \
    -e PACKAGE_FILE="$expected_file" \
    -v "$abs_package_dir:/packages:ro" \
    "$image" \
    sh -eu -c "$script"
}

case "$distro" in
  ubuntu)
    metadata_script='dpkg-deb --info "/packages/$PACKAGE_FILE"'
    run_package_container "${runtime_base_image:-ubuntu:24.04}" "$metadata_script"
    if [ "${NATIVE_PACKAGE_QA_LINTIAN:-0}" = "1" ]; then
      run_package_container "debian:stable-slim" 'apt-get update && apt-get install -y --no-install-recommends lintian && lintian "/packages/$PACKAGE_FILE"'
    elif command -v lintian >/dev/null 2>&1; then
      lintian "$package_path"
    else
      echo "lintian not available; set NATIVE_PACKAGE_QA_LINTIAN=1 to run it in a Debian container" >&2
    fi
    if [ "$install" = true ]; then
      [ -n "$runtime_base_image" ] || { echo "--runtime-base-image is required for install tests" >&2; exit 1; }
      run_package_container "$runtime_base_image" 'apt-get update && apt-get install -y --no-install-recommends "/packages/$PACKAGE_FILE" && command -v mesh-llm && mesh-llm --help | grep -q mesh-llm'
    fi
    ;;
  alpine)
    alpine_script='apk manifest "/packages/$PACKAGE_FILE" && apk --allow-untrusted verify "/packages/$PACKAGE_FILE"'
    if [ "$install" = true ]; then
      [ -n "$runtime_base_image" ] || { echo "--runtime-base-image is required for install tests" >&2; exit 1; }
      alpine_script="$alpine_script && apk add --allow-untrusted \"/packages/\$PACKAGE_FILE\" && command -v mesh-llm && mesh-llm --help | grep -q mesh-llm"
    fi
    run_package_container "${runtime_base_image:-alpine:3.21}" "$alpine_script"
    ;;
  arch)
    arch_script='pacman -Qip "/packages/$PACKAGE_FILE" && pacman -Qlp "/packages/$PACKAGE_FILE"'
    if [ "$install" = true ]; then
      [ -n "$runtime_base_image" ] || { echo "--runtime-base-image is required for install tests" >&2; exit 1; }
      arch_script="$arch_script && if [ ! -s /etc/pacman.d/gnupg/pubring.gpg ]; then pacman-key --init && pacman-key --populate archlinux; fi && pacman -Syu --noconfirm && pacman -U --noconfirm --needed \"/packages/\$PACKAGE_FILE\" && command -v mesh-llm && mesh-llm --help | grep -q mesh-llm"
    fi
    run_package_container "${runtime_base_image:-archlinux:base}" "$arch_script"
    ;;
esac

printf 'native package QA passed: %s\n' "$expected_file"
