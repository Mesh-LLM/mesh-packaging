#!/bin/sh
# Run from a package-installed image with no GPU device or driver stub. This
# deliberately certifies the host/client path only; hardware-qualified serving
# belongs to separate backend tests.
set -eu

mesh_llm_bin="${MESH_LLM_SMOKE_BIN:-/usr/local/bin/mesh-llm}"
ready_timeout="${MESH_LLM_SMOKE_READY_TIMEOUT_SECONDS:-45}"
shutdown_timeout="${MESH_LLM_SMOKE_SHUTDOWN_TIMEOUT_SECONDS:-10}"

case "$ready_timeout:$shutdown_timeout" in
  *[!0-9:]*|:*|*:) echo "smoke timeouts must be positive integer seconds" >&2; exit 2 ;;
esac
[ "$ready_timeout" -gt 0 ] || { echo "readiness timeout must be positive" >&2; exit 2; }
[ "$shutdown_timeout" -gt 0 ] || { echo "shutdown timeout must be positive" >&2; exit 2; }
[ -x "$mesh_llm_bin" ] || { echo "mesh-llm smoke executable is not executable: $mesh_llm_bin" >&2; exit 1; }

smoke_root="$(mktemp -d "${TMPDIR:-/tmp}/mesh-llm-client-smoke.XXXXXX")"
pid=""
watcher_pid=""
guardian_pid=""
log="$smoke_root/client.jsonl"
ready_marker="$smoke_root/ready"
ready_timeout_marker="$smoke_root/ready-timeout"
watcher_cancel_marker="$smoke_root/watcher-cancel"
shutdown_timeout_marker="$smoke_root/shutdown-timeout"
guardian_done_marker="$smoke_root/guardian-done"
# Fresh containers normally have no listeners. Derive two distinct high ports
# anyway so concurrent package QA invocations cannot collide inside a shared
# network namespace.
port_seed=$(( ($$ % 9000) + 20000 ))
api_port="${MESH_LLM_SMOKE_API_PORT:-$port_seed}"
console_port="${MESH_LLM_SMOKE_CONSOLE_PORT:-$((port_seed + 10000))}"

stop_helper() {
  helper_pid="$1"
  cancel_marker="$2"
  if [ -n "$helper_pid" ]; then
    : > "$cancel_marker"
    wait "$helper_pid" 2>/dev/null || true
  fi
}

signal_and_wait() {
  timeout_marker="$1"
  rm -f "$guardian_done_marker" "$timeout_marker"
  kill -INT "$pid" 2>/dev/null || true
  (
    elapsed=0
    while [ "$elapsed" -lt "$shutdown_timeout" ]; do
      sleep 1
      [ ! -e "$guardian_done_marker" ] || exit 0
      elapsed=$((elapsed + 1))
    done
    if kill -0 "$pid" 2>/dev/null; then
      : > "$timeout_marker"
      kill -TERM "$pid" 2>/dev/null || true
      sleep 1
      [ -e "$guardian_done_marker" ] || kill -KILL "$pid" 2>/dev/null || true
    fi
  ) </dev/null >/dev/null 2>&1 &
  guardian_pid=$!
  set +e
  wait "$pid"
  child_exit_code=$?
  set -e
  pid=""
  : > "$guardian_done_marker"
  stop_helper "$guardian_pid" "$guardian_done_marker"
  guardian_pid=""
}

