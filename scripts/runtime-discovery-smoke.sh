#!/bin/sh
set -eu

runtime_root="${1:?installed runtime root is required}"
runtime_dir="$(find "$runtime_root" -mindepth 1 -maxdepth 1 -type d)"
if [ "$(printf '%s\n' "$runtime_dir" | wc -l | tr -d ' ')" != 1 ] || [ ! -f "$runtime_dir/manifest.json" ]; then
  echo "expected one installed native runtime under $runtime_root" >&2
  exit 1
fi
runtime_id="$(basename "$runtime_dir")"
state="$(mktemp -d)"
trap 'rm -rf "$state"' EXIT
unset MESH_LLM_NATIVE_RUNTIME_BUNDLE_DIR
export HOME="$state" XDG_CACHE_HOME="$state/cache" MESH_LLM_NATIVE_RUNTIME_CACHE_DIR="$state/runtime-cache"
mesh-llm --log-format json runtime list --json > "$state/runtimes.json"
# runtime list --json uses a pretty-printed array; only accept matching fields
# in the same top-level runtime object.
awk -v id="$runtime_id" -v path="$runtime_dir" '
  NR == 1 && $0 != "[" { exit 1 }
  /^  \{/ { in_runtime = 1; found_id = 0; found_path = 0 }
  in_runtime && ($0 == "    \"native_runtime_id\": \"" id "\"," || $0 == "    \"native_runtime_id\": \"" id "\"") { found_id = 1 }
  in_runtime && ($0 == "    \"path\": \"" path "\"," || $0 == "    \"path\": \"" path "\"") { found_path = 1 }
  /^  \}/ { if (in_runtime && found_id && found_path) found = 1; in_runtime = 0 }
  { last = $0 }
  END { if (!found || last != "]") exit 1 }
' "$state/runtimes.json" || {
  echo "installed runtime $runtime_id at $runtime_dir was not discovered" >&2
  cat "$state/runtimes.json" >&2
  exit 1
}
