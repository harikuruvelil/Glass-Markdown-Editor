// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::open_file,
            commands::open_file_path,
            commands::take_startup_file,
            commands::save_file,
            commands::save_file_as,
            commands::get_recent_files,
            commands::add_recent_file,
            commands::window_minimize,
            commands::window_toggle_maximize,
            commands::window_close,
            commands::window_start_dragging,
        ])
        .setup(|_app| {
            // Window effects will be handled via CSS backdrop-filter
            // Native Mica/Acrylic can be added later with window-vibrancy crate if needed
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
