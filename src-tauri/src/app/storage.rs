use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime, State};

/// 数据目录指针，固定放在 app config 目录，这样即使数据目录被改到别处也能找回来
const BOOTSTRAP_FILE: &str = "storage.json";
const HISTORY_FILE: &str = "history.json";

/// 统计目录大小时最多遍历的条目数，避免超大缓存目录卡住界面
const MAX_SCAN_ENTRIES: usize = 20000;

#[derive(Debug, Default, Serialize, Deserialize)]
struct Bootstrap {
	data_dir: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageInfo {
	app_config_dir: String,
	app_data_dir: String,
	app_local_data_dir: String,
	app_cache_dir: String,
	app_log_dir: String,
	/// 当前生效的数据目录（历史记录等用户数据存放处）
	data_dir: String,
	/// 数据目录是否被自定义过
	custom: bool,
	cache_bytes: u64,
	cache_files: u64,
	history_bytes: u64,
}

pub struct StorageState {
	data_dir: Mutex<PathBuf>,
	default_data_dir: PathBuf,
	local_data_dir: PathBuf,
	config_dir: PathBuf,
	cache_dir: PathBuf,
	log_dir: PathBuf,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryData {
	pub updated_at: i64,
	pub entries: Vec<serde_json::Value>,
}

fn dir_stats(dir: &Path) -> (u64, u64) {
	let mut bytes = 0u64;
	let mut files = 0u64;
	let mut scanned = 0usize;
	let mut stack = vec![dir.to_path_buf()];

	while let Some(current) = stack.pop() {
		let Ok(entries) = fs::read_dir(&current) else {
			continue;
		};
		for entry in entries.flatten() {
			if scanned >= MAX_SCAN_ENTRIES {
				return (bytes, files);
			}
			scanned += 1;

			// 用 file_type 判断，避免跟随符号链接/junction 进入别的目录
			let Ok(file_type) = entry.file_type() else {
				continue;
			};
			if file_type.is_dir() {
				stack.push(entry.path());
			} else if file_type.is_file() {
				bytes += entry.metadata().map(|meta| meta.len()).unwrap_or(0);
				files += 1;
			}
		}
	}

	(bytes, files)
}

fn clear_dir_contents(dir: &Path) -> Result<u64, String> {
	let entries = fs::read_dir(dir).map_err(|error| format!("读取失败：{error}"))?;
	let mut freed = 0u64;

	for entry in entries.flatten() {
		let path = entry.path();
		let Ok(file_type) = entry.file_type() else {
			continue;
		};

		if file_type.is_dir() {
			let (bytes, _) = dir_stats(&path);
			fs::remove_dir_all(&path).map_err(|error| format!("删除 {} 失败：{error}", path.display()))?;
			freed += bytes;
		} else if file_type.is_file() {
			let size = entry.metadata().map(|meta| meta.len()).unwrap_or(0);
			fs::remove_file(&path).map_err(|error| format!("删除 {} 失败：{error}", path.display()))?;
			freed += size;
		}
	}

	Ok(freed)
}

fn history_path(data_dir: &Path) -> PathBuf {
	data_dir.join(HISTORY_FILE)
}

fn read_history_file(data_dir: &Path) -> HistoryData {
	fs::read_to_string(history_path(data_dir))
		.ok()
		.and_then(|content| serde_json::from_str::<HistoryData>(&content).ok())
		.unwrap_or_default()
}

impl StorageState {
	fn data_dir(&self) -> PathBuf {
		self.data_dir
			.lock()
			.map(|dir| dir.clone())
			.unwrap_or_else(|_| self.default_data_dir.clone())
	}

