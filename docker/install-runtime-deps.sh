#!/bin/sh
set -eu

distro="${1:?distro is required}"
backend="${2:?backend is required}"
backend_version="${3:-}"

disable_pacman_sandbox() {
  if ! grep -q '^DisableSandbox$' /etc/pacman.conf; then
    printf '\nDisableSandbox\n' >> /etc/pacman.conf
  fi
}

prepare_pacman() {
  disable_pacman_sandbox
  if [ ! -s /etc/pacman.d/gnupg/pubring.gpg ]; then
    pacman-key --init
    pacman-key --populate
  fi
}

case "$distro" in
  ubuntu)
    export DEBIAN_FRONTEND=noninteractive
    rm -f /etc/apt/apt.conf.d/docker-clean
    apt-get update
    set -- ca-certificates libdbus-1-3 libgomp1
    if [ "$backend" = "vulkan" ]; then
      set -- "$@" libvulkan1
    fi
    if [ "$backend" = "cuda" ]; then
      [ -n "$backend_version" ] || { echo "CUDA dependencies require a backend version" >&2; exit 1; }
      cuda_series="$(printf '%s\n' "$backend_version" | awk -F. '{ print $1 "-" $2 }')"
      set -- "$@" "cuda-cudart-$cuda_series" "libcublas-$cuda_series" libnccl2
    fi
    if [ "$backend" = "rocm" ]; then
      set -- "$@" hipblas
    fi
    apt-get install -y --no-install-recommends "$@"
    ;;
  alpine)
    set -- ca-certificates dbus-libs libatomic libgcc libgomp libstdc++ openssl
    if [ "$backend" = "vulkan" ]; then
      set -- "$@" vulkan-loader
    fi
    apk add --cache-dir /var/cache/apk "$@"
    ;;
  arch)
    prepare_pacman
    set -- ca-certificates dbus gcc-libs openssl
    if [ "$backend" = "vulkan" ]; then
      set -- "$@" vulkan-icd-loader
    fi
    if [ "$backend" = "cuda" ]; then
      set -- "$@" cuda
    fi
    if [ "$backend" = "rocm" ]; then
      set -- "$@" hip-runtime-amd rocm-core
    fi
    pacman -Syu --noconfirm --needed "$@"
    ;;
  *)
    echo "unsupported distro: $distro" >&2
    exit 1
    ;;
esac
