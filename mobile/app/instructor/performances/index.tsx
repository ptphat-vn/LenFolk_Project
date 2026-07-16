import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Href, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/authStore";
import { useGetPerformances } from "@/hooks/performance/use-get-performances";
import { useGetMyWallet } from "@/hooks/wallet/use-get-my-wallet";

const formatMoney = (amount?: number, currency = "VND") =>
  `${new Intl.NumberFormat("vi-VN").format(amount || 0)}${currency === "VND" ? "đ" : ` ${currency}`}`;

const statusLabel: Record<string, string> = {
  pending: "Chờ duyệt",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

export default function InstructorPerformancesScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const canManage = user?.role === "instructor" || user?.role === "admin";
  const { data: walletData, isLoading: walletLoading } = useGetMyWallet(canManage);
  const { data: performances, isLoading } = useGetPerformances(
    user?._id ? { instructorId: user._id, sort: "-createdAt" } : undefined,
  );
  const totalWithdrawn = React.useMemo(
    () =>
      (walletData?.payouts ?? [])
        .filter((item) => item.status === "approved")
        .reduce((sum, item) => sum + item.amount, 0),
    [walletData?.payouts],
  );

  React.useEffect(() => {
    if (!canManage) {
      Alert.alert("Không có quyền", "Chỉ giảng viên mới xem được khu vực này.", [
        { text: "Quay lại", onPress: () => router.back() },
      ]);
    }
  }, [canManage, router]);

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false, title: "Tác phẩm của tôi" }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        // maxWidth: giới hạn bề rộng nội dung trên màn hình lớn (iPad)
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 48,
          width: "100%",
          maxWidth: 700,
          alignSelf: "center",
        }}
      >
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/instructor/performances/create" as Href)}
            className="flex-row items-center gap-2 rounded-full bg-[#10120C] px-4 py-3"
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-sm font-bold text-white">Tạo tác phẩm</Text>
          </TouchableOpacity>
        </View>

        <View className="rounded-[30px] bg-[#8E9E6E] p-6 mb-6">
          <Text className="text-xs font-bold uppercase tracking-wider text-white/70">
            Doanh thu tác phẩm
          </Text>
          {walletLoading ? (
            <ActivityIndicator color="white" className="py-8" />
          ) : (
            <View className="mt-4 gap-3">
              <View className="rounded-2xl bg-white/15 p-4">
                <Text className="text-xs font-bold text-white/70">Tổng đã kiếm</Text>
                <Text className="mt-1 text-2xl font-black text-white">
                  {formatMoney(walletData?.wallet.totalEarned)}
                </Text>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 rounded-2xl bg-white/15 p-4">
                  <Text className="text-xs font-bold text-white/70">Có thể rút</Text>
                  <Text className="mt-1 text-base font-black text-white">
                    {formatMoney(walletData?.wallet.balance)}
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-white/15 p-4">
                  <Text className="text-xs font-bold text-white/70">Đã rút</Text>
                  <Text className="mt-1 text-base font-black text-white">
                    {formatMoney(totalWithdrawn)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <Text
          className="mb-4 text-lg font-bold text-[#10120C]"
          style={{ fontFamily: "BeVietnamPro-Medium" }}
        >
          Tác phẩm của tôi
        </Text>

        {isLoading ? (
          <ActivityIndicator color="#8E9E6E" className="py-12" />
        ) : performances?.length ? (
          <View className="gap-4">
            {performances.map((item) => (
              <TouchableOpacity
                key={item._id}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/performance/[id]",
                    params: {
                      id: item._id,
                      title: item.title,
                      price: String(item.price || 0),
                      currency: item.currency,
                      thumbnail: item.thumbnail || "",
                      isFree: item.isFree ? "true" : "false",
                    },
                  } as unknown as Href)
                }
                className="rounded-[26px] bg-white p-5 border border-gray-100"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <Text
                      numberOfLines={2}
                      className="text-base font-bold text-[#10120C]"
                      style={{ fontFamily: "BeVietnamPro-Medium" }}
                    >
                      {item.title}
                    </Text>
                    <Text numberOfLines={1} className="mt-1 text-xs font-bold text-[#687451]">
                      {item.genre || "Chưa phân loại"} • {statusLabel[item.status] || item.status}
                    </Text>
                  </View>
                  <Text numberOfLines={1} className="shrink-0 text-sm font-black text-[#8E9E6E]">
                    {item.isFree ? "Miễn phí" : formatMoney(item.price, item.currency)}
                  </Text>
                </View>
                {!!item.description && (
                  <Text numberOfLines={2} className="mt-3 text-xs leading-5 text-[#55594F]">
                    {item.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center rounded-[28px] bg-white p-8">
            <Ionicons name="albums-outline" size={40} color="#8E9E6E" />
            <Text className="mt-3 text-center text-base font-bold text-charcoal">
              Bạn chưa có tác phẩm nào
            </Text>
            <Text className="mt-1 text-center text-xs leading-5 text-gray-500">
              Tạo tác phẩm mới để gửi admin duyệt và bắt đầu mở bán.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
