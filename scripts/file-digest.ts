import { createHash } from "node:crypto";
import { closeSync, openSync, readSync } from "node:fs";

/** Hash large release files without retaining an entire package in memory. */
export function fileDigest(path: string): string {
  const hash = createHash("sha256");
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  const file = openSync(path, "r");
  try {
    for (let count = readSync(file, buffer); count > 0; count = readSync(file, buffer)) {
      hash.update(buffer.subarray(0, count));
    }
    return hash.digest("hex");
  } finally {
    closeSync(file);
  }
}
