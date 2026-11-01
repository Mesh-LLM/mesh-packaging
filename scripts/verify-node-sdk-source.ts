#!/usr/bin/env -S node --experimental-strip-types
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Older immutable releases predate the product-directory split. */
export function resolveNodeSdkSource(sourceRoot: string): string {
  const candidates = ["mesh/sdk/node", "sdk/node"].map((directory) => resolve(sourceRoot, directory))
    .filter((path) => existsSync(join(path, "package.json")));
  if (candidates.length > 1) throw new Error("ambiguous upstream Node SDK source: both current and historical layouts exist");
  if (!candidates.length) throw new Error("upstream source contains neither mesh/sdk/node nor sdk/node package.json");
  return candidates[0];
}

function safePath(path: string): void {
  if (!path || path.startsWith("/") || path.includes("\\")
      || path.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error(`unsafe console asset path: ${path}`);
  }
}

function consoleFiles(directory: string, prefix = ""): string[] {
  return readdirSync(directory).flatMap((name) => {
    const relative = `${prefix}${name}`;
    if (relative.startsWith(".")) return [];
    const path = join(directory, name);
    const kind = lstatSync(path);
    if (kind.isDirectory()) return consoleFiles(path, `${relative}/`);
    if (!kind.isFile()) throw new Error(`console asset must be a regular file: ${relative}`);
    return relative === "manifest.txt" ? [] : [relative];
  });
}

function decodeAttribute(value: string): string {
  const named: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (_, entity: string) => {
    if (entity.startsWith("#")) {
      const hexadecimal = entity[1].toLowerCase() === "x";
      return String.fromCodePoint(parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10));
    }
    if (!Object.hasOwn(named, entity)) throw new Error(`unsupported console HTML entity: &${entity};`);
    return named[entity];
  });
}

/** Read src/href attributes in generated HTML, excluding comments and raw text. */
export function consoleReferences(html: string): string[] {
  const references: string[] = [];
  const tags = /<!--[\s\S]*?-->|<([a-z][a-z0-9:-]*)((?:[^"'<>]|"[^"]*"|'[^']*')*)>/gi;
  let consumed = 0;
  for (let tag = tags.exec(html); tag; tag = tags.exec(html)) {
    if (/<[a-z]/i.test(html.slice(consumed, tag.index))) throw new Error("malformed console HTML start tag");
    consumed = tags.lastIndex;
    if (!tag[1]) continue;
    const attributes = /([^\s=/'">]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    const seen = new Set<string>();
    for (const attribute of tag[2].matchAll(attributes)) {
      const name = attribute[1].toLowerCase();
      if (seen.has(name)) continue;
      seen.add(name);
      if (name !== "src" && name !== "href") continue;
      const value = decodeAttribute(attribute[2] ?? attribute[3] ?? attribute[4] ?? "").trim();
      if (!value || value.startsWith("#") || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) continue;
      const path = decodeURIComponent(value.split(/[?#]/, 1)[0]).replace(/^\//, "");
      if (path) {
        safePath(path);
        references.push(path);
      }
    }
    if (/^(script|style)$/i.test(tag[1])) {
      const closing = new RegExp(`</${tag[1]}\\s*>`, "gi");
      closing.lastIndex = tags.lastIndex;
      if (!closing.exec(html)) throw new Error(`unterminated console ${tag[1]} tag`);
      tags.lastIndex = closing.lastIndex;
      consumed = tags.lastIndex;
    }
  }
  if (/<[a-z]/i.test(html.slice(consumed))) throw new Error("malformed console HTML start tag");
  return references;
}

/** Verify packaged producer bytes without running or compiling upstream tooling. */
export function verifyNodeSdkSource(sourceRoot: string): string {
  const source = resolveNodeSdkSource(sourceRoot);
  const metadata = JSON.parse(readFileSync(join(source, "package.json"), "utf8"));
  if (!Array.isArray(metadata.files) || !metadata.files.includes("console/")) {
    throw new Error("Node SDK package.json must include console/ in files");
  }
  const consoleRoot = join(source, "console");
  if (!lstatSync(consoleRoot).isDirectory()) throw new Error("console root must be a real directory");
  const manifest = readFileSync(join(consoleRoot, "manifest.txt"), "utf8")
    .split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  manifest.forEach(safePath);
  if (!manifest.includes("index.html")) throw new Error("console manifest must include index.html");
  if (new Set(manifest).size !== manifest.length) throw new Error("console manifest contains duplicate paths");
  const actual = consoleFiles(consoleRoot).sort();
  if (JSON.stringify([...manifest].sort()) !== JSON.stringify(actual)) {
    throw new Error("console manifest does not match the packaged asset files");
  }
  if (!actual.some((path) => /^assets\/[^/]+\.js$/.test(path))) {
    throw new Error("console assets must include JavaScript under assets/");
  }
  for (const path of consoleReferences(readFileSync(join(consoleRoot, "index.html"), "utf8"))) {
    if (!actual.includes(path)) throw new Error(`console index references missing asset: ${path}`);
  }
  return source;
}

export function main(argv: string[]): number {
  try {
    if (argv.length !== 2 || argv[0] !== "--source-root" || !argv[1]) {
      throw new Error("usage: verify-node-sdk-source.ts --source-root SOURCE");
    }
    console.log(`verified Node SDK console assets: ${verifyNodeSdkSource(argv[1])}`);
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
