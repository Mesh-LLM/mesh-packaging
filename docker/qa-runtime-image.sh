#!/bin/sh
set -eu

distro="${1:?distro is required}"
backend="${2:?backend is required}"
version="${3:?version is required}"

case "$distro" in
  ubuntu)
    dpkg-query -W mesh-llm >/dev/null
    dpkg -s mesh-llm | grep -Fx "Status: install ok installed"
    ;;
  arch)
    pacman -Q mesh-llm
    ;;
  alpine)
    apk info --installed mesh-llm
    ;;
  *)
    echo "unsupported distro: $distro" >&2
    exit 1
    ;;
esac

test -x /usr/local/bin/mesh-llm
if [ "$backend" = "cuda" ]; then
  # The NVIDIA container runtime injects libcuda.so.1 from the host. Every
  # user-space library shipped by the image must already resolve here.
  missing="$(ldd /usr/local/bin/mesh-llm | awk '/not found/ { print $1 }')"
  [ "$missing" = "libcuda.so.1" ] || {
    echo "unexpected CUDA runtime dependency set: ${missing:-none missing}" >&2
    exit 1
  }
else
  mesh-llm --version | grep -F "$version"
  mesh-llm runtime list
fi

printf 'runtime image QA passed for %s/%s\n' "$distro" "$backend"
