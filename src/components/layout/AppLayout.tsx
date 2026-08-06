import { useState } from "react";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { DashboardPage } from "@/pages/DashboardPage";
import { RecordsPage } from "@/pages/RecordsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { CommandPalette } from "@/components/CommandPalette";
import type { NavTab } from "@/types";

export function AppLayout() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top window TitleBar / Drag Header */}
      <TitleBar />

      {/* Main content split: Sidebar + Tab Views */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 overflow-y-auto bg-background/50 p-6 md:p-8">
          <div className="mx-auto max-w-5xl">
            {activeTab === "dashboard" && <DashboardPage />}
            {activeTab === "records" && <RecordsPage />}
            {activeTab === "settings" && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* Global ⌘K Command Palette */}
      <CommandPalette
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        onNavigate={setActiveTab}
      />
    </div>
  );
}
