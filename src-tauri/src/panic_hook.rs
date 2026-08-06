use chrono::Local;
use std::fs::{create_dir_all, OpenOptions};
use std::io::Write;
use std::panic;
use std::path::PathBuf;

pub fn get_app_dir() -> PathBuf {
    dirs::home_dir()
        .map(|h| h.join(".tauri2-react-starter"))
        .unwrap_or_else(|| PathBuf::from("."))
}

pub fn get_logs_dir() -> PathBuf {
    get_app_dir().join("logs")
}

pub fn setup_panic_hook() {
    panic::set_hook(Box::new(|info| {
        let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();
        let payload = if let Some(s) = info.payload().downcast_ref::<&str>() {
            s.to_string()
        } else if let Some(s) = info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            "Unknown panic payload".to_string()
        };

        let location = info
            .location()
            .map(|l| format!("{}:{}:{}", l.file(), l.line(), l.column()))
            .unwrap_or_else(|| "unknown location".to_string());

        let backtrace = std::backtrace::Backtrace::capture();
        let log_msg = format!(
            "[{timestamp}] [PANIC] {payload}\nLocation: {location}\nBacktrace:\n{backtrace:?}\n\n"
        );

        eprintln!("{log_msg}");

        let log_dir = get_logs_dir();
        if create_dir_all(&log_dir).is_ok() {
            let log_file = log_dir.join("panic.log");
            if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(log_file) {
                let _ = file.write_all(log_msg.as_bytes());
            }
        }
    }));
}
