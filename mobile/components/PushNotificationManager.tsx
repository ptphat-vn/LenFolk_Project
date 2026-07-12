import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Href, router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import axios from "@/setup/axios";
import { useAuthStore } from "@/store/authStore";
import { secureStorage } from "@/lib/secure-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function openNotification(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data;
  const url = typeof data.url === "string" ? data.url : null;
  if (url) router.push(url as Href);
}

export function PushNotificationManager() {
  const userId = useAuthStore((state) => state.user?._id);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!userId || !token || Platform.OS === "web") return;
    let active = true;
    const register = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Thông báo LenFolk",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
        });
      }
      const current = await Notifications.getPermissionsAsync();
      const permission = current.status === "granted" ? current : await Notifications.requestPermissionsAsync();
      if (!active || permission.status !== "granted") return;
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) throw new Error("Thiếu EAS projectId cho push notification");
      const expoToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      const storedHour = await secureStorage.getItem("studyReminderHour");
      const studyReminderHour = storedHour === null ? 19 : Number(storedHour);
      const storedMinute = await secureStorage.getItem("studyReminderMinute");
      const studyReminderMinute = storedMinute === null ? 0 : Number(storedMinute);
      await axios.post("/push-tokens", {
        token: expoToken,
        platform: Platform.OS,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh",
        studyReminderHour,
        studyReminderMinute,
      });
      await secureStorage.setItem("expoPushToken", expoToken);
    };
    register().catch((error) => console.warn("Không thể đăng ký push notification", error));
    return () => { active = false; };
  }, [token, userId]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = Notifications.addNotificationResponseReceivedListener(openNotification);
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openNotification(response);
    });
    return () => subscription.remove();
  }, []);

  return null;
}
