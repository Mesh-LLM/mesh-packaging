#!/bin/sh
set -eu

distro="${1:?distro is required}"
backend="${2:?backend is required}"

disable_pacman_sandbox() {
  if ! grep -q '^DisableSandbox$' /etc/pacman.conf; then
    printf '\nDisableSandbox\n' >> /etc/pacman.conf
  fi
}

case "$distro" in
  ubuntu)
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y --no-install-recommends ca-certificates libdbus-1-3 libgomp1
    if [ "$backend" = "vulkan" ]; then
      apt-get install -y --no-install-recommends libvulkan1
    fi
    rm -rf /var/lib/apt/lists/*
    ;;
  alpine)
    apk add --no-cache ca-certificates dbus-libs libatomic libgcc libgomp libstdc++
    if [ "$backend" = "vulkan" ]; then
      apk add --no-cache vulkan-loader
    fi
    ;;
  arch)
    disable_pacman_sandbox
    pacman -Sy --noconfirm --needed ca-certificates dbus gcc-libs openssl
    if [ "$backend" = "vulkan" ]; then
      pacman -S --noconfirm --needed vulkan-icd-loader
    fi
    if [ "$backend" = "cuda" ]; then
      pacman -S --noconfirm --needed cuda
    fi
    if [ "$backend" = "rocm" ]; then
      pacman -S --noconfirm --needed hip-runtime-amd rocm-core
    fi
    pacman -Scc --noconfirm
    ;;
  *)
    echo "unsupported distro: $distro" >&2
    exit 1
    ;;
esac
