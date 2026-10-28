//! 轻量设置存储：直接用 JSON 文件替代 Tauri v2 的 store 插件。
//!
//! 文件结构与旧版 store 插件写出的内容保持一致（扁平 key-value），
//! 这样从 v2 版本升级过来的用户不会丢设置。

use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde_json::Value;
use tauri::{AppHandle, State};

pub const SETTINGS_FILE: &str = "settings.json";

/// 后台常驻开关的键名
pub const CLOSE_TO_TRAY: &str = "close-to-tray";
/// v1 之前写在 single-instance 键下，读取时兼容一次
pub const LEGACY_CLOSE_TO_TRAY: &str = "single-instance";

pub struct SettingsState {
	path: PathBuf,
	data: Mutex<BTreeMap<String, Value>>,
}

fn read_settings(path: &Path) -> BTreeMap<String, Value> {
	fs::read_to_string(path)
		.ok()
		.and_then(|content| serde_json::from_str::<BTreeMap<String, Value>>(&content).ok())
		.unwrap_or_default()
}

/// 先写临时文件再替换，避免写到一半断电/崩溃把设置文件写坏
fn write_settings(path: &Path, data: &BTreeMap<String, Value>) -> Result<(), String> {
	let content = serde_json::to_vec_pretty(data).map_err(|error| error.to_string())?;
	let tmp = path.with_extension("json.tmp");
	if let Some(parent) = path.parent() {
		let _ = fs::create_dir_all(parent);
	}
	fs::write(&tmp, content).map_err(|error| format!("写入设置失败：{error}"))?;
	fs::rename(&tmp, path).map_err(|error| format!("保存设置失败：{error}"))
}

pub fn init(app: &AppHandle) -> SettingsState {
	let path = app
		.path_resolver()
		.app_config_dir()
		.map(|dir| dir.join(SETTINGS_FILE))
		.unwrap_or_else(|| PathBuf::from(SETTINGS_FILE));

	let data = read_settings(&path);
	SettingsState {
		path,
		data: Mutex::new(data),
	}
}

impl SettingsState {
	/// 依次尝试多个键，返回第一个为布尔值的项
	pub fn get_bool(&self, keys: &[&str]) -> Option<bool> {
		let data = self.data.lock().ok()?;
		keys.iter().find_map(|key| data.get(*key)?.as_bool())
	}
}

/// 读取全部设置项
#[tauri::command]
pub fn settings_load(state: State<'_, SettingsState>) -> BTreeMap<String, Value> {
	state
		.data
		.lock()
		.map(|data| data.clone())
		.unwrap_or_default()
}

/// 写入单个设置项并立即落盘
#[tauri::command]
pub fn settings_save(
	state: State<'_, SettingsState>,
	key: String,
	value: Value,
) -> Result<(), String> {
	let mut data = state
		.data
		.lock()
		.map_err(|_| "设置状态不可用".to_string())?;
	data.insert(key, value);
	write_settings(&state.path, &data)
}
