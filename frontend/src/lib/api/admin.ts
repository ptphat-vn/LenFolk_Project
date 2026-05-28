import axiosInstance from "../axios";

export const adminApi = {
  getDashboard: async () => {
    const response = await axiosInstance.get("/admin/dashboard");
    return response.data.data;
  },
};
