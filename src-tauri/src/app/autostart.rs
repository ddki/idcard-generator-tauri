//! 开机自启。
//!
//! Tauri v1 没有 autostart 插件，这里按平台各自实现：
//! - Windows：HKCU\Software\Microsoft\Windows\CurrentVersion\Run
//! - macOS：~/Library/LaunchAgents/<identifier>.plist
//! - Linux：~/.config/autostart/<identifier>.desktop

use tauri::AppHandle;

#[cfg(not(windows))]
use std::path::PathBuf;

#[cfg(any(target_os = "macos", target_os = "linux"))]
use std::fs;

/// 应用标识（Windows 注册表值名 / macOS Label / Linux desktop 文件名）
fn app_id(app: &AppHandle) -> String {
	app.config().tauri.bundle.identifier.clone()
}

fn executable() -> Result<String, String> {
	std::env::current_exe()
		.map(|path| path.display().to_string())
		.map_err(|error| format!("无法获取程序路径：{error}"))
}

#[cfg(windows)]
fn is_enabled(id: &str) -> bool {
	use winreg::enums::HKEY_CURRENT_USER;
	use winreg::RegKey;

	const RUN_KEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
	RegKey::predef(HKEY_CURRENT_USER)
		.open_subkey(RUN_KEY)
		.ok()
		.and_then(|key| key.get_value::<String, _>(id).ok())
		.is_some()
}

#[cfg(windows)]
fn set_enabled(id: &str, exe: &str, enabled: bool) -> Result<(), String> {
	use winreg::enums::{HKEY_CURRENT_USER, KEY_ALL_ACCESS};
	use winreg::RegKey;

	const RUN_KEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
	let key = RegKey::predef(HKEY_CURRENT_USER)
		.open_subkey_with_flags(RUN_KEY, KEY_ALL_ACCESS)
		.map_err(|error| format!("打开注册表失败：{error}"))?;

	if enabled {
		key.set_value(id, &format!("\"{exe}\""))
			.map_err(|error| format!("写入注册表失败：{error}"))
	} else {
		match key.delete_value(id) {
			Ok(()) => Ok(()),
			// 本来就没有自启项，视为成功
			Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
			Err(error) => Err(format!("删除注册表项失败：{error}")),
		}
	}
}

#[cfg(target_os = "macos")]
fn plist_path(app: &AppHandle, id: &str) -> Option<PathBuf> {
	let home = app.path_resolver().home_dir()?;
	Some(
		home.join("Library")
			.join("LaunchAgents")
			.join(format!("{id}.plist")),
	)
}

#[cfg(target_os = "macos")]
fn is_enabled(app: &AppHandle, id: &str) -> bool {
	plist_path(app, id)
		.map(|path| path.is_file())
		.unwrap_or(false)
}

#[cfg(target_os = "macos")]
fn set_enabled(app: &AppHandle, id: &str, exe: &str, enabled: bool) -> Result<(), String> {
	let path = plist_path(app, id).ok_or_else(|| "无法获取用户目录".to_string())?;

	if !enabled {
		return match fs::remove_file(&path) {
			Ok(()) => Ok(()),
			Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
			Err(error) => Err(format!("删除自启配置失败：{error}")),
		};
	}

	if let Some(parent) = path.parent() {
		fs::create_dir_all(parent)
			.map_err(|error| format!("创建 LaunchAgents 目录失败：{error}"))?;
	}
	let plist = format!(
		r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>{id}</string>
	<key>ProgramArguments</key>
	<array>
		<string>{exe}</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
</dict>
</plist>
"#
	);
	fs::write(&path, plist).map_err(|error| format!("写入自启配置失败：{error}"))
}

#[cfg(target_os = "linux")]
fn desktop_path(app: &AppHandle, id: &str) -> Option<PathBuf> {
	let config = app.path_resolver().app_config_dir().ok()?;
	// app_config_dir 形如 ~/.config/<identifier>，自启项要放在 ~/.config/autostart
	let base = config.parent()?.to_path_buf();
	Some(base.join("autostart").join(format!("{id}.desktop")))
}

#[cfg(target_os = "linux")]
fn is_enabled(app: &AppHandle, id: &str) -> bool {
	desktop_path(app, id)
		.map(|path| path.is_file())
		.unwrap_or(false)
}

#[cfg(target_os = "linux")]
fn set_enabled(app: &AppHandle, id: &str, exe: &str, enabled: bool) -> Result<(), String> {
	let path = desktop_path(app, id).ok_or_else(|| "无法获取配置目录".to_string())?;

	if !enabled {
		return match fs::remove_file(&path) {
			Ok(()) => Ok(()),
			Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
			Err(error) => Err(format!("删除自启配置失败：{error}")),
		};
	}

	if let Some(parent) = path.parent() {
		fs::create_dir_all(parent).map_err(|error| format!("创建 autostart 目录失败：{error}"))?;
	}
	let entry = format!(
		"[Desktop Entry]\nType=Application\nName={id}\nExec=\"{exe}\"\nTerminal=false\nX-GNOME-Autostart-enabled=true\n"
	);
	fs::write(&path, entry).map_err(|error| format!("写入自启配置失败：{error}"))
}

#[tauri::command]
pub fn autostart_is_enabled(app: AppHandle) -> bool {
	let id = app_id(&app);
	platform_is_enabled(&app, &id)
}

#[tauri::command]
pub fn autostart_set(app: AppHandle, enabled: bool) -> Result<bool, String> {
	let id = app_id(&app);
	let exe = executable()?;
	platform_set_enabled(&app, &id, &exe, enabled)?;
	Ok(platform_is_enabled(&app, &id))
}

#[cfg(windows)]
fn platform_is_enabled(_app: &AppHandle, id: &str) -> bool {
	is_enabled(id)
}

#[cfg(windows)]
fn platform_set_enabled(
	_app: &AppHandle,
	id: &str,
	exe: &str,
	enabled: bool,
) -> Result<(), String> {
	set_enabled(id, exe, enabled)
}

#[cfg(not(windows))]
fn platform_is_enabled(app: &AppHandle, id: &str) -> bool {
	is_enabled(app, id)
}

#[cfg(not(windows))]
fn platform_set_enabled(app: &AppHandle, id: &str, exe: &str, enabled: bool) -> Result<(), String> {
	set_enabled(app, id, exe, enabled)
}
