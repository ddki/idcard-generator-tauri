#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use std::sync::Mutex;

use tauri::{AppHandle, Manager, State};
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_store::StoreExt;

mod app;

/// 运行期设置状态。
/// 用内存状态而不是每次读 store 文件，是为了让开关切换后立刻对“关闭窗口”生效，
/// 同时避开 plugin-store 实例缓存导致的读到旧值的问题。
#[derive(Default)]
struct RuntimeSettings {
	close_to_tray: Mutex<bool>,
}

#[tauri::command]
fn close_splashscreen(app: AppHandle) {
	// 先显示并聚焦主窗口，再关闭闪屏：顺序反过来会出现两者都不可见的空档，造成闪烁
	if let Some(main) = app.get_webview_window("main") {
		let _ = main.show();
		let _ = main.set_focus();
	}
	if let Some(splashscreen) = app.get_webview_window("splashscreen") {
		let _ = splashscreen.close();
	}
}

/// 前端切换“后台常驻”时调用，即时生效。
#[tauri::command]
fn set_close_to_tray(state: State<'_, RuntimeSettings>, enabled: bool) {
	if let Ok(mut value) = state.close_to_tray.lock() {
		*value = enabled;
	}
}

fn main() {
	tauri::Builder::default()
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_notification::init())
		.plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
			println!("{}, {argv:?}, {cwd}", app.package_info().name);
			app.get_webview_window("main").unwrap().show().unwrap();
			app.notification()
				.builder()
				.title("This app is already running!")
				.body("You can find it in the tray menu.")
				.show()
				.unwrap();
		}))
		.plugin(tauri_plugin_store::Builder::default().build())
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_updater::Builder::new().build())
		.plugin(tauri_plugin_autostart::init(
			tauri_plugin_autostart::MacosLauncher::LaunchAgent,
			None,
		))
		.on_window_event(|window, event| {
			if let tauri::WindowEvent::CloseRequested { api, .. } = event {
				// 只有主窗口受“后台常驻”开关控制，启动画面等窗口正常关闭
				if window.label() != "main" {
					return;
				}

				let keep_running = window
					.state::<RuntimeSettings>()
					.close_to_tray
					.lock()
					.map(|value| *value)
					.unwrap_or(false);

				if keep_running {
					let _ = window.hide();
					api.prevent_close();
				} else {
					window.app_handle().exit(0);
				}
			}
		})
		.setup(|app| {
			// 用持久化设置初始化运行期状态，默认关闭
			let close_to_tray = app
				.store("settings.json")
				.ok()
				.and_then(|store| store.get("close-to-tray"))
				.and_then(|value| value.as_bool())
				.unwrap_or(false);
			app.manage(RuntimeSettings {
				close_to_tray: Mutex::new(close_to_tray),
			});

			// 存储目录与历史记录
			app.manage(app::storage::init(app.handle())?);

			// 设置任务栏图标
			#[cfg(all(desktop))]
			{
				app::tray::create_tray(app.handle())?;
			}
			Ok(())
		})
		.invoke_handler(tauri::generate_handler![
			close_splashscreen,
			set_close_to_tray,
			app::storage::storage_info,
			app::storage::set_data_dir,
			app::storage::reset_data_dir,
			app::storage::clear_cache,
			app::storage::history_load,
			app::storage::history_save,
			app::storage::history_clear
		])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
