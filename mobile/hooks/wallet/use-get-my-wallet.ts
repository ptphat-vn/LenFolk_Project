import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";

export type InstructorWallet = {
  _id: string;
  instructorId: string;
  balance: number;
  totalEarned: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type PayoutRequest = {
  _id: string;
  instructorId: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetMyWallet = (enabled = true) => {
  return useQuery({
    queryKey: ["myWallet"],
    queryFn: async () => {
      const response = await axios.get<
        ApiResponse<{ wallet: InstructorWallet; payouts: PayoutRequest[] }>
      >("/wallets/me");
      return response.data.data;
    },
    enabled,
  });
};
