import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Database,
  FileText,
  Tag,
  CheckCircle2,
  Archive,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecordMutations, useRecordsQuery } from "@/lib/query";
import { formatDate } from "@/lib/utils";
import type { RecordItem } from "@/types";
import { toast } from "sonner";

export function RecordsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data: records = [], isLoading } = useRecordsQuery(search);
  const { createRecord, updateRecord, deleteRecord } = useRecordMutations();

  // Modal Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecordItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "active",
    tags: "",
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({ title: "", content: "", status: "active", tags: "demo, sqlite" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: RecordItem) => {
    setEditingRecord(item);
    setFormData({
      title: item.title,
      content: item.content,
      status: item.status,
      tags: item.tags.join(", "),
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("标题不能为空");
      return;
    }

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingRecord) {
        await updateRecord.mutateAsync({
          id: editingRecord.id,
          title: formData.title,
          content: formData.content,
          status: formData.status,
          tags: tagsArray,
        });
        toast.success("记录更新成功");
      } else {
        await createRecord.mutateAsync({
          title: formData.title,
          content: formData.content,
          status: formData.status,
          tags: tagsArray,
        });
        toast.success("记录创建成功");
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("records.deleteConfirm"))) return;
    try {
      await deleteRecord.mutateAsync(id);
      toast.success("记录已删除");
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleExportJson = () => {
    if (records.length === 0) {
      toast.info("暂无数据可导出");
      return;
    }
    const blob = new Blob([JSON.stringify(records, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `records_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("已成功导出 JSON 文件");
  };

  const handleExportCsv = () => {
    if (records.length === 0) {
      toast.info("暂无数据可导出");
      return;
    }
    const header = "ID,Title,Status,Content,Tags,Created At,Updated At\n";
    const rows = records
      .map(
        (r) =>
          `"${r.id}","${(r.title || "").replace(/"/g, '""')}","${r.status}","${(
            r.content || ""
          ).replace(/"/g, '""')}","${(r.tags || []).join(";")}",${r.created_at},${
            r.updated_at
          }`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `records_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("已成功导出 CSV 文件");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("records.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("records.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1.5 shadow-xs">
                <Download className="h-4 w-4" /> 导出数据
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportJson} className="gap-2">
                <FileText className="h-4 w-4" /> 导出为 JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCsv} className="gap-2">
                <FileText className="h-4 w-4" /> 导出为 CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleOpenAdd} className="gap-2 shadow-xs">
            <Plus className="h-4 w-4" />
            {t("records.newRecord")}
          </Button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("records.searchPlaceholder")}
            className="pl-9 bg-card/60"
          />
        </div>
      </div>

      {/* Record List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 w-full animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
              <Database className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">{t("records.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {records.map((item) => (
            <Card
              key={item.id}
              className="border-border/60 bg-card/60 shadow-sm transition-all hover:border-border hover:shadow-md"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-1 items-start gap-3.5">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground">
                        {item.title}
                      </h3>
                      <Badge
                        variant={item.status === "active" ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {item.status === "active" ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> 有效
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Archive className="h-2.5 w-2.5" /> 归档
                          </span>
                        )}
                      </Badge>
                    </div>

                    {item.content && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.content}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                      <span>{formatDate(item.created_at)}</span>
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          <Tag className="h-2.5 w-2.5" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleOpenEdit(item)}
                      className="gap-2"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> {t("records.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(item.id)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {t("records.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? t("records.form.editTitle") : t("records.form.addTitle")}
              </DialogTitle>
              <DialogDescription>
                填写数据信息后保存至本地 SQLite 数据库中。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {t("records.form.titleLabel")}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("records.form.titlePlaceholder")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {t("records.form.contentLabel")}
                </label>
                <Input
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t("records.form.contentPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    {t("records.form.statusLabel")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="active">{t("records.form.statusActive")}</option>
                    <option value="archived">{t("records.form.statusArchived")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    标签 (英文逗号分隔)
                  </label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="tag1, tag2"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t("records.form.cancel")}
              </Button>
              <Button type="submit">{t("records.form.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
