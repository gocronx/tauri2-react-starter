use crate::error::AppError;
use crate::panic_hook::{get_app_dir, get_logs_dir};
use serde::{Deserialize, Serialize};
use specta::Type;
use tauri::{command, AppHandle};

#[derive(Debug, Serialize, Deserialize, Type)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub platform: String,
    pub arch: String,
    pub app_dir: String,
    pub logs_dir: String,
}

#[derive(Debug, Serialize, Deserialize, Type)]
pub struct SystemStats {
    pub os: String,
    pub arch: String,
    pub num_cpus: u32,
    pub app_version: String,
}

#[command]
#[specta::specta]
pub fn get_app_info() -> Result<AppInfo, AppError> {
    Ok(AppInfo {
        name: "tauri2-react-starter".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        app_dir: get_app_dir().to_string_lossy().to_string(),
        logs_dir: get_logs_dir().to_string_lossy().to_string(),
    })
}

#[command]
#[specta::specta]
pub fn get_system_stats() -> Result<SystemStats, AppError> {
    Ok(SystemStats {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        num_cpus: std::thread::available_parallelism()
            .map(|n| n.get() as u32)
            .unwrap_or(1),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[command]
#[specta::specta]
pub async fn open_logs_directory(app: AppHandle) -> Result<(), AppError> {
    use tauri_plugin_opener::OpenerExt;
    let log_dir = get_logs_dir();
    let _ = std::fs::create_dir_all(&log_dir);
    app.opener()
        .open_path(log_dir.to_string_lossy().as_ref(), None::<&str>)
        .map_err(|e| AppError::Message(format!("Failed to open logs directory: {e}")))?;
    Ok(())
}

#[command]
#[specta::specta]
pub async fn open_data_directory(app: AppHandle) -> Result<(), AppError> {
    use tauri_plugin_opener::OpenerExt;
    let data_dir = get_app_dir();
    let _ = std::fs::create_dir_all(&data_dir);
    app.opener()
        .open_path(data_dir.to_string_lossy().as_ref(), None::<&str>)
        .map_err(|e| AppError::Message(format!("Failed to open data directory: {e}")))?;
    Ok(())
}

#[command]
#[specta::specta]
pub async fn backup_database(
    target_path: String,
    db: tauri::State<'_, crate::database::Database>,
) -> Result<String, AppError> {
    let path = std::path::PathBuf::from(target_path);
    db.backup_to(&path)?;
    Ok(format!("数据库已成功热备份到: {}", path.display()))
}

#[command]
#[specta::specta]
pub async fn restore_database(
    source_path: String,
    db: tauri::State<'_, crate::database::Database>,
) -> Result<String, AppError> {
    let path = std::path::PathBuf::from(source_path);
    db.restore_from(&path)?;
    Ok(format!("数据库已成功从备份恢复: {}", path.display()))
}
