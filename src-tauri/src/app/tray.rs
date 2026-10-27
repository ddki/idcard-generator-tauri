use tauri::{
	menu::{Menu, MenuItem},
	tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
	AppHandle, Emitter, Manager, Runtime,
};

use crate::app;

pub fn create_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
	let setting = MenuItem::with_id(app, "setting", "设置", true, None::<&str>)?;
	let check_update = MenuItem::with_id(app, "check_update", "检查更新", true, None::<&str>)?;
	let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
	let menus = Menu::with_items(app, &[&setting, &check_update, &quit])?;

	let _ = TrayIconBuilder::with_id("tary")
		.tooltip("证件生成器")
		.icon(app.default_window_icon().unwrap().clone())
		.menu(&menus)
		.show_menu_on_left_click(true)
		.on_menu_event(move |app, event| match event.id.as_ref() {
			"setting" => {
				// 设置已经是主页内的弹窗，这里把主窗口带到前台并通知前端打开它
				if let Some(window) = app.get_webview_window("main") {
					let _ = window.show();
					let _ = window.unminimize();
					let _ = window.set_focus();
				}
				let _ = app.emit("open-setting", ());
			}
			"check_update" => {
				println!("check update ....");
				app::updater::check_update(app.clone());
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
					let _ = window.show();
					let _ = window.set_focus();
				}
			}
		})
		.build(app);

	Ok(())
}
