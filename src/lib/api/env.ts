/**
 * 检查当前运行时是否处于 Tauri 桌面端宿主环境中
 */
export const isTauriEnv = (): boolean => {
  return (
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window)
  );
};
