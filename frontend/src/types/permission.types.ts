/** Schema Permission trả về từ API */
export interface Permission {
  _id: string;
  action: string;
  resource: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để Admin tạo / cập nhật permission */
export interface CreatePermissionInput {
  action: string;
  resource: string;
  description?: string;
}
