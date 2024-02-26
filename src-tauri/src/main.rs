#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex};


use tauri::{Manager, State, WebviewWindow};

mod app;

struct SplashscreenWindow(Arc<Mutex<WebviewWindow>>);
struct MainWindow(Arc<Mutex<WebviewWindow>>);

#[tauri::command]
fn close_splashscreen(
	_: WebviewWindow, // force inference of P
	splashscreen: State<SplashscreenWindow>,
	main: State<MainWindow>,
) {
	// Close splashscreen
	splashscreen.0.lock().unwrap().close().unwrap();
	// Show main window
	main.0.lock().unwrap().show().unwrap();
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
			// set the splashscreen and main windows to be globally available with the tauri state API
			app.manage(SplashscreenWindow(Arc::new(Mutex::new(
				app.get_webview_window("splashscreen").unwrap(),
			))));
			app.manage(MainWindow(Arc::new(Mutex::new(
				app.get_webview_window("main").unwrap(),
			))));
			Ok(())
		})
		.invoke_handler(tauri::generate_handler![close_splashscreen])
		// 保持后端在后台运行
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
