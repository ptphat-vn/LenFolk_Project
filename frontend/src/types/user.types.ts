export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  gender?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  currentSubscription?: string;
  isActive?: boolean;
  isVerified?: boolean;
  lastLoginAt?: Date;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
export type Role = 'admin' | 'learner' | 'instructor' | "guest" | "moderator";

export interface createUserRequest {
  name: string,
  email: string,
  passwordHash: string,
  gender: string,
  dateOfBirth: string,
  role: Role,
  phoneNumber: string
}
export interface updateUserRequest {
  name: string;
  gender: string;
  role: Role;
  phoneNumber: string;
  avatar: string;
  isActive: boolean;
}