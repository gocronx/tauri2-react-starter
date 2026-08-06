import { useTranslation } from "react-i18next";
import { Cpu, FolderOpen, HardDrive, Layers, ShieldCheck, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppInfoQuery, useSystemStatsQuery } from "@/lib/query";
import { appApi } from "@/lib/api";
import { toast } from "sonner";

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: appInfo, isLoading: isAppLoading } = useAppInfoQuery();
  const { data: stats, isLoading: isStatsLoading } = useSystemStatsQuery();

  const handleOpenLogs = async () => {
    try {
      await appApi.openLogsDir();
      toast.success("已打开日志目录");
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleOpenData = async () => {
    try {
      await appApi.openDataDir();
      toast.success("已打开数据目录");
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.description")}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {t("dashboard.os")}
            </CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {isStatsLoading ? "..." : stats?.os.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">{stats?.arch}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {t("dashboard.cpus")}
            </CardTitle>
            <Cpu className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {isStatsLoading ? "..." : `${stats?.num_cpus} Cores`}
            </div>
            <p className="text-xs text-muted-foreground">多线程并行执行</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {t("dashboard.version")}
            </CardTitle>
            <Layers className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              v{isAppLoading ? "..." : appInfo?.version}
            </div>
            <Badge variant="success" className="mt-1 font-mono text-[10px]">
              Tauri v2.0
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              数据库引擎
            </CardTitle>
            <HardDrive className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">SQLite WAL</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">已就绪并运行</p>
          </CardContent>
        </Card>
      </div>

      {/* Database & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4 text-primary" />
              {t("dashboard.dbStatus")}
            </CardTitle>
            <CardDescription>{t("dashboard.dbDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
              <span className="text-xs font-medium text-muted-foreground">数据目录</span>
              <span className="max-w-[240px] truncate font-mono text-xs text-foreground/80">
                {appInfo?.app_dir ?? "..."}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
              <span className="text-xs font-medium text-muted-foreground">日志目录</span>
              <span className="max-w-[240px] truncate font-mono text-xs text-foreground/80">
                {appInfo?.logs_dir ?? "..."}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4 text-primary" />
              {t("dashboard.quickActions")}
            </CardTitle>
            <CardDescription>一键打开本地存储与运行日志目录</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 gap-2 border-border/80"
              onClick={handleOpenLogs}
            >
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              {t("dashboard.openLogs")}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 border-border/80"
              onClick={handleOpenData}
            >
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              {t("dashboard.openData")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-primary">
            <ShieldCheck className="h-5 w-5" />
            企业级桌面端架构特性
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs text-muted-foreground">
          <div className="space-y-1">
            <span className="font-semibold text-foreground">分层架构设计</span>
            <p>Commands → Services → DAO → SQLite 四层解耦，结构清晰。</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-foreground">崩溃熔断与日志</span>
            <p>内置全局 Panic Hook 与前端 ErrorBoundary 捕获全链路异常。</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-foreground">系统原生整合</span>
            <p>开机自启动管理、多平台标题栏自适应、托盘常驻与单实例防多开。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
