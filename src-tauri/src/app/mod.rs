pub mod autostart;
pub mod settings;
pub mod single_instance;
pub mod storage;
pub mod tray;

use tauri::Manager;

/// 把主窗口带回前台（托盘点击、二次启动都走这里）。
pub fn focus_main(app: &tauri::AppHandle) {
	if let Some(window) = app.get_window("main") {
		let _ = window.show();
		let _ = window.unminimize();
		let _ = window.set_focus();
	}
}
