import axiosInstance from "../axios";

export const revenueApi = {
  getOverview: async () => {
    const response = await axiosInstance.get("/revenue/overview");
    return response.data.data;
  },
  getChart: async (groupBy = 'day') => {
    const response = await axiosInstance.get(`/revenue/chart?groupBy=${groupBy}`);
    return response.data.data;
  },
  getByPlan: async () => {
    const response = await axiosInstance.get("/revenue/by-plan");
    return response.data.data;
  }
};
