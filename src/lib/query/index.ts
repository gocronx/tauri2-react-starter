import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { appApi, recordsApi, settingsApi } from "@/lib/api";
import type { CreateRecordDto, UpdateRecordDto } from "@/types";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const queryKeys = {
  appInfo: ["app", "info"] as const,
  systemStats: ["app", "stats"] as const,
  settings: ["settings"] as const,
  autoLaunch: ["settings", "autoLaunch"] as const,
  records: (query?: string) => ["records", { query }] as const,
  record: (id: string) => ["records", id] as const,
};

export function useAppInfoQuery() {
  return useQuery({
    queryKey: queryKeys.appInfo,
    queryFn: () => appApi.getInfo(),
  });
}

export function useSystemStatsQuery() {
  return useQuery({
    queryKey: queryKeys.systemStats,
    queryFn: () => appApi.getStats(),
  });
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => settingsApi.getAll(),
  });
}

export function useAutoLaunchQuery() {
  return useQuery({
    queryKey: queryKeys.autoLaunch,
    queryFn: () => settingsApi.getAutoLaunch(),
  });
}

export function useRecordsQuery(query?: string) {
  return useQuery({
    queryKey: queryKeys.records(query),
    queryFn: () => recordsApi.list(query),
  });
}

export function useRecordMutations() {
  const client = useQueryClient();

  const createRecord = useMutation({
    mutationFn: (dto: CreateRecordDto) => recordsApi.create(dto),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const updateRecord = useMutation({
    mutationFn: (dto: UpdateRecordDto) => recordsApi.update(dto),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const deleteRecord = useMutation({
    mutationFn: (id: string) => recordsApi.delete(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["records"] });
    },
  });

  return { createRecord, updateRecord, deleteRecord };
}
