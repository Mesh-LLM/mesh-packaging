#!/bin/sh
set -eu

distro="${1:?distro is required}"
backend="${2:?backend is required}"
backend_version="${3:-}"

install_rustup() {
  if command -v cargo >/dev/null 2>&1; then
    return 0
  fi
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal
  ln -sf /root/.cargo/bin/cargo /usr/local/bin/cargo
  ln -sf /root/.cargo/bin/rustc /usr/local/bin/rustc
}

disable_pacman_sandbox() {
  if ! grep -q '^DisableSandbox$' /etc/pacman.conf; then
    printf '\nDisableSandbox\n' >> /etc/pacman.conf
  fi
}

refresh_pacman() {
  disable_pacman_sandbox
  if [ ! -s /etc/pacman.d/gnupg/pubring.gpg ]; then
    pacman-key --init
    pacman-key --populate
  fi
  pacman -Syu --noconfirm --needed
}

assert_arch_toolchain_version() {
  package="${1:?package is required}"
  expected="${2:-}"
  if [ -z "$expected" ]; then
    return 0
  fi
  installed="$(pacman -Q "$package" | awk '{ print $2 }')"
  case "$installed" in
    "$expected"|"$expected".*|"$expected"-*) ;;
    *)
      echo "Arch $package version $installed does not match requested backend version $expected" >&2
      exit 1
      ;;
  esac
}

ensure_shasum() {
  if command -v shasum >/dev/null 2>&1; then
    return 0
  fi
  for candidate in /usr/bin/core_perl/shasum /usr/bin/vendor_perl/shasum /usr/bin/site_perl/shasum; do
    if [ -x "$candidate" ]; then
      ln -sf "$candidate" /usr/local/bin/shasum
      return 0
    fi
  done
  echo "shasum is required by mesh-llm's llama preparation script" >&2
  exit 1
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
      apk add --no-cache glslang-dev shaderc spirv-headers vulkan-headers vulkan-loader-dev
    fi
    ;;
  arch)
    refresh_pacman
    pacman -S --noconfirm --needed \
      bash \
      base-devel \
      ca-certificates \
      cmake \
      curl \
      dbus \
      git \
      lld \
      ninja \
      openssl \
      perl \
      pkgconf \
      python
    ensure_shasum
    if pacman -Si sccache >/dev/null 2>&1; then
      pacman -S --noconfirm --needed sccache
    fi
    if [ "$backend" = "vulkan" ]; then
      pacman -S --noconfirm --needed shaderc vulkan-headers vulkan-icd-loader
    fi
    if [ "$backend" = "cuda" ]; then
      pacman -S --noconfirm --needed cuda
      assert_arch_toolchain_version cuda "$backend_version"
    fi
    if [ "$backend" = "rocm" ]; then
      pacman -S --noconfirm --needed hip-runtime-amd rocm-core rocm-hip-sdk
      assert_arch_toolchain_version rocm-core "$backend_version"
    fi
    install_rustup
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
