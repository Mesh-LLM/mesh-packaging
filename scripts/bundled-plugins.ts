import { lstatSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/** The producer stores unchanged plugin release archives in one flat directory. */
export function isBundledPluginArchiveName(name: string): boolean {
  return /^[a-z0-9][a-z0-9._+-]*\.tar\.gz$/.test(name);
}

/**
 * Validate the producer's archive-only layout without inventing a second plugin
 * manifest. The verified upstream archive checksum binds these bytes; the
 * bundled host checks each default plugin against its compiled release pin.
 */
export function validateBundledPlugins(bundle: string): void {
  const directory = resolve(bundle, "plugins");
  const directoryInfo = lstatSync(directory, { throwIfNoEntry: false });
  if (!directoryInfo) return;
  if (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink()) {
    throw new Error("bundled plugins must be a regular directory");
  }
  const names = readdirSync(directory);
  if (names.length === 0) throw new Error("bundled plugins directory must contain release archives");
  for (const name of names) {
    if (!isBundledPluginArchiveName(name)) throw new Error(`unexpected bundled plugin entry: ${name}`);
    const info = lstatSync(resolve(directory, name));
    if (!info.isFile() || info.isSymbolicLink() || info.size === 0) {
      throw new Error(`bundled plugin must be a nonempty regular archive: ${name}`);
    }
  }
}
