#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use std::sync::Mutex;

use tauri::{AppHandle, Manager, State, WindowEvent};

mod app;

/// 运行期设置状态。
/// 用内存状态而不是每次读设置文件，是为了让开关切换后立刻对“关闭窗口”生效。
#[derive(Default)]
struct RuntimeSettings {
	close_to_tray: Mutex<bool>,
}

#[tauri::command]
fn close_splashscreen(app: AppHandle) {
	// 先显示并聚焦主窗口，再关闭闪屏：顺序反过来会出现两者都不可见的空档，造成闪烁
	if let Some(main) = app.get_window("main") {
		let _ = main.show();
		let _ = main.set_focus();
	}
	if let Some(splashscreen) = app.get_window("splashscreen") {
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
	// 单实例：抢不到端口的进程说明已有实例在跑，唤醒它之后直接退出
	let instance = app::single_instance::acquire();
	if matches!(instance, app::single_instance::Instance::Secondary) {
		return;
	}

	tauri::Builder::default()
		.on_window_event(|event| {
			if let WindowEvent::CloseRequested { api, .. } = event.event() {
				let window = event.window();

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
		.setup(move |app| {
			let handle = app.handle();

			// 用持久化设置初始化运行期状态，默认关闭
			let settings = app::settings::init(&handle);
			let close_to_tray = settings
				.get_bool(&[
					app::settings::CLOSE_TO_TRAY,
					app::settings::LEGACY_CLOSE_TO_TRAY,
				])
				.unwrap_or(false);
			app.manage(settings);
			app.manage(RuntimeSettings {
				close_to_tray: Mutex::new(close_to_tray),
			});

			// 存储目录与历史记录
			app.manage(app::storage::init(&handle)?);

			// 设置任务栏图标
			app::tray::create(&handle)?;

			// 已有实例再次启动时，由这里把主窗口唤回前台
			if let app::single_instance::Instance::Primary(listener) = instance {
				app::single_instance::listen(listener, handle.clone());
			}

			Ok(())
		})
		.invoke_handler(tauri::generate_handler![
			close_splashscreen,
			set_close_to_tray,
			app::autostart::autostart_is_enabled,
			app::autostart::autostart_set,
			app::settings::settings_load,
			app::settings::settings_save,
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
