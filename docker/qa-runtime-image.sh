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
test -x /usr/local/bin/mesh-llm-entrypoint
missing="$(ldd /usr/local/bin/mesh-llm | awk '/not found/ { print $1 }')"
[ -z "$missing" ] || { echo "host has unresolved dependencies: $missing" >&2; exit 1; }
if ldd /usr/local/bin/mesh-llm | grep -Eiq 'cuda|cublas|nccl|hip|hsa|vulkan|ggml|llama'; then
  echo "backend dependency leaked into the mesh-llm host" >&2
  exit 1
fi
test "$(find "/usr/local/lib/mesh-llm/$version/native-runtimes" -name manifest.json -type f | wc -l)" -eq 1
test -f "/usr/local/lib/mesh-llm/$version/product-manifest.json"
/usr/local/bin/mesh-llm --version | grep -F "$version"
/usr/local/bin/mesh-llm runtime list
/usr/local/bin/mesh-llm-entrypoint --version | grep -F "$version"

printf 'runtime image command-surface QA passed for %s/%s; client readiness follows\n' "$distro" "$backend"
