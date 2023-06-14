use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu, WindowMenuEvent};
use tauri_plugin_shell::ShellExt;

pub fn build_menu() -> Menu {
    let main = CustomMenuItem::new("main", "主页");
    let about: Submenu = about_menu();

    Menu::new()
        .add_item(main)
        .add_submenu(about)
        .add_native_item(MenuItem::Quit)
}

pub fn handle_menu_event(event: WindowMenuEvent) {
    match event.menu_item_id() {
        "main" => {
            let window = event.window().get_window("main").unwrap();
            window.eval("window.location.replace('#/')").unwrap();
        }
        "about" => {
            let window = event.window().get_window("main").unwrap();
            super::window::open_window(window, "about");
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
        _ => {}
    }
}

fn about_menu() -> Submenu {
    Submenu::new(
        "关于",
        Menu::new()
            .add_item(CustomMenuItem::new("about", "关于"))
            .add_item(CustomMenuItem::new("issues", "Issues"))
            .add_item(CustomMenuItem::new("github", "Github"))
            .add_item(CustomMenuItem::new("check_update", "检查更新")),
    )
}
