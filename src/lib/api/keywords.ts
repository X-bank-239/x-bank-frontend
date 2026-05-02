import { apiClient } from "./client";
import type {
  CreateKeywordRequest,
  TransactionKeyword,
  UpdateKeywordRequest,
} from "@/types";

export const keywordsApi = {
  async create(data: CreateKeywordRequest): Promise<TransactionKeyword> {
    return apiClient.post<TransactionKeyword>("/transactions/keywords", data);
  },

  async getAll(): Promise<TransactionKeyword[]> {
    return apiClient.get<TransactionKeyword[]>("/transactions/keywords/all");
  },

  async getByCategory(categoryCode: string): Promise<TransactionKeyword[]> {
    return apiClient.get<TransactionKeyword[]>(`/transactions/keywords/${categoryCode}`);
  },

  async update(
    categoryCode: string,
    word: string,
    data: UpdateKeywordRequest
  ): Promise<TransactionKeyword> {
    const query = new URLSearchParams({ word }).toString();
    return apiClient.patch<TransactionKeyword>(
      `/transactions/keywords/${categoryCode}?${query}`,
      data
    );
  },

  async delete(categoryCode: string, word: string): Promise<void> {
    const query = new URLSearchParams({ word }).toString();
    return apiClient.delete<void>(`/transactions/keywords/${categoryCode}?${query}`);
  },
};
