use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::{command, AppHandle, Manager, WebviewWindow};
use tauri_plugin_dialog::DialogExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileContent {
    pub path: String,
    pub content: String,
}

#[command]
pub async fn open_file(app: AppHandle) -> Result<Option<FileContent>, String> {
    let Some(file_path) = app
        .dialog()
        .file()
        .add_filter("Markdown", &["md", "markdown"])
        .add_filter("All Files", &["*"])
        .blocking_pick_file()
    else {
        return Ok(None);
    };

    let path_buf = file_path
        .into_path()
        .map_err(|e| format!("Invalid file path: {}", e))?;

    let content = open_file_from_path_internal(&app, path_buf).await?;
    Ok(Some(content))
}

#[command]
pub async fn open_file_path(app: AppHandle, path: String) -> Result<FileContent, String> {
    open_file_from_path_internal(&app, PathBuf::from(path)).await
}

#[command]
pub async fn take_startup_file(app: AppHandle) -> Result<Option<FileContent>, String> {
    let Some(path) = get_startup_markdown_path() else {
        return Ok(None);
    };

    let content = open_file_from_path_internal(&app, path).await?;
    Ok(Some(content))
}

#[command]
pub async fn save_file(_app: AppHandle, path: String, content: String) -> Result<(), String> {
    let path_buf = PathBuf::from(&path);

    std::fs::write(&path_buf, content)
        .map_err(|e| format!("Failed to save file: {}", e))?;

    Ok(())
}

#[command]
pub async fn save_file_as(app: AppHandle, content: String) -> Result<Option<String>, String> {
    let Some(file_path) = app
        .dialog()
        .file()
        .set_file_name("untitled.md")
        .add_filter("Markdown", &["md", "markdown"])
        .blocking_save_file()
    else {
        return Ok(None);
    };

    let path_buf = file_path
        .into_path()
        .map_err(|e| format!("Invalid file path: {}", e))?;

    std::fs::write(&path_buf, content)
        .map_err(|e| format!("Failed to save file: {}", e))?;

    let path_str = path_buf.to_string_lossy().to_string();
    
    // Add to recent files
    if let Err(e) = add_recent_file_internal(&app, &path_str).await {
        eprintln!("Failed to add to recent files: {}", e);
    }

    Ok(Some(path_str))
}

#[command]
pub async fn get_recent_files(app: AppHandle) -> Result<Vec<String>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let recent_files_path = app_data_dir.join("recent_files.json");
    
    if !recent_files_path.exists() {
        return Ok(vec![]);
    }

    let content = std::fs::read_to_string(&recent_files_path)
        .map_err(|e| format!("Failed to read recent files: {}", e))?;
    
    let files: Vec<String> = serde_json::from_str(&content)
        .unwrap_or_else(|_| vec![]);

    Ok(files)
}

#[command]
pub async fn add_recent_file(app: AppHandle, path: String) -> Result<(), String> {
    add_recent_file_internal(&app, &path).await
}

async fn add_recent_file_internal(app: &AppHandle, path: &str) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data dir: {}", e))?;
    
    let recent_files_path = app_data_dir.join("recent_files.json");
    
    let mut files: Vec<String> = if recent_files_path.exists() {
        let content = std::fs::read_to_string(&recent_files_path)
            .map_err(|e| format!("Failed to read recent files: {}", e))?;
        serde_json::from_str(&content).unwrap_or_else(|_| vec![])
    } else {
        vec![]
    };

    // Remove if already exists, then add to front
    files.retain(|f| f != path);
    files.insert(0, path.to_string());
    
    // Keep only last 10
    files.truncate(10);

    let content = serde_json::to_string_pretty(&files)
        .map_err(|e| format!("Failed to serialize recent files: {}", e))?;
    
    std::fs::write(&recent_files_path, content)
        .map_err(|e| format!("Failed to write recent files: {}", e))?;

    Ok(())
}

async fn open_file_from_path_internal(app: &AppHandle, path: PathBuf) -> Result<FileContent, String> {
    let resolved_path = if path.is_absolute() {
        path
    } else {
        std::env::current_dir()
            .map_err(|e| format!("Failed to resolve current directory: {}", e))?
            .join(path)
    };

    if !resolved_path.exists() || !resolved_path.is_file() {
        return Err(format!("File not found: {}", resolved_path.display()));
    }

    let content = std::fs::read_to_string(&resolved_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let path_str = resolved_path.to_string_lossy().to_string();

    if let Err(e) = add_recent_file_internal(app, &path_str).await {
        eprintln!("Failed to add to recent files: {}", e);
    }

    Ok(FileContent {
        path: path_str,
        content,
    })
}

fn get_startup_markdown_path() -> Option<PathBuf> {
    std::env::args_os().skip(1).find_map(|arg| {
        let path = PathBuf::from(arg);
        if path.is_file() && is_markdown_file(&path) {
            Some(path)
        } else {
            None
        }
    })
}

fn is_markdown_file(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| matches!(ext.to_ascii_lowercase().as_str(), "md" | "markdown"))
        .unwrap_or(false)
}

#[command]
pub fn window_minimize(window: WebviewWindow) -> Result<(), String> {
    window
        .minimize()
        .map_err(|e| format!("Failed to minimize window: {}", e))
}

#[command]
pub fn window_toggle_maximize(window: WebviewWindow) -> Result<(), String> {
    let is_maximized = window
        .is_maximized()
        .map_err(|e| format!("Failed to query maximize state: {}", e))?;

    if is_maximized {
        window
            .unmaximize()
            .map_err(|e| format!("Failed to unmaximize window: {}", e))
    } else {
        window
            .maximize()
            .map_err(|e| format!("Failed to maximize window: {}", e))
    }
}

#[command]
pub fn window_close(window: WebviewWindow) -> Result<(), String> {
    window
        .close()
        .map_err(|e| format!("Failed to close window: {}", e))
}

#[command]
pub fn window_start_dragging(window: WebviewWindow) -> Result<(), String> {
    window
        .start_dragging()
        .map_err(|e| format!("Failed to start dragging: {}", e))
}