	fn snapshot(&self) -> StorageInfo {
		let data_dir = self.data_dir();
		let (cache_bytes, cache_files) = dir_stats(&self.cache_dir);
		let history_bytes = fs::metadata(history_path(&data_dir))
			.map(|meta| meta.len())
			.unwrap_or(0);

		StorageInfo {
			app_config_dir: self.config_dir.display().to_string(),
			app_data_dir: self.default_data_dir.display().to_string(),
			app_local_data_dir: self.local_data_dir.display().to_string(),
			app_cache_dir: self.cache_dir.display().to_string(),
			app_log_dir: self.log_dir.display().to_string(),
			data_dir: data_dir.display().to_string(),
			custom: data_dir != self.default_data_dir,
			cache_bytes,
			cache_files,
			history_bytes,
		}
	}
}

pub fn init<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<StorageState> {
	let path = app.path();
	let config_dir = path.app_config_dir()?;
	let app_data_dir = path.app_data_dir()?;
	let app_local_data_dir = path.app_local_data_dir()?;
	let cache_dir = path.app_cache_dir()?;
	let log_dir = path.app_log_dir()?;

	let _ = fs::create_dir_all(&config_dir);
	let _ = fs::create_dir_all(&app_data_dir);
	let _ = fs::create_dir_all(&app_local_data_dir);
	let _ = fs::create_dir_all(&cache_dir);

	let bootstrap = fs::read_to_string(config_dir.join(BOOTSTRAP_FILE))
		.ok()
		.and_then(|content| serde_json::from_str::<Bootstrap>(&content).ok())
		.unwrap_or_default();

	// 自定义目录若已被删除，回退到默认目录，避免数据凭空“消失”
	let data_dir = bootstrap
		.data_dir
		.map(PathBuf::from)
		.filter(|dir| dir.is_dir())
		.unwrap_or_else(|| app_data_dir.clone());

	Ok(StorageState {
		data_dir: Mutex::new(data_dir),
		default_data_dir: app_data_dir,
		local_data_dir: app_local_data_dir,
		config_dir,
		cache_dir,
		log_dir,
	})
}

#[tauri::command]
pub fn storage_info(state: State<'_, StorageState>) -> StorageInfo {
	state.snapshot()
}

/// 切换数据目录：迁移历史记录后立即生效
#[tauri::command]
pub fn set_data_dir(state: State<'_, StorageState>, path: String) -> Result<StorageInfo, String> {
	let target = PathBuf::from(path.trim());
	if target.as_os_str().is_empty() {
		return Err("目录不能为空".into());
	}
	if !target.is_dir() {
		return Err(format!("目录不存在或不可访问：{}", target.display()));
	}

	let previous = state.data_dir();
	if previous == target {
		return Ok(state.snapshot());
	}

	// 迁移历史记录（目标已有历史则保留目标，不覆盖）
	let source_history = history_path(&previous);
	let target_history = history_path(&target);
	if source_history.is_file() && !target_history.exists() {
		fs::copy(&source_history, &target_history)
			.map_err(|error| format!("迁移历史记录失败：{error}"))?;
	}

	let bootstrap = Bootstrap {
		data_dir: Some(target.display().to_string()),
	};
	fs::write(
		state.config_dir.join(BOOTSTRAP_FILE),
		serde_json::to_vec_pretty(&bootstrap).map_err(|error| error.to_string())?,
	)
	.map_err(|error| format!("保存存储设置失败：{error}"))?;

	if let Ok(mut dir) = state.data_dir.lock() {
		*dir = target;
	}

	Ok(state.snapshot())
}

/// 恢复默认数据目录
#[tauri::command]
pub fn reset_data_dir(state: State<'_, StorageState>) -> Result<StorageInfo, String> {
	let default_dir = state.default_data_dir.clone();
	let _ = fs::create_dir_all(&default_dir);

	let previous = state.data_dir();
	let source_history = history_path(&previous);
	let target_history = history_path(&default_dir);
	if source_history.is_file() && !target_history.exists() {
		fs::copy(&source_history, &target_history)
			.map_err(|error| format!("迁移历史记录失败：{error}"))?;
	}

	let bootstrap = Bootstrap { data_dir: None };
	fs::write(
		state.config_dir.join(BOOTSTRAP_FILE),
		serde_json::to_vec_pretty(&bootstrap).map_err(|error| error.to_string())?,
	)
	.map_err(|error| format!("保存存储设置失败：{error}"))?;

	if let Ok(mut dir) = state.data_dir.lock() {
		*dir = default_dir;
	}

	Ok(state.snapshot())
}

/// 清空缓存目录，返回释放的字节数
#[tauri::command]
pub fn clear_cache(state: State<'_, StorageState>) -> Result<u64, String> {
	// 防御：部分平台/自定义配置下缓存目录可能与数据目录重合，此时绝不能递归删除
	if state.cache_dir == state.config_dir
		|| state.cache_dir == state.default_data_dir
		|| state.cache_dir == state.local_data_dir
		|| state.cache_dir == state.data_dir()
	{
		return Err("缓存目录与数据目录重合，已跳过清理".into());
	}

	clear_dir_contents(&state.cache_dir)
}

#[tauri::command]
pub fn history_load(state: State<'_, StorageState>) -> HistoryData {
	read_history_file(&state.data_dir())
}

#[tauri::command]
pub fn history_save(state: State<'_, StorageState>, entries: Vec<serde_json::Value>) -> Result<(), String> {
	let data_dir = state.data_dir();
	let _ = fs::create_dir_all(&data_dir);

	let data = HistoryData {
		updated_at: std::time::SystemTime::now()
			.duration_since(std::time::UNIX_EPOCH)
			.map(|duration| duration.as_millis() as i64)
			.unwrap_or(0),
		entries,
	};

	let content = serde_json::to_vec(&data).map_err(|error| error.to_string())?;
	fs::write(history_path(&data_dir), content).map_err(|error| format!("写入历史记录失败：{error}"))
}

#[tauri::command]
pub fn history_clear(state: State<'_, StorageState>) -> Result<(), String> {
	let file = history_path(&state.data_dir());
	if file.is_file() {
		fs::remove_file(&file).map_err(|error| format!("清空历史记录失败：{error}"))?;
	}
	Ok(())
}
