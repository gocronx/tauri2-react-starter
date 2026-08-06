pub mod auto_launch;
pub mod commands;
pub mod database;
pub mod error;
pub mod panic_hook;
pub mod services;
pub mod tray;

use database::Database;
use panic_hook::setup_panic_hook;
#[cfg(any(debug_assertions, test))]
use specta_typescript::Typescript;
use tauri::Manager;
use tauri_specta::{collect_commands, Builder};

pub fn specta_builder() -> Builder<tauri::Wry> {
    Builder::<tauri::Wry>::new().commands(collect_commands![
        // App commands
        commands::app::get_app_info,
        commands::app::get_system_stats,
        commands::app::open_logs_directory,
        commands::app::open_data_directory,
        commands::app::backup_database,
        commands::app::restore_database,
        // Settings commands
        commands::settings::get_setting,
        commands::settings::set_setting,
        commands::settings::get_all_settings,
        commands::settings::get_auto_launch,
        commands::settings::set_auto_launch,
        // Record CRUD commands
        commands::record::list_records,
        commands::record::get_record,
        commands::record::create_record,
        commands::record::update_record,
        commands::record::delete_record,
    ])
}

pub fn run() {
    setup_panic_hook();

    let db = Database::init_default().expect("Failed to initialize database");
    let builder = specta_builder();

    #[cfg(debug_assertions)]
    {
        let export_path =
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../src/lib/api/bindings.ts");
        let _ = std::fs::create_dir_all(export_path.parent().unwrap());
        builder
            .export(Typescript::default(), export_path)
            .expect("Failed to export typescript bindings");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .manage(db)
        .setup(|app| {
            // 设置系统托盘
            if let Err(e) = tray::setup_tray(app.handle()) {
                log::error!("Failed to setup system tray: {e}");
            }
            Ok(())
        })
        .invoke_handler(builder.invoke_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_export_specta_bindings() {
        let builder = specta_builder();
        let export_path =
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../src/lib/api/bindings.ts");
        let _ = std::fs::create_dir_all(export_path.parent().unwrap());
        builder
            .export(Typescript::default(), export_path)
            .expect("Failed to export typescript bindings");
    }

    #[test]
    fn test_tauri_conf_and_plugins_validity() {
        let conf_str = include_str!("../tauri.conf.json");
        let conf: serde_json::Value =
            serde_json::from_str(conf_str).expect("tauri.conf.json is not valid JSON");

        // 校验 updater 插件配置
        if let Some(updater) = conf.get("plugins").and_then(|p| p.get("updater")) {
            assert!(
                updater.get("pubkey").is_some(),
                "tauri.conf.json: plugins.updater missing required `pubkey` field"
            );
            assert!(
                updater.get("endpoints").is_some(),
                "tauri.conf.json: plugins.updater missing required `endpoints` field"
            );
        }
    }
}
