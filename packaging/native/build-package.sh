#!/bin/sh
set -eu

distro="${1:?distro is required}"
backend="${2:?backend is required}"
backend_version="${3:-}"
arch="${4:?arch is required}"
version="${5:?version is required}"
output_dir="${6:?output dir is required}"
bundle="${7:?verified mesh-bundle directory is required}"

binary="$bundle/mesh-llm"
product_manifest="$bundle/product-manifest.json"
host_imports="$bundle/host-imports.json"
test -f "$binary" || { echo "binary not found: $binary" >&2; exit 1; }
test -f "$product_manifest" || { echo "product manifest not found: $product_manifest" >&2; exit 1; }
test -f "$host_imports" || { echo "host import report not found: $host_imports" >&2; exit 1; }
test -d "$bundle/native-runtimes" || { echo "native runtime directory not found: $bundle/native-runtimes" >&2; exit 1; }
runtime_count="$(find "$bundle/native-runtimes" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
[ "$runtime_count" = 1 ] || { echo "expected exactly one native runtime in $bundle" >&2; exit 1; }
runtime_dir="$(find "$bundle/native-runtimes" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
test -f "$runtime_dir/manifest.json" || { echo "runtime manifest not found: $runtime_dir/manifest.json" >&2; exit 1; }

backend_suffix="$backend"
if [ "$backend" != "cpu" ] && [ -n "$backend_version" ]; then
  backend_suffix="${backend}${backend_version}"
fi

package_name="mesh-llm"
file_component="${distro}-${arch}-${backend_suffix}"
metadata_version="$(printf '%s' "$version" | tr '-' '~')"
safe_version="$(printf '%s' "$version" | tr '-' '_')"
build_epoch="${SOURCE_DATE_EPOCH:-$(date +%s)}"
description="mesh-llm ${distro} ${arch} ${backend_suffix} binary"
url="https://github.com/Mesh-LLM/mesh-llm"
license="MIT OR Apache-2.0"

case "$distro" in
  ubuntu)
    package_arch="$arch"
    extension="deb"
    ;;
  alpine)
    metadata_version="$safe_version"
    case "$arch" in
      amd64) package_arch="x86_64" ;;
      arm64) package_arch="aarch64" ;;
      *) echo "unsupported Alpine arch: $arch" >&2; exit 1 ;;
    esac
    extension="apk"
    ;;
  arch)
    metadata_version="$safe_version"
    case "$arch" in
      amd64) package_arch="x86_64" ;;
      arm64) package_arch="aarch64" ;;
      *) echo "unsupported Arch arch: $arch" >&2; exit 1 ;;
    esac
    extension="pkg.tar.zst"
    ;;
  *)
    echo "unsupported distro: $distro" >&2
    exit 1
    ;;
esac

package_file="mesh-llm-${version}-${file_component}.${extension}"
work_dir="$(mktemp -d)"
root_dir="${work_dir}/root"
product_root="$root_dir/usr/local/lib/mesh-llm/$version"
mkdir -p "$output_dir" "$root_dir/usr/local/bin" "$product_root/native-runtimes"
install -m 0755 "$binary" "$root_dir/usr/local/bin/mesh-llm"
cp -R "$runtime_dir" "$product_root/native-runtimes/"
install -m 0644 "$product_manifest" "$product_root/product-manifest.json"
install -m 0644 "$host_imports" "$product_root/host-imports.json"
if [ -f "$bundle/upstream-provenance.json" ]; then
  install -m 0644 "$bundle/upstream-provenance.json" "$product_root/upstream-provenance.json"
fi
installed_size_kb="$(du -sk "$root_dir" | awk '{ print $1 }')"
installed_size_bytes="$(du -sb "$root_dir" | awk '{ print $1 }')"

case "$distro" in
  ubuntu)
    mkdir -p "$root_dir/DEBIAN"
    depends="ca-certificates, libdbus-1-3, libgomp1"
    if [ "$backend" = "vulkan" ]; then
      depends="$depends, libvulkan1"
    fi
    if [ "$backend" = "cuda" ]; then
      [ -n "$backend_version" ] || { echo "CUDA package requires a backend version" >&2; exit 1; }
      cuda_series="$(printf '%s\n' "$backend_version" | awk -F. '{ print $1 "-" $2 }')"
      depends="$depends, cuda-cudart-$cuda_series, libcublas-$cuda_series, libnccl2"
    fi
    if [ "$backend" = "rocm" ]; then
      depends="$depends, hipblas"
    fi
    cat > "$root_dir/DEBIAN/control" <<EOF
Package: $package_name
Version: $metadata_version-1
Section: utils
Priority: optional
Architecture: $package_arch
Maintainer: Mesh LLM maintainers <maintainers@meshllm.cloud>
Depends: $depends
Installed-Size: $installed_size_kb
Homepage: $url
Description: $description
EOF
    dpkg-deb --build --root-owner-group "$root_dir" "$output_dir/$package_file"
    ;;
  alpine)
    data_tar="${work_dir}/data.tar.gz"
    control_tar="${work_dir}/control.tar.gz"
    (cd "$root_dir" && tar --format=posix -cf - usr | abuild-tar --hash | gzip -n -9 > "$data_tar")
    data_hash="$(sha256sum "$data_tar" | awk '{ print $1 }')"
    cat > "$root_dir/.PKGINFO" <<EOF
pkgname = $package_name
pkgver = $metadata_version-r0
pkgdesc = $description
url = $url
builddate = $build_epoch
size = $installed_size_bytes
arch = $package_arch
license = $license
depend = ca-certificates
depend = dbus-libs
depend = libatomic
depend = libgcc
depend = libgomp
depend = libstdc++
depend = openssl
datahash = $data_hash
EOF
    if [ "$backend" = "vulkan" ]; then
      printf '%s\n' 'depend = vulkan-loader' >> "$root_dir/.PKGINFO"
    fi
    (cd "$root_dir" && tar --format=posix -cf - .PKGINFO | abuild-tar --cut | gzip -n -9 > "$control_tar")
    cat "$control_tar" "$data_tar" > "$output_dir/$package_file"
    ;;
  arch)
    cat > "$root_dir/.PKGINFO" <<EOF
pkgname = $package_name
pkgbase = $package_name
pkgver = $metadata_version-1
pkgdesc = $description
url = $url
builddate = $build_epoch
packager = Mesh LLM maintainers <maintainers@meshllm.cloud>
size = $installed_size_bytes
arch = $package_arch
license = MIT OR Apache-2.0
depend = ca-certificates
depend = dbus
depend = gcc-libs
depend = openssl
EOF
    if [ "$backend" = "vulkan" ]; then
      printf '%s\n' 'depend = vulkan-icd-loader' >> "$root_dir/.PKGINFO"
    fi
    if [ "$backend" = "cuda" ]; then
      printf '%s\n' 'depend = cuda' >> "$root_dir/.PKGINFO"
    fi
    if [ "$backend" = "rocm" ]; then
      printf '%s\n' 'depend = hip-runtime-amd' >> "$root_dir/.PKGINFO"
    fi
    tar --zstd -cf "$output_dir/$package_file" -C "$root_dir" .PKGINFO usr
    ;;
esac

rm -rf "$work_dir"
printf '%s\n' "$output_dir/$package_file"
