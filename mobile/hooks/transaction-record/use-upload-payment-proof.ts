import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { TransactionRecord } from "@/types/transaction-records.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type UploadProofPayload = {
  id: string;
  proof: {
    uri: string;
    name: string;
    type: string;
  };
};

export const useUploadPaymentProof = () => {
  return useMutation({
    mutationFn: async ({ id, proof }: UploadProofPayload) => {
      const formData = new FormData();
      formData.append("proof", proof as any);

      const response = await axios.patch<ApiResponse<TransactionRecord>>(
        `/transaction-records/${id}/upload-proof`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    },
  });
};
