import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";

type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
};

// POST /auth/reset-password — đặt lại mật khẩu bằng OTP. Thành công sẽ thu hồi mọi phiên cũ.
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ email, code, newPassword }: ResetPasswordPayload) => {
      const response = await axios.post("/auth/reset-password", {
        email,
        code,
        newPassword,
      });
      return response.data;
    },
  });
};
