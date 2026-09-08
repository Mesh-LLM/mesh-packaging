#!/bin/sh
set -eu

distro="${1:?distro is required}"
dependencies_prepared=false
case "${2:-}" in
  --dependencies-prepared) dependencies_prepared=true ;;
  ''|/packages) ;;
  *) echo "unknown package installation mode: $2" >&2; exit 1 ;;
esac

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
    rm -f /etc/apt/apt.conf.d/docker-clean
    if [ "$dependencies_prepared" = true ]; then
      # The stable runtime-deps stage installed the complete dependency closure.
      # dpkg still checks dependencies and fails if that contract has drifted.
      dpkg --install "$package"
    else
      apt-get update
      apt-get install -y --no-install-recommends "$package"
    fi
    # Vendor packages such as ROCm install shared objects outside the default
    # library directories. Refresh explicitly because container build layers
    # do not reliably leave deferred libc triggers reflected in ld.so.cache.
    ldconfig
    ;;
  alpine)
    package="$(find_one_package '*.apk')"
    apk add --cache-dir /var/cache/apk --allow-untrusted "$package"
    ;;
  arch)
    package="$(find_one_package '*.pkg.tar.zst')"
    if [ "$dependencies_prepared" != true ]; then refresh_pacman; fi
    pacman -U --noconfirm --needed "$package"
    ;;
  *)
    echo "unsupported distro: $distro" >&2
    exit 1
    ;;
esac
