import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { getOnboardingRoute, isProfileComplete } from "@/constants/onboarding";

export default function AuthLayout() {
  const { user, token, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return null;
  }

  if (user && token && isProfileComplete(user)) {
    return <Redirect href={getOnboardingRoute(user) || "/(tabs)"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animation: "slide_from_right",
      }}
    />
  );
}
