import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { Subscription, CreateSubscriptionInput, PurchaseSubscriptionInput, PurchaseSubscriptionResponse } from "@/types/subscription.types";

export const subscriptionApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<Subscription>>(`/subscriptions`, { params: query });
    return res.data;
  },
  create: async (body: CreateSubscriptionInput) => {
    const res = await axiosInstance.post<APIResponse<Subscription>>(`/subscriptions`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Subscription>>(`/subscriptions/${id}`);
    return res.data;
  },
  update: async (id: string, body: CreateSubscriptionInput) => {
    const res = await axiosInstance.patch<APIResponse<Subscription>>(`/subscriptions/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<Subscription>>(`/subscriptions/${id}`);
    return res.data;
  },
  createPurchase: async (id: string, body: PurchaseSubscriptionInput) => {
    const res = await axiosInstance.post<APIResponse<PurchaseSubscriptionResponse>>(`/subscriptions/${id}/purchase`, body);
    return res.data;
  },
};
