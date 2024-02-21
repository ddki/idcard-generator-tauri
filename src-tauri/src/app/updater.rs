use tauri::{
	api::dialog::{blocking::ask, message},
	AppHandle, Manager, Runtime,
};

#[tauri::command]
pub async fn check_update(handle: AppHandle) {
	check_update_with_dialog(handle).await;
}

pub async fn check_update_with_dialog<R: Runtime>(handle: AppHandle<R>) {
	let win = handle.get_window("main").unwrap();
	let package_info = handle.package_info().clone();
	match tauri::updater::builder(handle.clone()).check().await {
		Ok(update) => {
			if update.is_update_available() {
				let should_update = ask(
					Some(&win),
					"新版本",
					format!(
						r#"{}有新版本{}，当前版本{}。

是否现在进行安装？

更新日志:
{}"#,
						&package_info.name,
						update.latest_version(),
						update.current_version().to_string(),
						update.body().unwrap_or(&("".into()))
					),
				);
				if should_update {
					let res = update.download_and_install().await;
					if res.is_err() {
						message(Some(&win), "错误", "无法更新");
					} else {
						let should_restart =
							ask(Some(&win), "准备重启", "成功安装新版本，是否重启程序？");
						if should_restart {
							handle.restart();
						}
					}
				}
			} else {
				message(Some(&win), "提示", "没有可用更新");
			}
		}
		Err(e) => {
			println!("failed to get update: {}", e);
			message(Some(&win), "网络异常", "连接Github失败");
		}
	}
}
