export function reportFrontendError(context: string, error: unknown) {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack ?? ""}`
      : typeof error === "object"
        ? JSON.stringify(error)
        : String(error);

  console.error(`[FrontendError][${context}]`, message);
}

export function installGlobalErrorHandlers() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    reportFrontendError("window.onerror", event.error || event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportFrontendError("window.onunhandledrejection", event.reason);
  });
}
