import { SplashScreen, Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import { QueryProvider } from "../providers/query";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  const [fontsLoaded] = useFonts({
    "BeVietnamPro-Medium": require("../assets/fonts/BeVietnamPro-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded && !isCheckingAuth) {
      SplashScreen.hideAsync();
      return;
    }

    const timeout = setTimeout(() => {
      console.warn(
        `Splash timeout sau 5s — fontsLoaded=${fontsLoaded}, isCheckingAuth=${isCheckingAuth}`,
      );
      SplashScreen.hideAsync();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [fontsLoaded, isCheckingAuth]);

  useEffect(() => {
    checkAuth().catch((error) => {
      console.log("Error checking auth", error);
    });
  }, [checkAuth]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              fullScreenGestureEnabled: true,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="lesson/[id]" />
            <Stack.Screen name="practice/[lessonId]" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="profile/subscription" />
            <Stack.Screen name="profile/verify" />
            <Stack.Screen name="privacy" />
          </Stack>
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
