use crate::error::AppError;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

pub fn setup_tray(app: &AppHandle) -> Result<(), AppError> {
    let show_item = MenuItemBuilder::with_id("show", "Show Main Window")
        .build(app)
        .map_err(|e| AppError::Message(e.to_string()))?;
    let hide_item = MenuItemBuilder::with_id("hide", "Hide to Tray")
        .build(app)
        .map_err(|e| AppError::Message(e.to_string()))?;
    let quit_item = MenuItemBuilder::with_id("quit", "Quit Application")
        .build(app)
        .map_err(|e| AppError::Message(e.to_string()))?;

    let menu = MenuBuilder::new(app)
        .item(&show_item)
        .item(&hide_item)
        .separator()
        .item(&quit_item)
        .build()
        .map_err(|e| AppError::Message(e.to_string()))?;

    let _tray = TrayIconBuilder::with_id("main-tray")
        .tooltip("Tauri 2 Starter")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "hide" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)
        .map_err(|e| AppError::Message(e.to_string()))?;

    Ok(())
}
