fn main() {
    #[cfg(windows)]
    {
        let attrs = tauri_build::Attributes::new()
            .windows_attributes(tauri_build::WindowsAttributes::new_without_app_manifest());
        embed_manifest::embed_manifest(embed_manifest::new_manifest("tauri2-react-starter"))
            .expect("unable to embed manifest");
        tauri_build::try_build(attrs).expect("failed to run tauri_build");
    }

    #[cfg(not(windows))]
    tauri_build::build();
}
