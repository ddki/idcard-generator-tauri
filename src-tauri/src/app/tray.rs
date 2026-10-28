use tauri::{
	AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
	SystemTrayMenuItem,
};

use crate::app;

/// 托盘菜单项 id
const MENU_SETTING: &str = "setting";
const MENU_CHECK_UPDATE: &str = "check_update";
const MENU_QUIT: &str = "quit";

/// 创建托盘。图标取自 tauri.conf.json 的 `tauri.systemTray.iconPath`。
pub fn create(app: &AppHandle) -> tauri::Result<()> {
	let handle = app.clone();

	let menu = SystemTrayMenu::new()
		.add_item(CustomMenuItem::new(MENU_SETTING, "设置"))
		.add_native_item(SystemTrayMenuItem::Separator)
		.add_item(CustomMenuItem::new(MENU_CHECK_UPDATE, "检查更新"))
		.add_native_item(SystemTrayMenuItem::Separator)
		.add_item(CustomMenuItem::new(MENU_QUIT, "退出"));

	let _ = SystemTray::new()
		.with_menu(menu)
		.with_tooltip("证件生成器")
		.on_event(move |event| match event {
			SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
				MENU_SETTING => {
					// 设置已经是主页内的弹窗，这里把主窗口带到前台并通知前端打开它
					app::focus_main(&handle);
					let _ = handle.emit_all("open-setting", ());
				}
				MENU_CHECK_UPDATE => {
					// 更新流程由前端驱动（检查/确认/安装），这里只负责唤起窗口
					app::focus_main(&handle);
					let _ = handle.emit_all("check-update", ());
				}
				MENU_QUIT => handle.exit(0),
				_ => {}
			},
			SystemTrayEvent::LeftClick { .. } => app::focus_main(&handle),
			_ => {}
		})
		.build(app)?;

	Ok(())
}
