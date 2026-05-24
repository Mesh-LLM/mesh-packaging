#!/bin/sh
set -eu

distro="${1:?distro is required}"

disable_pacman_sandbox() {
  if ! grep -q '^DisableSandbox$' /etc/pacman.conf; then
    printf '\nDisableSandbox\n' >> /etc/pacman.conf
  fi
}

find_one_package() {
  pattern="${1:?pattern is required}"
  count="$(find /packages -maxdepth 1 -name "$pattern" -type f | wc -l | tr -d ' ')"
  if [ "$count" -ne 1 ]; then
    echo "expected exactly one $pattern package in /packages, found $count" >&2
    exit 1
  fi
  find /packages -maxdepth 1 -name "$pattern" -type f | sort | head -n 1
}

case "$distro" in
  ubuntu)
    package="$(find_one_package '*.deb')"
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y --no-install-recommends "$package"
    rm -rf /var/lib/apt/lists/*
    ;;
  alpine)
    package="$(find_one_package '*.apk')"
    apk add --no-cache --allow-untrusted "$package"
    ;;
  arch)
    package="$(find_one_package '*.pkg.tar.zst')"
    disable_pacman_sandbox
    pacman -Sy --noconfirm --needed
    pacman -U --noconfirm --needed "$package"
    ;;
  *)
    echo "unsupported distro: $distro" >&2
    exit 1
    ;;
esac
