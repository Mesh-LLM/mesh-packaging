#!/bin/sh
set -eu

distro="${1:?distro is required}"

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

case "$distro" in
  ubuntu)
    export DEBIAN_FRONTEND=noninteractive
    rm -f /etc/apt/apt.conf.d/docker-clean
    apt-get update
    apt-get install -y --no-install-recommends ca-certificates coreutils dpkg tar
    ;;
  alpine)
    apk add --cache-dir /var/cache/apk abuild ca-certificates coreutils gzip tar
    ;;
  arch)
    refresh_pacman
    pacman -S --noconfirm --needed ca-certificates coreutils tar zstd
    ;;
  *)
    echo "unsupported distro: $distro" >&2
    exit 1
    ;;
esac
