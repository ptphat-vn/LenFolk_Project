import axiosInstance from "../axios";

export const lessonApi = {
  getPendingLessons: async () => {
    const response = await axiosInstance.get("/lessons?isPublished=false&limit=5");
    return response.data; // Return full response to keep .meta and .data
  },
};
