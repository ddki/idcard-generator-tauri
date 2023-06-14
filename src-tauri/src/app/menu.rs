use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu, WindowMenuEvent};
use tauri_plugin_shell::ShellExt;

pub fn build_menu() -> Menu {
    let main = CustomMenuItem::new("main", "主页");
    let setting = CustomMenuItem::new("setting", "设置");
    let about: Submenu = about_menu();

    Menu::new()
        .add_item(main)
        .add_item(setting)
        .add_submenu(about)
        .add_native_item(MenuItem::Quit)
        .add_submenu(example_menu())
}

pub fn handle_menu_event(event: WindowMenuEvent) {
    match event.menu_item_id() {
        "main" => {
            let window = event.window().get_window("main").unwrap();
            window.eval("window.location.replace('#/')").unwrap();
        }
        "setting" => {
            let window = event.window().get_window("main").unwrap();
            window.eval("window.location.replace('#/setting')").unwrap();
        }
        "about" => {
            let window = event.window().get_window("main").unwrap();
            super::window::open_window(window, "about");
        }
        "wiki" => {
            let window = event.window().get_window("main").unwrap();
            super::window::open_window(window, "wiki");
        }
        "issues" => {
            event
                .window()
                .shell()
                // None 使用默认程序打开
                .open("https://github.com/ddki/idcard-generator/issues", None)
                .unwrap();
        }
        "github" => {
            event
                .window()
                .shell()
                .open("https://github.com/ddki/idcard-generator", None)
                .unwrap();
        }
        "check_update" => {
            println!("check_update...");
        }
        "quit" => {
            std::process::exit(0);
        }
        "close" => {
            event.window().close().unwrap();
        }
        // 例子
        "call_font" => event
            .window()
            .app_handle()
            .emit_all("fontGrobalListenEvent", "rust 调用 vue")
            .unwrap(),
        "dialog_1" => {
            tauri_plugin_dialog::DialogExt::dialog(&event.window().app_handle())
                .message("我是弹窗-1")
                .blocking_show();
        }
        "dialog_2" => {
            tauri_plugin_dialog::DialogExt::dialog(&event.window().app_handle())
                .message("我是弹窗-2-Error")
                .kind(tauri_plugin_dialog::MessageDialogKind::Error)
                .blocking_show();
        }
        "dialog_3" => {
            tauri_plugin_dialog::DialogExt::dialog(&event.window().app_handle())
                .message("我是弹窗-3-Info")
                .kind(tauri_plugin_dialog::MessageDialogKind::Info)
                .blocking_show();
        }
        "dialog_4" => {
            tauri_plugin_dialog::DialogExt::dialog(&event.window().app_handle())
                .message("我是弹窗-4-Warning")
                .kind(tauri_plugin_dialog::MessageDialogKind::Warning)
                .blocking_show();
        }
        "dialog_5" => {
            tauri_plugin_dialog::DialogExt::dialog(&event.window().app_handle())
                .message("我是弹窗-5-default")
                .kind(tauri_plugin_dialog::MessageDialogKind::default())
                .blocking_show();
        }
        "dialog_6" => {
            tauri_plugin_dialog::DialogExt::dialog(&event.window().app_handle())
                .message("我是弹窗-6-button")
                .kind(tauri_plugin_dialog::MessageDialogKind::default())
                .cancel_button_label("取消")
                .ok_button_label("确定")
                .title("我是弹窗标题")
                .blocking_show();
        }
        _ => {}
    }
}

fn about_menu() -> Submenu {
    Submenu::new(
        "关于",
        Menu::new()
            .add_item(CustomMenuItem::new("about", "关于"))
            .add_item(CustomMenuItem::new("wiki", "文档"))
            .add_item(CustomMenuItem::new("issues", "Issues"))
            .add_item(CustomMenuItem::new("github", "Github"))
            .add_item(CustomMenuItem::new("check_update", "检查更新")),
    )
}

fn example_menu() -> Submenu {
    let event = Submenu::new(
        "事件",
        Menu::new().add_item(CustomMenuItem::new("call_font", "调用前端")),
    );
    let dialog = Submenu::new(
        "弹窗",
        Menu::new()
            .add_item(CustomMenuItem::new("dialog_1", "弹窗-1"))
            .add_item(CustomMenuItem::new("dialog_2", "弹窗-2-Error"))
            .add_item(CustomMenuItem::new("dialog_3", "弹窗-3-Info"))
            .add_item(CustomMenuItem::new("dialog_4", "弹窗-4-Warning"))
            .add_item(CustomMenuItem::new("dialog_5", "弹窗-5-default"))
            .add_item(CustomMenuItem::new("dialog_6", "弹窗-6-button")),
    );
    Submenu::new("例子", Menu::new().add_submenu(event).add_submenu(dialog))
}
