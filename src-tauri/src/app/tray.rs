use tauri::{
	menu::{Menu, MenuItem},
	tray::{ClickType, TrayIconBuilder},
	AppHandle, Manager, Runtime,
};

use crate::app;

pub fn create_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
	let _setting = MenuItem::with_id(app, "setting", "设置", true, None::<&str>)?;
	let check_update = MenuItem::with_id(app, "check_update", "检查更新", true, None::<&str>)?;
	let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
	let menus = Menu::with_items(app, &[&check_update, &quit])?;

	let _ = TrayIconBuilder::with_id("tary")
		.tooltip("证件生成器")
		.icon(app.default_window_icon().unwrap().clone())
		.menu(&menus)
		.menu_on_left_click(true)
		.on_menu_event(move |app, event| match event.id.as_ref() {
			"setting" => {
				println!("open setting...");
				if let Some(window) = app.get_webview_window("setting") {
					let _ = window.show();
					let _ = window.set_focus();
				}
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
			if event.click_type == ClickType::Left {
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
