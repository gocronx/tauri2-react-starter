import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Moon,
  Sun,
  Laptop,
  Languages,
  Power,
  Info,
  Sliders,
  Check,
  HardDrive,
  Download,
  FolderOpen,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { changeLanguage } from "@/i18n";
import { appApi, settingsApi } from "@/lib/api";
import { useAutoLaunchQuery, useSettingsQuery } from "@/lib/query";
import { checkAppUpdate } from "@/lib/updater";
import { toast } from "sonner";

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const { data: autoLaunchEnabled = false, refetch: refetchAutoLaunch } =
    useAutoLaunchQuery();
  const { data: allSettings = {}, refetch: refetchSettings } = useSettingsQuery();

  const [customKey, setCustomKey] = useState("app_custom_param");
  const [customVal, setCustomVal] = useState("");

  useEffect(() => {
    if (allSettings[customKey] !== undefined) {
      setCustomVal(allSettings[customKey]);
    }
  }, [allSettings, customKey]);

  const handleToggleAutoLaunch = async (checked: boolean) => {
    try {
      await settingsApi.setAutoLaunch(checked);
      await refetchAutoLaunch();
      toast.success(checked ? "已开启开机自启" : "已关闭开机自启");
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleSaveCustomSetting = async () => {
    if (!customKey.trim()) return;
    try {
      await settingsApi.set(customKey.trim(), customVal);
      await refetchSettings();
      toast.success("配置已保存至 SQLite");
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.description")}</p>
      </div>

      <div className="grid gap-4">
        {/* Appearance Card */}
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("settings.appearance")}</CardTitle>
            <CardDescription>个性化界面外观与色彩风格</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">{t("settings.theme")}</span>
                <p className="text-xs text-muted-foreground">选择适合您视觉习惯的主题</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border/80 p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    theme === "light"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  {t("settings.themeLight")}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  {t("settings.themeDark")}
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    theme === "system"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5" />
                  {t("settings.themeSystem")}
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">{t("settings.language")}</span>
                <p className="text-xs text-muted-foreground">多语言界面实时切换</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border/80 p-1">
                <button
                  onClick={() => changeLanguage("zh")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    i18n.language.startsWith("zh")
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Languages className="h-3.5 w-3.5" />
                  {t("settings.langZh")}
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    i18n.language.startsWith("en")
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Languages className="h-3.5 w-3.5" />
                  {t("settings.langEn")}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Startup Card */}
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Power className="h-4 w-4 text-primary" />
              {t("settings.startup")}
            </CardTitle>
            <CardDescription>{t("settings.trayDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">{t("settings.autoLaunch")}</span>
                <p className="text-xs text-muted-foreground">
                  {t("settings.autoLaunchDesc")}
                </p>
              </div>
              <Switch
                checked={autoLaunchEnabled}
                onCheckedChange={handleToggleAutoLaunch}
              />
            </div>
          </CardContent>
        </Card>

        {/* SQLite Key-Value Storage Card */}
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sliders className="h-4 w-4 text-primary" />
              SQLite Key-Value 参数配置演示
            </CardTitle>
            <CardDescription>
              演示利用 SQLite settings 表存储任意自定义键值对
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="配置键 (key)"
                className="sm:w-1/3"
              />
              <Input
                value={customVal}
                onChange={(e) => setCustomVal(e.target.value)}
                placeholder="配置值 (value)"
                className="flex-1"
              />
              <Button onClick={handleSaveCustomSetting} className="gap-1.5">
                <Check className="h-4 w-4" /> 保存配置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Database Management & Hot Backup Card */}
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4 text-primary" />
              SQLite 数据库管理与热备份
            </CardTitle>
            <CardDescription>
              支持在线热备份 (Online SQLite Backup API)、数据恢复与存储目录快速定位
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-lg border border-border/70 p-3 bg-muted/20">
                <div className="space-y-1">
                  <p className="text-sm font-medium">数据库热备份</p>
                  <p className="text-xs text-muted-foreground">
                    基于 SQLite 事务安全的在线热备份，无需暂停应用
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={async () => {
                      try {
                        const target = `backup_${Date.now()}.db`;
                        const res = await appApi.backupDatabase(target);
                        toast.success(res || "数据库热备份成功");
                      } catch (e: any) {
                        toast.error("备份失败: " + (e?.message || e));
                      }
                    }}
                  >
                    <Download className="h-3.5 w-3.5" /> 立即热备份
                  </Button>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-lg border border-border/70 p-3 bg-muted/20">
                <div className="space-y-1">
                  <p className="text-sm font-medium">目录快捷定位</p>
                  <p className="text-xs text-muted-foreground">
                    在系统文件管理器中快速定位 App 数据与日志路径
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={async () => {
                      await appApi.openDataDir();
                      toast.info("已打开数据目录");
                    }}
                  >
                    <FolderOpen className="h-3.5 w-3.5" /> 数据目录
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={async () => {
                      await appApi.openLogsDir();
                      toast.info("已打开日志目录");
                    }}
                  >
                    <FileText className="h-3.5 w-3.5" /> 日志目录
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About & Updater Card */}
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                {t("settings.about")}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={async () => {
                  toast.info("正在检查最新版本...");
                  try {
                    const res = await checkAppUpdate();
                    if (res.hasUpdate) {
                      toast.success(`发现新版本 v${res.version}!`);
                    } else {
                      toast.success("已是最新版本 (v0.1.0)");
                    }
                  } catch (e: any) {
                    toast.error("检查更新失败: " + (e?.message || e));
                  }
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" /> 检查更新
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p className="leading-relaxed">{t("settings.aboutDesc")}</p>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-muted-foreground/80">
              <span>架构: Tauri 2 + React + Rust</span>
              <span>•</span>
              <span>更新机制: GitHub Releases (@tauri-apps/plugin-updater)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
