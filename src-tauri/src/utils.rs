use tauri::{Manager, Menu, WindowBuilder};

//创建新的窗口 label唯一标识
pub fn create_window(app: tauri::AppHandle, label: &str, title: &str, router: &str, menu: Menu) {
    match app.get_window(label) {
        Some(js) => {
            let _r = js.set_focus();
        }
        None => {
            WindowBuilder::new(&app, label, tauri::WindowUrl::App(router.into()))
                .center()
                .menu(menu)
                .title(title)
                .build()
                .unwrap();
        }
    }
}
