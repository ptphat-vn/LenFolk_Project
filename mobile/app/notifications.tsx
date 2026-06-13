import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

import SafeScreen from "@/components/SafeScreen";
import { useGetNotifications } from "@/hooks/notification/use-get-notifications";
import { useUpdateNotification } from "@/hooks/notification/use-update-notification";
import { Notification } from "@/types/notifications.type";

const iconByType: Record<Notification["type"], keyof typeof Ionicons.glyphMap> = {
  lesson: "book-outline",
  badge: "ribbon-outline",
  subscription: "card-outline",
  streak: "flame-outline",
  moderation: "shield-outline",
  system: "notifications-outline",
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notifications, isLoading, refetch, isRefetching } = useGetNotifications();
  const updateNotification = useUpdateNotification();

  const markAsRead = (notification: Notification) => {
    if (!notification.isRead) {
      updateNotification.mutate({ id: notification._id, isRead: true });
    }

    const lessonId = notification.data?.lessonId;
    if (lessonId) {
      router.push({
        pathname: "/lesson/[id]",
        params: { id: String(lessonId) },
      });
    }
  };

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center justify-between px-6 pb-4 pt-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="arrow-back" size={22} color="#10120C" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#10120C]">THÔNG BÁO</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          disabled={isRefetching}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#E2E8D3]"
        >
          <Ionicons name="refresh" size={20} color="#687451" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 48, gap: 12 }}
        className="rounded-t-[30px] bg-white"
      >
        {isLoading ? (
          <ActivityIndicator color="#8E9E6E" className="py-16" />
        ) : notifications?.length ? (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification._id}
              activeOpacity={0.85}
              onPress={() => markAsRead(notification)}
              className={`flex-row gap-4 rounded-3xl border p-4 ${
                notification.isRead
                  ? "border-gray-100 bg-white"
                  : "border-[#C5D0B4] bg-[#F3F6EC]"
              }`}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#E2E8D3]">
                <Ionicons
                  name={iconByType[notification.type]}
                  size={21}
                  color="#687451"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-start justify-between gap-3">
                  <Text className="flex-1 text-sm font-bold text-[#10120C]">
                    {notification.title}
                  </Text>
                  {!notification.isRead && (
                    <View className="mt-1.5 h-2 w-2 rounded-full bg-[#D96C5F]" />
                  )}
                </View>
                <Text className="mt-1 text-xs leading-5 text-gray-500">
                  {notification.body}
                </Text>
                <Text className="mt-2 text-[10px] font-semibold text-[#8E9E6E]">
                  {new Intl.DateTimeFormat("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(notification.createdAt))}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center gap-3 py-20">
            <Ionicons name="notifications-off-outline" size={44} color="#8E9E6E" />
            <Text className="font-bold text-[#10120C]">Chưa có thông báo</Text>
            <Text className="text-center text-xs text-gray-500">
              Các cập nhật về bài học, streak và giao dịch sẽ xuất hiện tại đây.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
