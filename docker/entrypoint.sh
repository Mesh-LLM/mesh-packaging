#!/bin/sh
set -eu

if [ "$#" -eq 0 ]; then
  exec mesh-llm serve --auto --headless
fi

exec mesh-llm "$@"
