#!/bin/sh
set -eu

usage() {
  cat >&2 <<'EOF'
usage: runtime-image-qa.sh --image IMAGE --distro DISTRO --backend BACKEND --version VERSION

Validates that the final runtime image contains the installed native package.
CPU, Vulkan, and ROCm rows execute the command surface. CUDA rows validate that
every shared library resolves except libcuda.so.1, which the NVIDIA container
runtime injects from the host driver.
EOF
  exit 2
}

image=""
distro=""
backend=""
version=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --image) image="${2:-}"; shift 2 ;;
    --distro) distro="${2:-}"; shift 2 ;;
    --backend) backend="${2:-}"; shift 2 ;;
    --version) version="${2:-}"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "unknown argument: $1" >&2; usage ;;
  esac
done

[ -n "$image" ] || usage
[ -n "$distro" ] || usage
[ -n "$backend" ] || usage
[ -n "$version" ] || usage

case "$distro" in
  ubuntu)
    package_check='dpkg-query -W mesh-llm >/dev/null && dpkg -s mesh-llm | grep -Fx "Status: install ok installed"'
    ;;
  arch)
    package_check='pacman -Q mesh-llm'
    ;;
  alpine)
    package_check='apk info --installed mesh-llm'
    ;;
  *)
    echo "unsupported distro: $distro" >&2
    exit 1
    ;;
esac

if [ "$backend" = "cuda" ]; then
  # A published CUDA runtime image intentionally relies on the NVIDIA
  # container runtime for libcuda.so.1. All other dependencies must resolve.
  # shellcheck disable=SC2016
  cuda_check='test -x /usr/local/bin/mesh-llm && missing="$(ldd /usr/local/bin/mesh-llm | awk '\''/not found/ { print $1 }'\'')" && [ "$missing" = "libcuda.so.1" ]'
  docker run --rm --entrypoint sh "$image" -eu -c "$package_check && $cuda_check"
else
  docker run --rm --entrypoint sh \
    -e EXPECTED_VERSION="$version" \
    "$image" -eu -c "$package_check && mesh-llm --version | grep -F \"\$EXPECTED_VERSION\" && mesh-llm runtime list"
fi

printf 'runtime image QA passed: %s\n' "$image"