cleanup() {
  trap - EXIT HUP INT TERM USR1 USR2
  stop_helper "$watcher_pid" "$watcher_cancel_marker"
  watcher_pid=""
  stop_helper "$guardian_pid" "$guardian_done_marker"
  guardian_pid=""
  if [ -n "$pid" ]; then
    cleanup_timeout_marker="$smoke_root/cleanup-timeout"
    signal_and_wait "$cleanup_timeout_marker"
    if [ -e "$cleanup_timeout_marker" ]; then
      echo "client readiness cleanup forced termination after SIGINT timeout" >&2
    fi
  fi
  rm -rf "$smoke_root"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

mkdir -p \
  "$smoke_root/home" \
  "$smoke_root/cache" \
  "$smoke_root/config" \
  "$smoke_root/state" \
  "$smoke_root/runtime" \
  "$smoke_root/native-runtime-cache"
chmod 700 \
  "$smoke_root/home" \
  "$smoke_root/cache" \
  "$smoke_root/config" \
  "$smoke_root/state" \
  "$smoke_root/runtime" \
  "$smoke_root/native-runtime-cache"

(
  trap - INT TERM
  export HOME="$smoke_root/home"
  export XDG_CACHE_HOME="$smoke_root/cache"
  export XDG_CONFIG_HOME="$smoke_root/config"
  export XDG_STATE_HOME="$smoke_root/state"
  export XDG_RUNTIME_DIR="$smoke_root/runtime"
  export MESH_LLM_RUNTIME_ROOT="$smoke_root/runtime"
  export MESH_LLM_NATIVE_RUNTIME_CACHE_DIR="$smoke_root/native-runtime-cache"
  exec "$mesh_llm_bin" --log-format json --port "$api_port" --console "$console_port" --no-console client --auto
) >"$log" 2>&1 &
pid=$!

main_pid=$$
trap ':' USR1 USR2
(
  elapsed=0
  while [ "$elapsed" -lt "$ready_timeout" ]; do
    [ ! -e "$watcher_cancel_marker" ] || exit 0
    if grep -Eq '^[[:space:]]*\{.*"Client ready".*\}[[:space:]]*$' "$log" ||
      grep -E '"event"[[:space:]]*:[[:space:]]*"passive_mode"' "$log" |
        grep -E '"status"[[:space:]]*:[[:space:]]*"ready"' |
        grep -Eq '"role"[[:space:]]*:[[:space:]]*"client"'; then
      : > "$ready_marker"
      kill -USR1 "$main_pid" 2>/dev/null || true
      exit 0
    fi
    sleep 1
    [ ! -e "$watcher_cancel_marker" ] || exit 0
    elapsed=$((elapsed + 1))
  done
  : > "$ready_timeout_marker"
  kill -USR2 "$main_pid" 2>/dev/null || true
) </dev/null >/dev/null 2>&1 &
watcher_pid=$!

set +e
wait "$pid"
readiness_wait_exit=$?
set -e
stop_helper "$watcher_pid" "$watcher_cancel_marker"
watcher_pid=""
trap - USR1 USR2

if [ -e "$ready_timeout_marker" ]; then
  echo "mesh-llm client did not reach structured readiness while alive within ${ready_timeout}s" >&2
  cat "$log" >&2 || true
  exit 1
fi

if [ ! -e "$ready_marker" ]; then
  pid=""
  echo "mesh-llm client exited before readiness with exit code $readiness_wait_exit" >&2
  cat "$log" >&2 || true
  exit 1
fi

if ! kill -0 "$pid" 2>/dev/null; then
  set +e
  wait "$pid"
  readiness_wait_exit=$?
  set -e
  pid=""
  echo "mesh-llm client exited at readiness with exit code $readiness_wait_exit" >&2
  cat "$log" >&2 || true
  exit 1
fi

signal_and_wait "$shutdown_timeout_marker"
if [ -e "$shutdown_timeout_marker" ]; then
  echo "mesh-llm client did not stop after SIGINT within ${shutdown_timeout}s" >&2
  cat "$log" >&2 || true
  exit 1
fi
if [ "$child_exit_code" -ne 0 ]; then
  echo "mesh-llm client exited with $child_exit_code after SIGINT" >&2
  cat "$log" >&2 || true
  exit 1
fi

printf 'mesh-llm client readiness smoke passed (api=%s console=%s)\n' "$api_port" "$console_port"
