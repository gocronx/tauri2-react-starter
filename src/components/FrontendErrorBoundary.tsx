import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportFrontendError } from "@/lib/frontendLogger";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FrontendErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportFrontendError("FrontendErrorBoundary", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-6 text-foreground">
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h2 className="mb-2 text-xl font-bold">页面渲染发生异常</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              应用程序遇到未预期的前端错误。错误信息已记录。
            </p>
            {this.state.error && (
              <pre className="mb-6 max-h-40 w-full overflow-auto rounded-lg bg-muted/60 p-3 text-left font-mono text-xs text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              重新加载应用
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
