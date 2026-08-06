use crate::auto_launch::{is_auto_launch_enabled, set_auto_launch_enabled};
use crate::database::dao::settings::SettingsDao;
use crate::database::Database;
use crate::error::AppError;
use std::collections::HashMap;
use tauri::{command, State};

#[command]
#[specta::specta]
pub fn get_setting(db: State<'_, Database>, key: String) -> Result<Option<String>, AppError> {
    SettingsDao::get(&db, &key)
}

#[command]
#[specta::specta]
pub fn set_setting(db: State<'_, Database>, key: String, value: String) -> Result<(), AppError> {
    SettingsDao::set(&db, &key, &value)
}

#[command]
#[specta::specta]
pub fn get_all_settings(db: State<'_, Database>) -> Result<HashMap<String, String>, AppError> {
    SettingsDao::get_all(&db)
}

#[command]
#[specta::specta]
pub fn get_auto_launch() -> Result<bool, AppError> {
    is_auto_launch_enabled()
}

#[command]
#[specta::specta]
pub fn set_auto_launch(enabled: bool) -> Result<(), AppError> {
    set_auto_launch_enabled(enabled)
}
