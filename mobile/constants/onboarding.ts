import type { Href } from "expo-router";
import type { User } from "@/types/users.type";

export const isProfileComplete = (user?: User | null) =>
  Boolean(
    user?.name?.trim() &&
      user?.email?.trim() &&
      user?.phoneNumber?.trim() &&
      user?.dateOfBirth &&
      user?.gender,
  );

export const getOnboardingRoute = (user?: User | null): Href | null => {
  if (!user) return null;
  if (!isProfileComplete(user)) return "/(auth)/profile" as Href;
  return null;
};
