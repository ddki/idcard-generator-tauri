#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app;
pub mod utils;
use tauri::{Manager, WindowMenuEvent};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .system_tray(crate::app::tray::build())
        .on_system_tray_event(crate::app::tray::handle_menu_event)
        .invoke_handler(tauri::generate_handler![
            crate::app::event::greet,
            crate::app::window::close_splashscreen
        ])
        .menu(crate::app::menu::build_menu())
        .on_menu_event(|event: WindowMenuEvent| crate::app::menu::handle_menu_event(event))
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            main_window.close_devtools();
            // 事件
            crate::app::event::build_app_event(app.app_handle());
            Ok(())
        })
        // 保持前端在后台运行，以实现系统托盘左击显示窗口
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        // 保持后端在后台运行
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
