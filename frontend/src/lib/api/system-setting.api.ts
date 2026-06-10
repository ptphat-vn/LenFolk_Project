import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import { SystemSetting, UpdateSystemSettingInput } from '@/types/system-setting.types';
import { hasFileValue, toFormData } from './form-data';

export const systemSettingApi = {
  /** GET /system-settings — Cấu hình thanh toán dùng chung (QR + bank). Public. */
  get: async () => {
    const res = await axiosInstance.get<APIResponse<SystemSetting>>('/system-settings');
    return res.data;
  },

  /** PUT /system-settings — Cập nhật QR + bank (Admin). multipart nếu có file qrCode. */
  update: async (body: UpdateSystemSettingInput) => {
    const record = body as Record<string, unknown>;
    const payload = hasFileValue(record) ? toFormData(record) : body;
    const res = await axiosInstance.put<APIResponse<SystemSetting>>('/system-settings', payload);
    return res.data;
  },
};
