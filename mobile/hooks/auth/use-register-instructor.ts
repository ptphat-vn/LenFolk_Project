import axios from "@/setup/axios";
import {
  RegisterInstructorPayload,
  RegisterInstructorResponse,
} from "@/types/auth.type";
import { useMutation } from "@tanstack/react-query";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useRegisterInstructor = () => {
  return useMutation({
    mutationFn: async (payload: RegisterInstructorPayload) => {
      const response = await axios.post<
        ApiResponse<RegisterInstructorResponse>
      >("/auth/register-instructor", payload);

      return response.data.data;
    },
  });
};
