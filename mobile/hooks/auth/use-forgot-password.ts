import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";

// POST /auth/forgot-password — gửi OTP đặt lại mật khẩu qua email (message trung tính).
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.post("/auth/forgot-password", { email });
      return response.data;
    },
  });
};
