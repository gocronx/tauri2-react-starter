fn main() {
    #[cfg(windows)]
    {
        embed_manifest::embed_manifest(embed_manifest::new_manifest("tauri2-react-starter"))
            .expect("unable to embed manifest");
    }

    tauri_build::build();
}
