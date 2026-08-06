use crate::error::AppError;
use auto_launch::AutoLaunchBuilder;
use std::env::current_exe;

const APP_NAME: &str = "tauri2-react-starter";

pub fn is_auto_launch_enabled() -> Result<bool, AppError> {
    let current_exe = current_exe().map_err(|e| AppError::io("current_exe", e))?;
    let auto = AutoLaunchBuilder::new()
        .set_app_name(APP_NAME)
        .set_app_path(&current_exe.to_string_lossy())
        .build()
        .map_err(|e| AppError::Config(format!("AutoLaunch build error: {e}")))?;

    auto.is_enabled()
        .map_err(|e| AppError::Config(format!("AutoLaunch check error: {e}")))
}

pub fn set_auto_launch_enabled(enabled: bool) -> Result<(), AppError> {
    let current_exe = current_exe().map_err(|e| AppError::io("current_exe", e))?;
    let auto = AutoLaunchBuilder::new()
        .set_app_name(APP_NAME)
        .set_app_path(&current_exe.to_string_lossy())
        .build()
        .map_err(|e| AppError::Config(format!("AutoLaunch build error: {e}")))?;

    if enabled {
        auto.enable()
            .map_err(|e| AppError::Config(format!("AutoLaunch enable error: {e}")))?;
    } else {
        auto.disable()
            .map_err(|e| AppError::Config(format!("AutoLaunch disable error: {e}")))?;
    }
    Ok(())
}
