use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_updater::UpdaterExt;

pub fn check_update<R: Runtime>(app: AppHandle<R>) {
	tauri::async_runtime::spawn(async move {
		let mut builder = app.app_handle().updater_builder();
		if std::env::var("TARGET").unwrap_or_default() == "nsis" {
			// /D sets the default installation directory ($INSTDIR),
			// overriding InstallDir and InstallDirRegKey.
			// It must be the last parameter used in the command line and must not contain any quotes, even if the path contains spaces.
			// Only absolute paths are supported.
			// NOTE: we only need this because this is an integration test and we don't want to install the app in the programs folder
			builder = builder.installer_args(vec![format!(
				"/D={}",
				tauri::utils::platform::current_exe()
					.unwrap()
					.parent()
					.unwrap()
					.display()
			)]);
		}
		let updater = builder.build().unwrap();

		match updater.check().await {
			Ok(Some(update)) => {
				if let Err(e) = update.download_and_install(|_, _| {}, || {}).await {
					println!("下载并安装发生异常：{e}");
					let _ = tauri_plugin_dialog::MessageDialogBuilder::new(
						app.dialog().clone(),
						"警告",
						"下载并安装时发生了错误，请确保可以连接更新服务器",
					)
					.kind(tauri_plugin_dialog::MessageDialogKind::Error)
					.show(|_| {});
					// std::process::exit(1);
				}
				std::process::exit(0);
			}
			Ok(None) => {
				std::process::exit(0);
			}
			Err(e) => {
				println!("获取更新发生异常：{e}");
				// std::process::exit(1);
				tauri_plugin_dialog::MessageDialogBuilder::new(
					app.dialog().clone(),
					"警告",
					"获取更新失败，无法连接更新服务（GitHub Gist）",
				)
				.kind(tauri_plugin_dialog::MessageDialogKind::Error)
				.show(|_| {});
			}
		}
	});
}
