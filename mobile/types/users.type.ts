export type User = {
  _id: string;
  name: string;
  email: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string | null;
  avatar: string | null;
  phoneNumber: string | null;
  role: "admin" | "instructor" | "user" | "moderator" | "learner" | "guest";
  currentSubscription: string | null;
  isActive: boolean;
  isVerified: boolean;
  isSubscribed?: boolean;
  lastLoginAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
