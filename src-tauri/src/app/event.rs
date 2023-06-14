use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn greet(name: &str) -> String {
    println!("arg = {}", name);
    format!("Hello, {}!", name)
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[derive(Clone, serde::Serialize)]
struct Setting {
    user: String,
}

// #[tauri::command]
// pub fn save_setting(setting: Setting) -> String {}

pub fn build_app_event(app: AppHandle) {
    // listen to the `event-name` (emitted on any window)
    let id = app.listen_global("listen_global", |event| {
        println!("got click with payload {:?}", event.payload());
    });
    // unlisten to the event using the `id` returned on the `listen_global` function
    // a `once_global` API is also exposed on the `App` struct
    app.unlisten(id);

    // emit the `event-name` event to all webview windows on the frontend
    app.emit_all(
        "click_emit",
        Payload {
            message: "Tauri is awesome!".into(),
        },
    )
    .unwrap();
}
