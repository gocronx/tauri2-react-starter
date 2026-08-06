import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, Copy, X } from "lucide-react";
import {
  isMac,
  isWindows,
  isLinux,
  DRAG_REGION_STYLE,
  NO_DRAG_STYLE,
} from "@/lib/platform";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      try {
        const appWindow = getCurrentWindow();
        const max = await appWindow.isMaximized();
        setIsMaximized(max);
      } catch {
        // Ignore outside tauri environment
      }
    };

    checkMaximized();
    const interval = setInterval(checkMaximized, 500);
    return () => clearInterval(interval);
  }, []);

  const handleMinimize = async () => {
    try {
      await getCurrentWindow().minimize();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleMaximize = async () => {
    try {
      await getCurrentWindow().toggleMaximize();
      const max = await getCurrentWindow().isMaximized();
      setIsMaximized(max);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = async () => {
    try {
      await getCurrentWindow().close();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header
      style={DRAG_REGION_STYLE}
      onDoubleClick={handleToggleMaximize}
      className="flex h-10 w-full items-center justify-between border-b border-border/40 bg-background/80 px-3 backdrop-blur select-none"
    >
      {/* Left section: on Mac, leave space for traffic lights */}
      <div className="flex items-center gap-2">
        {isMac ? (
          <div className="w-16" />
        ) : (
          <div className="flex items-center gap-1.5 px-1 font-semibold text-xs text-muted-foreground tracking-wide">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>Tauri 2 Starter</span>
          </div>
        )}
      </div>

      {/* Center section: draggable title */}
      <div className="flex-1 text-center font-medium text-xs text-muted-foreground/80">
        {isMac && "Tauri 2 Starter"}
      </div>

      {/* Right section: Windows / Linux custom window controls */}
      <div className="flex items-center" style={NO_DRAG_STYLE}>
        {(isWindows || isLinux) && (
          <div className="flex items-center">
            <button
              onClick={handleMinimize}
              className="inline-flex h-8 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Minimize"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleToggleMaximize}
              className="inline-flex h-8 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? (
                <Copy className="h-3 w-3" />
              ) : (
                <Square className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="inline-flex h-8 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
