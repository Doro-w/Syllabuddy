import type { DocumentType } from "../types/document";
import { basename } from "./path";

const EXTENSIONS: Record<string, DocumentType> = {
  pdf: "pdf",
  pptx: "pptx",
};

/**
 * Maps a file path to its document type based on the file extension.
 * Returns `null` for unsupported or extension-less paths.
 */
export function detectDocumentType(path: string): DocumentType | null {
  const fileName = basename(path);
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) {
    return null;
  }
  return EXTENSIONS[extension] ?? null;
}
