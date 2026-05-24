#!/usr/bin/env python3
"""Generate and validate mesh-llm image matrix rows."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "packaging" / "images.json"
SUPPORTED_BACKENDS = {"cpu", "cuda", "rocm", "vulkan"}
SUPPORTED_DISTROS = {"ubuntu", "alpine"}


def load_config(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def normalize_version(version: str) -> str:
    normalized = version.strip()
    if normalized.startswith("refs/tags/"):
        normalized = normalized.removeprefix("refs/tags/")
    normalized = normalized.removeprefix("v")
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?", normalized):
        raise ValueError(f"invalid mesh-llm version: {version}")
    return normalized


def backend_suffix(backend: str, backend_version: str) -> str:
    if backend == "cpu":
        return "cpu"
    if backend_version:
        return f"{backend}{backend_version}"
    return backend


def tag_component(variant: dict, arch: str) -> str:
    return "-".join(
        [variant["distro"], arch, backend_suffix(variant["backend"], variant.get("backend_version", ""))]
    )


def tags_for(image: str, version: str, variant: dict, arch: str) -> list[str]:
    component = tag_component(variant, arch)
    return [f"{image}:{version}-{component}", f"{image}:{component}"]


def artifact_id(variant: dict, arch: str) -> str:
    return f"{variant['id']}-{arch}"


def binary_artifact_name(version: str, variant: dict, arch: str) -> str:
    return f"mesh-llm-binary-{version}-{artifact_id(variant, arch)}"


def llama_artifact_name(version: str, variant: dict, arch: str) -> str:
    return f"mesh-llm-llama-{version}-{artifact_id(variant, arch)}"


def validate(config: dict) -> list[str]:
    errors: list[str] = []
    seen_ids: set[str] = set()
    platforms = config.get("platform_arches", {})

    if config.get("schema_version") != 1:
        errors.append("schema_version must be 1")

    variants = config.get("variants")
    image_config = config.get("image", {})
    if not isinstance(variants, list) or not variants:
        errors.append("variants must be a non-empty list")
        return errors

    if not image_config.get("ui_base_image"):
        errors.append("image.ui_base_image is required")

    for index, variant in enumerate(variants):
        prefix = f"variants[{index}]"
        variant_id = variant.get("id")
        if not variant_id:
            errors.append(f"{prefix}.id is required")
        elif variant_id in seen_ids:
            errors.append(f"duplicate variant id: {variant_id}")
        else:
            seen_ids.add(variant_id)

        distro = variant.get("distro")
        if distro not in SUPPORTED_DISTROS:
            errors.append(f"{prefix}.distro must be one of {sorted(SUPPORTED_DISTROS)}")

        backend = variant.get("backend")
        if backend not in SUPPORTED_BACKENDS:
            errors.append(f"{prefix}.backend must be one of {sorted(SUPPORTED_BACKENDS)}")

        if backend in {"cuda", "rocm"} and distro == "alpine":
            errors.append(f"{prefix} uses unsupported Alpine GPU backend: {backend}")

        if backend in {"cuda", "rocm"} and not variant.get("backend_version"):
            errors.append(f"{prefix}.backend_version is required for {backend}")

        for key in ["build_base_image", "runtime_base_image"]:
            if not variant.get(key):
                errors.append(f"{prefix}.{key} is required")

        variant_platforms = variant.get("platforms")
        if not isinstance(variant_platforms, list) or not variant_platforms:
            errors.append(f"{prefix}.platforms must be a non-empty list")
            continue
        for platform in variant_platforms:
            if platform not in platforms:
                errors.append(f"{prefix}.platforms contains unknown platform: {platform}")

    return errors


def parse_filter(value: str) -> set[str]:
    return {item.strip() for item in value.split(",") if item.strip()}


def runner_labels(platform: str, runner: str) -> str:
    if runner == "carrack":
        return json.dumps("self-hosted", separators=(",", ":"))
    if platform == "linux/arm64":
        return json.dumps("ubuntu-24.04-arm", separators=(",", ":"))
    return json.dumps("ubuntu-latest", separators=(",", ":"))


def matrix_rows(
    config: dict,
    image: str,
    version: str,
    mesh_ref: str,
    mesh_repository: str,
    variant_filter: set[str],
    platform_filter: set[str],
    runner: str,
) -> list[dict]:
    rows: list[dict] = []
    platform_arches = config["platform_arches"]
    for variant in config["variants"]:
        for platform in variant["platforms"]:
            arch = platform_arches[platform]
            row_artifact_id = artifact_id(variant, arch)
            if variant_filter and variant["id"] not in variant_filter and row_artifact_id not in variant_filter:
                continue
            if platform_filter and platform not in platform_filter and arch not in platform_filter:
                continue
            rows.append(
                {
                    "artifact_id": row_artifact_id,
                    "binary_artifact_name": binary_artifact_name(version, variant, arch),
                    "llama_artifact_name": llama_artifact_name(version, variant, arch),
                    "variant_id": variant["id"],
                    "platform": platform,
                    "arch": arch,
                    "distro": variant["distro"],
                    "distro_version": variant["distro_version"],
                    "backend": variant["backend"],
                    "backend_version": variant.get("backend_version", ""),
                    "build_base_image": variant["build_base_image"],
                    "runtime_base_image": variant["runtime_base_image"],
                    "cuda_architectures": variant.get("cuda_architectures", ""),
                    "rocm_architectures": variant.get("rocm_architectures", ""),
                    "mesh_ref": mesh_ref,
                    "mesh_repository": mesh_repository,
                    "mesh_version": version,
                    "runner_labels": runner_labels(platform, runner),
                    "tags": ",".join(tags_for(image, version, variant, arch)),
                }
            )
    return rows


def cmd_validate(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    errors = validate(config)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1
    print(f"validated {len(config['variants'])} image variants")
    return 0


def cmd_github_matrix(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    errors = validate(config)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1
    try:
        version = normalize_version(args.version)
    except ValueError as error:
        print(error, file=sys.stderr)
        return 1
    image = args.image or config["image"]["default_name"]
    mesh_repository = args.mesh_repository or config["image"]["source_repository"]
    mesh_ref = args.mesh_ref or f"v{version}"
    if args.runner not in {"github", "carrack"}:
        print(f"invalid runner: {args.runner}", file=sys.stderr)
        return 1
    variant_filter = parse_filter(args.variant_filter)
    platform_filter = parse_filter(args.platform_filter)
    rows = matrix_rows(
        config,
        image,
        version,
        mesh_ref,
        mesh_repository,
        variant_filter,
        platform_filter,
        args.runner,
    )
    if not rows:
        print("matrix filters matched no rows", file=sys.stderr)
        return 1
    print(
        json.dumps(
            {"include": rows},
            sort_keys=True,
            separators=(",", ":"),
        )
    )
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    subparsers = parser.add_subparsers(dest="command", required=True)

    validate_parser = subparsers.add_parser("validate")
    validate_parser.set_defaults(func=cmd_validate)

    matrix_parser = subparsers.add_parser("github-matrix")
    matrix_parser.add_argument("--version", required=True)
    matrix_parser.add_argument("--image", default="")
    matrix_parser.add_argument("--mesh-ref", default="")
    matrix_parser.add_argument("--mesh-repository", default="")
    matrix_parser.add_argument("--variant-filter", default="")
    matrix_parser.add_argument("--platform-filter", default="")
    matrix_parser.add_argument("--runner", default="github")
    matrix_parser.set_defaults(func=cmd_github_matrix)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
