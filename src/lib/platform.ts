export const isMac =
  typeof navigator !== "undefined" &&
  (/Macintosh|Mac OS X/i.test(navigator.userAgent) ||
    navigator.platform?.toLowerCase().includes("mac"));

export const isWindows =
  typeof navigator !== "undefined" &&
  (/Windows/i.test(navigator.userAgent) ||
    navigator.platform?.toLowerCase().includes("win"));

export const isLinux =
  typeof navigator !== "undefined" &&
  (/Linux/i.test(navigator.userAgent) ||
    navigator.platform?.toLowerCase().includes("linux"));

export const DRAG_REGION_ATTR = { "data-tauri-drag-region": "" } as const;

export const DRAG_REGION_STYLE = {
  WebkitAppRegion: "drag",
} as React.CSSProperties;

export const NO_DRAG_STYLE = {
  WebkitAppRegion: "no-drag",
} as React.CSSProperties;
