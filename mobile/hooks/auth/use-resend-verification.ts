import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";

// POST /auth/resend-verification — gửi lại OTP xác thực email (message trung tính).
export const useResendVerification = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.post("/auth/resend-verification", { email });
      return response.data;
    },
  });
};
