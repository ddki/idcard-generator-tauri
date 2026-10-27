use tauri::{AppHandle, Runtime};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use tauri_plugin_updater::UpdaterExt;

fn show_message<R: Runtime>(app: &AppHandle<R>, title: &str, message: &str) {
	app.dialog()
		.message(message.to_string())
		.title(title.to_string())
		.kind(MessageDialogKind::Info)
		.show(|_| {});
}

/// 检查更新（托盘菜单入口）。
///
/// 只有真正完成安装才退出进程；没有更新或检查失败时仅提示，
/// 绝不能退出程序——否则用户点一次“检查更新”就把应用关掉了。
pub fn check_update<R: Runtime>(app: AppHandle<R>) {
	tauri::async_runtime::spawn(async move {
		let updater = match app.updater() {
			Ok(updater) => updater,
			Err(error) => {
				show_message(&app, "检查更新失败", &format!("更新组件初始化失败：{error}"));
				return;
			}
		};

		let update = match updater.check().await {
			Ok(update) => update,
			Err(error) => {
				show_message(
					&app,
					"检查更新失败",
					&format!("无法连接更新服务，请检查网络后重试。\n\n{error}"),
				);
				return;
			}
		};

		let Some(update) = update else {
			show_message(&app, "检查更新", "当前已是最新版本");
			return;
		};

		// 询问用户，避免托盘点一下就静默安装
		let dialog_app = app.clone();
		let prompt = format!(
			"当前版本 {}，最新版本 {}。\n\n是否立即下载并安装？",
			update.current_version, update.version
		);
		let confirmed = tauri::async_runtime::spawn_blocking(move || {
			dialog_app
				.dialog()
				.message(prompt)
				.title("发现新版本")
				.buttons(MessageDialogButtons::OkCancelCustom(
					"立即更新".to_string(),
					"稍后".to_string(),
				))
				.blocking_show()
		})
		.await
		.unwrap_or(false);

		if !confirmed {
			return;
		}

		if let Err(error) = update.download_and_install(|_, _| {}, || {}).await {
			show_message(
				&app,
				"更新失败",
				&format!("下载或安装时发生错误，请确认可以连接更新服务器。\n\n{error}"),
			);
			return;
		}

		// 安装完成后退出，由安装程序接管
		app.exit(0);
	});
}
