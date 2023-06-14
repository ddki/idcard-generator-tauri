use tauri::{AppHandle, Manager, Menu};

#[tauri::command]
pub async fn close_splashscreen(window: tauri::Window) {
    println!("close-splashscreen");
    // Close splashscreen
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    // Show main window
    window.get_window("main").unwrap().show().unwrap();
}

pub fn open_about(app: AppHandle) {
    println!("open_about...");
    let windows = app.windows();
    let about_window = windows.get("about");
    match about_window {
        Some(about_window) => about_window.show().unwrap(),
        None => crate::utils::create_window(app, "about", "关于", "#/about", Menu::default()),
    }
}

pub fn open_wiki(app: AppHandle) {
    println!("open_wiki...");
    let windows = app.windows();
    let wiki_window = windows.get("wiki");
    match wiki_window {
        Some(wiki_window) => wiki_window.show().unwrap(),
        None => crate::utils::create_window(app, "wiki", "文档", "#/wiki", Menu::default()),
    }
}

pub fn open_window(window: tauri::Window, window_label: &str) {
    if let Some(window_label) = window.get_window(window_label) {
        window_label.show().unwrap()
    }
}
