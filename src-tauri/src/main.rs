#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use tauri::{AppHandle, Manager};

mod app;

#[tauri::command]
fn close_splashscreen(app: AppHandle) {
	println!("close-splashscreen");
	// Close splashscreen
	if let Some(splashscreen) = app.get_webview_window("splashscreen") {
		splashscreen.close().unwrap();
	}
	// Show main window
	app.get_webview_window("main").unwrap().show().unwrap();
}

fn main() {
	tauri::Builder::default()
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
			println!("{}, {argv:?}, {cwd}", app.package_info().name);
		}))
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_updater::Builder::new().build())
		.on_window_event(|window, event| match event {
			tauri::WindowEvent::CloseRequested { api, .. } => {
				window.hide().unwrap();
				api.prevent_close();
			}
			_ => {}
		})
		.setup(|app| {
			// 设置任务栏图标
			#[cfg(all(desktop))]
			{
				let handle = app.handle();
				app::tray::create_tray(handle)?;
			}
			Ok(())
		})
		.invoke_handler(tauri::generate_handler![close_splashscreen])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
