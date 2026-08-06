import { commands } from "./bindings";
import type { CreateRecordDto, RecordItem, UpdateRecordDto } from "@/types";
import { isTauriEnv } from "./env";
import { mockRecordsApi } from "./mock";

function unwrap<T>(
  res: { status: "ok"; data: T } | { status: "error"; error: string },
): T {
  if (res.status === "error") throw new Error(res.error);
  return res.data;
}

export const recordsApi = {
  async list(query?: string): Promise<RecordItem[]> {
    if (!isTauriEnv()) return mockRecordsApi.list(query);
    return unwrap(await commands.listRecords(query || null));
  },

  async get(id: string): Promise<RecordItem | null> {
    if (!isTauriEnv()) return mockRecordsApi.get(id);
    return unwrap(await commands.getRecord(id));
  },

  async create(dto: CreateRecordDto): Promise<RecordItem> {
    if (!isTauriEnv()) return mockRecordsApi.create(dto);
    return unwrap(
      await commands.createRecord({
        title: dto.title,
        content: dto.content ?? null,
        status: dto.status ?? null,
        tags: dto.tags ?? null,
      }),
    );
  },

  async update(dto: UpdateRecordDto): Promise<RecordItem> {
    if (!isTauriEnv()) return mockRecordsApi.update(dto);
    return unwrap(
      await commands.updateRecord({
        id: dto.id,
        title: dto.title ?? null,
        content: dto.content ?? null,
        status: dto.status ?? null,
        tags: dto.tags ?? null,
      }),
    );
  },

  async delete(id: string): Promise<boolean> {
    if (!isTauriEnv()) return mockRecordsApi.delete(id);
    return unwrap(await commands.deleteRecord(id));
  },
};
