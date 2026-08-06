import { describe, it, expect, beforeEach } from "vitest";
import { mockRecordsApi, mockSettingsApi, mockAppApi } from "@/lib/api/mock";
import { isTauriEnv } from "@/lib/api/env";

describe("Web Mock & Environment Detection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should detect non-tauri environment in vitest/browser", () => {
    expect(isTauriEnv()).toBe(false);
  });

  it("should handle full CRUD in mockRecordsApi", async () => {
    const listInitial = await mockRecordsApi.list();
    expect(listInitial.length).toBe(2);

    const created = await mockRecordsApi.create({
      title: "New Test Record",
      content: "Testing mock CRUD",
      status: "active",
      tags: ["test", "vitest"],
    });
    expect(created.title).toBe("New Test Record");
    expect(created.tags).toEqual(["test", "vitest"]);

    const fetched = await mockRecordsApi.get(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe("New Test Record");

    const updated = await mockRecordsApi.update({
      id: created.id,
      title: "Updated Test Record",
    });
    expect(updated.title).toBe("Updated Test Record");

    const deleted = await mockRecordsApi.delete(created.id);
    expect(deleted).toBe(true);

    const listAfterDelete = await mockRecordsApi.list();
    expect(listAfterDelete.length).toBe(2);
  });

  it("should handle settings in mockSettingsApi", async () => {
    await mockSettingsApi.set("theme", "dark");
    const val = await mockSettingsApi.get("theme");
    expect(val).toBe("dark");

    await mockSettingsApi.setAutoLaunch(true);
    const autoLaunch = await mockSettingsApi.getAutoLaunch();
    expect(autoLaunch).toBe(true);
  });

  it("should handle mock backup and restore", async () => {
    const backupRes = await mockAppApi.backupDatabase("test.db");
    expect(backupRes).toContain("test.db");

    const restoreRes = await mockAppApi.restoreDatabase("test.db");
    expect(restoreRes).toContain("test.db");
  });
});
