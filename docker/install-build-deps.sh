#!/bin/sh
set -eu

distro="${1:?distro is required}"
backend="${2:?backend is required}"

install_rustup() {
  if command -v cargo >/dev/null 2>&1; then
    return 0
  fi
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal
  ln -sf /root/.cargo/bin/cargo /usr/local/bin/cargo
  ln -sf /root/.cargo/bin/rustc /usr/local/bin/rustc
}

case "$distro" in
  ubuntu)
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y --no-install-recommends \
      bash \
      build-essential \
      ca-certificates \
      cmake \
      curl \
      git \
      libdbus-1-dev \
      libssl-dev \
      lld \
      ninja-build \
      perl \
      pkg-config \
      python3
    if apt-cache show sccache >/dev/null 2>&1; then
      apt-get install -y --no-install-recommends sccache
    fi
    if [ "$backend" = "vulkan" ]; then
      apt-get install -y --no-install-recommends glslc libvulkan-dev spirv-headers
    fi
    rm -rf /var/lib/apt/lists/*
    install_rustup
    ;;
  alpine)
    apk add --no-cache \
      bash \
      build-base \
      ca-certificates \
      cmake \
      curl \
      dbus-dev \
      git \
      lld \
      linux-headers \
      ninja \
      openssl-dev \
      perl \
      perl-utils \
      pkgconf \
      python3
    install_rustup
    apk add --no-cache sccache || true
    if [ "$backend" = "vulkan" ]; then
      apk add --no-cache glslang-dev shaderc vulkan-headers vulkan-loader-dev
    fi
    ;;
  *)
    echo "unsupported distro: $distro" >&2
    exit 1
    ;;
esac

case "$backend" in
  cpu|cuda|rocm|vulkan) ;;
  *)
    echo "unsupported backend: $backend" >&2
    exit 1
    ;;
esac
