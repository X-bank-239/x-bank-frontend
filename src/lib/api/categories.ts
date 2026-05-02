import { apiClient } from "./client";
import type {
  CreateCategoryRequest,
  TransactionCategory,
  UpdateCategoryRequest,
} from "@/types";

export const categoriesApi = {
  async create(data: CreateCategoryRequest): Promise<TransactionCategory> {
    return apiClient.post<TransactionCategory>("/transactions/categories", data);
  },

  async getAll(): Promise<TransactionCategory[]> {
    return apiClient.get<TransactionCategory[]>("/transactions/categories/all");
  },

  async getByCode(code: string): Promise<TransactionCategory> {
    return apiClient.get<TransactionCategory>(`/transactions/categories/${code}`);
  },

  async update(code: string, data: UpdateCategoryRequest): Promise<TransactionCategory> {
    return apiClient.patch<TransactionCategory>(`/transactions/categories/${code}`, data);
  },

  async delete(code: string): Promise<void> {
    return apiClient.delete<void>(`/transactions/categories/${code}`);
  },
};
