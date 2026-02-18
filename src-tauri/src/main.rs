// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
use tauri::{image::Image, Manager};

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
        .setup(|app| {
            // Ensure the runtime window/taskbar icon is explicitly set to the bundled icon.
            // This avoids Windows falling back to a generic placeholder icon.
            let app_icon = Image::from_bytes(include_bytes!("../icons/icon.png"))?;
            if let Some(window) = app.get_webview_window("main") {
                window.set_icon(app_icon)?;
            }

            // Window effects are handled via CSS backdrop-filter.
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
