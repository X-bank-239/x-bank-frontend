import { apiClient } from "./client";
import type { AppSetting, UpdateAppSettingRequest } from "@/types";

export const settingsApi = {
  getAll(): Promise<AppSetting[]> {
    return apiClient.get<AppSetting[]>("/settings/all");
  },

  getByKey(key: string): Promise<AppSetting> {
    return apiClient.get<AppSetting>(`/settings/${encodeURIComponent(key)}`);
  },

  update(key: string, data: UpdateAppSettingRequest): Promise<AppSetting> {
    return apiClient.patch<AppSetting>(`/settings/${encodeURIComponent(key)}`, data);
  },
};
