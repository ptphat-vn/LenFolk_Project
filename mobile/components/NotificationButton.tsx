import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import { useGetNotifications } from "@/hooks/notification/use-get-notifications";

type NotificationButtonProps = {
  inverted?: boolean;
};

export default function NotificationButton({
  inverted = false,
}: NotificationButtonProps) {
  const router = useRouter();
  const { data: notifications } = useGetNotifications();
  const unreadCount = notifications?.filter((item) => !item.isRead).length ?? 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push("/notifications" as Href)}
      className={`h-10 w-10 items-center justify-center rounded-full ${
        inverted ? "bg-[#8E9E6E]" : "border border-[#8E9E6E]/10 bg-[#8E9E6E]/20"
      }`}
      accessibilityRole="button"
      accessibilityLabel={`Thông báo, ${unreadCount} chưa đọc`}
    >
      <Ionicons
        name="notifications"
        size={20}
        color={inverted ? "white" : "#8E9E6E"}
      />
      {unreadCount > 0 && (
        <View className="absolute -right-1 -top-1 min-w-5 items-center rounded-full bg-[#D96C5F] px-1 py-0.5">
          <Text className="text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
