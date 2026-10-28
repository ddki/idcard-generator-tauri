//! 单实例控制。
//!
//! Tauri v1 没有官方的 single-instance 插件，这里用一条回环 TCP 连接实现：
//! 首个实例监听固定端口，后启动的实例连上去发一条 `show` 指令后退出，
//! 首个实例收到指令后把主窗口唤回前台。

use std::io::{Read, Write};
use std::net::{Ipv4Addr, SocketAddr, TcpListener, TcpStream};
use std::thread;
use std::time::Duration;

use tauri::AppHandle;

use crate::app;

/// 固定的回环地址，取值避开常见服务端口
const ADDRESS: SocketAddr = SocketAddr::new(std::net::IpAddr::V4(Ipv4Addr::LOCALHOST), 37719);
const SHOW_MESSAGE: &[u8] = b"show";
const TIMEOUT: Duration = Duration::from_millis(800);

pub enum Instance {
	/// 首个实例，监听器交给 setup 使用
	Primary(TcpListener),
	/// 已有实例在运行（已通知其显示窗口），本次启动应直接退出
	Secondary,
	/// 端口被无关程序占用，本次照常启动（放弃单实例保护）
	Unavailable,
}

pub fn acquire() -> Instance {
	if let Ok(listener) = TcpListener::bind(ADDRESS) {
		return Instance::Primary(listener);
	}

	// 端口被占用：能连通说明是本应用的另一个实例
	if notify_running_instance() {
		Instance::Secondary
	} else {
		Instance::Unavailable
	}
}

fn notify_running_instance() -> bool {
	let Ok(mut stream) = TcpStream::connect_timeout(&ADDRESS, TIMEOUT) else {
		return false;
	};
	let _ = stream.set_write_timeout(Some(TIMEOUT));
	stream.write_all(SHOW_MESSAGE).is_ok()
}

/// 在后台线程监听唤醒请求，收到后把主窗口带回前台
pub fn listen(listener: TcpListener, app: AppHandle) {
	thread::spawn(move || {
		for stream in listener.incoming() {
			let Ok(mut stream) = stream else {
				continue;
			};
			let mut buffer = [0u8; SHOW_MESSAGE.len()];
			let _ = stream.set_read_timeout(Some(TIMEOUT));
			if stream.read_exact(&mut buffer).is_ok() && buffer.as_slice() == SHOW_MESSAGE {
				app::focus_main(&app);
			}
		}
	});
}
