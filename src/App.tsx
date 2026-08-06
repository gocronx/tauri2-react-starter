import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { ThemeProvider } from "@/components/theme-provider";
import { FrontendErrorBoundary } from "@/components/FrontendErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <FrontendErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="tauri2-theme">
          <AppLayout />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </FrontendErrorBoundary>
  );
}
