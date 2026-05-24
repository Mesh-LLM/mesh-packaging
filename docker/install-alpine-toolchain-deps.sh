#!/bin/sh
set -eu

toolchain="${1:?toolchain is required}"
version="${2:-}"

install_common() {
  apk add --no-cache \
    bash \
    build-base \
    ca-certificates \
    cmake \
    curl \
    linux-headers \
    ninja \
    pkgconf \
    python3 \
    tar \
    xz
}

case "$toolchain" in
  vulkan)
    install_common
    apk add --no-cache \
      glslang-dev \
      shaderc \
      shaderc-dev \
      spirv-tools \
      spirv-tools-dev \
      vulkan-headers \
      vulkan-loader-dev \
      vulkan-tools \
      vulkan-validation-layers
    command -v glslc >/dev/null 2>&1 || { echo "glslc not found after Alpine Vulkan install" >&2; exit 1; }
    ;;
  cuda)
    install_common
    apk add --no-cache \
      gcompat \
      libstdc++
    cuda_runfile_url="${CUDA_TOOLKIT_RUNFILE_URL:-}"
    cuda_runfile_sha256="${CUDA_TOOLKIT_RUNFILE_SHA256:-}"
    if [ -z "$cuda_runfile_url" ] || [ -z "$cuda_runfile_sha256" ]; then
      echo "CUDA_TOOLKIT_RUNFILE_URL and CUDA_TOOLKIT_RUNFILE_SHA256 are required to build an Alpine CUDA toolchain base" >&2
      echo "NVIDIA does not publish a supported Alpine apk CUDA toolchain; pass an official NVIDIA toolkit runfile URL and its pinned SHA-256 digest for ${version:-the requested CUDA version}." >&2
      exit 1
    fi
    case "$cuda_runfile_url" in
      https://developer.download.nvidia.com/compute/cuda/*)
        ;;
      *)
        echo "CUDA_TOOLKIT_RUNFILE_URL must use the official NVIDIA CUDA download host: https://developer.download.nvidia.com/compute/cuda/..." >&2
        exit 1
        ;;
    esac
    case "$cuda_runfile_sha256" in
      [0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F])
        ;;
      *)
        echo "CUDA_TOOLKIT_RUNFILE_SHA256 must be exactly 64 hexadecimal characters" >&2
        exit 1
        ;;
    esac
    if [ -n "$version" ]; then
      version_path="$(printf '%s' "$version" | tr '.' '-')"
      case "$cuda_runfile_url" in
        */$version/*|*/cuda_${version}_*|*/cuda_${version}.*|*/cuda-${version_path}/*)
          ;;
        *)
          echo "CUDA_TOOLKIT_RUNFILE_URL must reference requested CUDA version $version" >&2
          exit 1
          ;;
      esac
    fi
    tmpdir="$(mktemp -d)"
    trap 'rm -rf "$tmpdir"' EXIT
    curl -fsSL "$cuda_runfile_url" -o "$tmpdir/cuda.run"
    printf '%s  %s\n' "$cuda_runfile_sha256" "$tmpdir/cuda.run" | sha256sum -c -
    sh "$tmpdir/cuda.run" --silent --toolkit --override --no-man-page
    export PATH="/usr/local/cuda/bin:$PATH"
    command -v nvcc >/dev/null 2>&1 || { echo "nvcc not found after Alpine CUDA runfile install" >&2; exit 1; }
    ;;
  rocm)
    printf '%s\n' \
      'https://dl-cdn.alpinelinux.org/alpine/edge/main' \
      'https://dl-cdn.alpinelinux.org/alpine/edge/community' \
      'https://dl-cdn.alpinelinux.org/alpine/edge/testing' \
      > /etc/apk/repositories
    install_common
    apk add --no-cache rocm-core rocm-cmake
    test -d /opt/rocm || mkdir -p /opt/rocm
    ;;
  *)
    echo "unsupported Alpine toolchain: $toolchain" >&2
    exit 1
    ;;
esac
