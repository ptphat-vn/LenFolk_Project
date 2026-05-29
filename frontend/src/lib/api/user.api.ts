import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios"
import { User, createUserRequest, updateUserRequest } from "@/types/user.types";

export const userApi = {
    getUsers:async (query: BasePaginationQuery) => {
        const res = await axiosInstance.get<APIResponse<User[]>>('/users', {params: query})
        return res.data;
    },
    createUser:async (body: createUserRequest) => {
        const res = await axiosInstance.post<APIResponse<User>>('/users', body)
        return res.data;
    },
    getUserById:async (id: string) => {
        const res = await axiosInstance.get<APIResponse<User>>(`/users/${id}`)
        return res.data;
    },
    updateUser: async (body: updateUserRequest, id:string) => {
        const res = await axiosInstance.patch<APIResponse<User>>(`/users/${id}`, body)
        return res.data;
    },
    deleteUser: async (id: string) => {
        const res = await axiosInstance.delete<APIResponse<User>>(`/users/${id}`)
        return res.data;
    }
}