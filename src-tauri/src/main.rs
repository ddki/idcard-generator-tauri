#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use std::sync::Mutex;
use std::time::Duration;

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

/// 显示并聚焦主窗口。
///
/// 先显示主窗口再关闭闪屏：顺序反过来会出现两者都不可见的空档，造成闪烁。
fn show_main_window(app: &AppHandle) {
	if let Some(main) = app.get_webview_window("main") {
		let _ = main.show();
		let _ = main.set_focus();
	}
}

#[tauri::command]
fn close_splashscreen(app: AppHandle) {
	show_main_window(&app);
	if let Some(splashscreen) = app.get_webview_window("splashscreen") {
		let _ = splashscreen.close();
	}
}

/// 闪屏兜底超时。
///
/// 开发构建首次启动还要跑 Vite 依赖预构建，明显慢于生产包，给更宽松的上限。
#[cfg(debug_assertions)]
const SPLASH_WATCHDOG_TIMEOUT: Duration = Duration::from_secs(30);
#[cfg(not(debug_assertions))]
const SPLASH_WATCHDOG_TIMEOUT: Duration = Duration::from_secs(15);

/// 闪屏兜底。
///
/// 闪屏窗口置顶且不进任务栏，一旦前端没能调用 `close_splashscreen`
/// （脚本异常、chunk 加载失败、渲染帧被节流等），用户既关不掉也找不到主窗口。
/// 这里后台轮询：正常关闭后立即退出，超过 `timeout` 仍未关闭则强制切到主窗口。
fn spawn_splash_watchdog(app: &AppHandle, timeout: Duration) {
	const INTERVAL: Duration = Duration::from_millis(500);

	let handle = app.clone();
	std::thread::spawn(move || {
		let mut waited = Duration::ZERO;
		while waited < timeout {
			std::thread::sleep(INTERVAL);
			waited += INTERVAL;
			if handle.get_webview_window("splashscreen").is_none() {
				return;
			}
		}

		eprintln!("[splash] 前端未在 {timeout:?} 内关闭闪屏，强制切换到主窗口");
		show_main_window(&handle);
		if let Some(splashscreen) = handle.get_webview_window("splashscreen") {
			// hide 保证主窗口立刻不再被置顶的闪屏遮挡，close 再销毁窗口
			let _ = splashscreen.hide();
			let _ = splashscreen.close();
		}
	});
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
			// 窗口可能尚未创建完成（用户快速重复启动），因此不能 unwrap
			show_main_window(app);
			let _ = app
				.notification()
				.builder()
				.title("This app is already running!")
				.body("You can find it in the tray menu.")
				.show();
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
				// 闪屏被关闭（正常切换或异常退出路径）：确保主窗口可见，
				// 避免留下“进程还在、但没有任何窗口”的状态
				if window.label() == "splashscreen" {
					let app = window.app_handle();
					if let Some(main) = app.get_webview_window("main") {
						if !main.is_visible().unwrap_or(true) {
							show_main_window(app);
						}
					}
					return;
				}

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
			// 闪屏兜底：前端若未能切到主窗口，超时后强制切换
			spawn_splash_watchdog(app.handle(), SPLASH_WATCHDOG_TIMEOUT);

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
