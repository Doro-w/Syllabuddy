import { open } from "@tauri-apps/plugin-dialog";

/**
 * Opens the native file picker and returns the path of the selected document.
 * Restricts selection to the supported document types (PDF, PPTX).
 * Resolves to `null` when the user cancels the dialog.
 */
export async function openDocumentPicker(): Promise<string | null> {
  return open({
    multiple: false,
    directory: false,
    title: "Open Document",
    filters: [{ name: "Documents", extensions: ["pdf", "pptx"] }],
  });
}
