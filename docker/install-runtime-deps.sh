#!/bin/sh
set -eu

distro="${1:?distro is required}"
backend="${2:?backend is required}"

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
    apk add --no-cache ca-certificates dbus-libs libgcc libgomp libstdc++
    if [ "$backend" = "vulkan" ]; then
      apk add --no-cache vulkan-loader
    fi
    ;;
  *)
    echo "unsupported distro: $distro" >&2
    exit 1
    ;;
esac
