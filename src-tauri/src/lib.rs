use tauri::ipc::Response;

/// Reads a document file from disk and returns its raw bytes.
/// The path is validated by the caller (it originates from the native
/// file picker, never from user-typed input).
#[tauri::command]
fn read_document(path: String) -> Result<Response, String> {
    let bytes = std::fs::read(&path).map_err(|e| format!("failed to read {path}: {e}"))?;
    Ok(Response::new(bytes))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_document])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
