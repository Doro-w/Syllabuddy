import { invoke } from "@tauri-apps/api/core";

/**
 * Reads a file from the local filesystem into an `ArrayBuffer` via the native
 * `read_document` command. Throws when the file cannot be read.
 */
export async function readFileBytes(path: string): Promise<ArrayBuffer> {
  return invoke<ArrayBuffer>("read_document", { path });
}
