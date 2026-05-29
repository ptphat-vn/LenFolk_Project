import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import '../global.css'

SplashScreen.preventAutoHideAsync();

type AuthStore = {
    user: object | null;
    token: string | null;
    checkAuth: () => void;
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token } = useAuthStore() as AuthStore;

  const [fontsLoaded] = useFonts({
    "BeVietnamPro-Medium": require("../assets/fonts/BeVietnamPro-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    check();
  }, []);

  const check = async () => {
    try {
      checkAuth();
    } catch (error) {
      console.log("Error checking auth", error);
    } finally {
      await SplashScreen.hideAsync();
    }
  };

  useEffect(() => {
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) router.replace("/(auth)");
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)");
  }, [user, token, segments]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}