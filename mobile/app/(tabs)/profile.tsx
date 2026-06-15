import React, { useState } from "react";
import { Alert, View, Text, ScrollView, TouchableOpacity, Switch, Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useLogout } from "@/hooks/auth/use-logout";
import { useScrollToTopOnFocus } from "@/hooks/use-scroll-to-top-on-focus";
import { AnimatedBlock } from "@/components/AnimatedPage";
import { useAuthStore } from "@/store/authStore";
import SafeScreen from "../../components/SafeScreen";
import NotificationButton from "@/components/NotificationButton";
import { useGetMe } from "@/hooks/user/use-get-me";
import { useCurrentSubscription } from "@/hooks/enrollment/use-current-subscription";

export default function ProfileTabScreen() {
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const [reminders, setReminders] = useState(true);
  const logoutMutation = useLogout();
  const logoutOffset = useSharedValue(0);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { data: freshUser } = useGetMe();
  const {
    label: subscriptionLabel,
    hasPremiumAccess,
    isLoading: subscriptionLoading,
  } = useCurrentSubscription();
  const displayName = user?.name?.trim() || "Bạn";
  const avatarSource = user?.avatar
    ? { uri: user.avatar }
    : require("../../assets/images/Profile.png");
  const profileScore = [
    user?.name,
    user?.email,
    user?.avatar,
    user?.phoneNumber,
    user?.dateOfBirth,
  ].filter(Boolean).length;

  React.useEffect(() => {
    if (freshUser) {
      updateUser(freshUser);
    }
  }, [freshUser, updateUser]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => router.replace("/(auth)"),
    });
  };

  React.useEffect(() => {
    logoutOffset.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 450 }),
        withTiming(0, { duration: 450 }),
      ),
      -1,
    );

    return () => cancelAnimation(logoutOffset);
  }, [logoutOffset]);

  const logoutAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: logoutOffset.value }],
  }));

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />

      {/* Main Scroll Container */}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* --- HEADER --- */}
        <AnimatedBlock variant="header" className="px-6 pt-2 pb-4 flex-row justify-between items-center bg-[#FDF8EA]">
          {/* Back Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-gray-100"
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#10120C"
              className="animate-arrow-left"
            />
          </TouchableOpacity>

          {/* Title */}
          <Text
            className="text-xl font-bold text-charcoal text-center"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            HỒ SƠ
          </Text>

          {/* Bell Notifications */}
          <NotificationButton inverted />
        </AnimatedBlock>

        {/* --- USER ACCOUNT CARD --- */}
        <AnimatedBlock variant="card" delay={90} className="bg-white rounded-[32px] p-5 mx-6 shadow-sm mb-6 mt-2 border border-gray-50">
          <View className="flex-row items-center mb-4">
            <View className="relative mr-4">
              <Image
                source={avatarSource}
                style={{ width: 64, height: 64, borderRadius: 32 }}
                className="shadow border border-gray-100"
              />
              {hasPremiumAccess && (
                <View className="absolute -top-4 -left-1.5 rotate-[-36deg] z-10">
                  <MaterialCommunityIcons name="crown" size={24} color="#FFB800" />
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text
                className="text-charcoal text-lg font-bold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                {displayName}
              </Text>
              <Text className="text-xs text-gray-400 font-bold mt-0.5">
                {user?.email || "Chưa có email"}
              </Text>

              <View className="flex-row flex-wrap items-center gap-2 mt-2">
                <View className="bg-[#E2E8D3] px-2.5 py-1 rounded-full">
                  <Text className="text-[10px] font-bold text-[#687451]">
                    Gói: {subscriptionLoading ? "Đang tải..." : subscriptionLabel}
                  </Text>
                </View>
                <View
                  className={`px-2.5 py-1 rounded-full ${
                    user?.isVerified ? "bg-[#E5F4EA]" : "bg-[#FFF1E6]"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      user?.isVerified ? "text-[#2F855A]" : "text-[#C05621]"
                    }`}
                  >
                    {user?.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                  </Text>
                </View>
              </View>
              
              {/* Ratings and trophies */}
              <View className="flex-row items-center mt-2 gap-4">
                <View className="flex-row items-center">
                  <Ionicons name="person-circle-outline" size={14} color="#8E9E6E" />
                  <Text className="text-xs font-bold text-charcoal/80 ml-1">{profileScore}/5 hồ sơ</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Edit Profile outline button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/profile/edit")}
            className="w-full bg-white border border-gray-200 py-3.5 rounded-full items-center justify-center shadow-sm"
          >
            <Text
              className="text-charcoal font-bold text-sm"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Chỉnh sửa hồ sơ
            </Text>
          </TouchableOpacity>
        </AnimatedBlock>

        {/* --- SECTION: HỌC TẬP (LEARNING SETTINGS) --- */}
        <AnimatedBlock variant="listItem" delay={140} className="mx-6 mb-6">
          <Text
            className="text-base font-bold text-charcoal mb-3 px-1"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Học tập
          </Text>

          <View className="bg-[#E2E8D3] rounded-3xl overflow-hidden border border-[#D6DDC6]/30">
            {/* Item 1: BPM */}
            <TouchableOpacity
              onPress={() => Alert.alert("Tốc độ mặc định", "Tính năng tùy chỉnh tốc độ (BPM) sẽ sớm ra mắt.")}
              className="flex-row justify-between items-center p-4.5 border-b border-white/40 active:bg-white/10 p-4"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="flash" size={16} color="#E0B034" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Tốc độ mặc định (BPM)
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 font-bold mr-2">80</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#6B7280"
                  className="animate-arrow-right"
                />
              </View>
            </TouchableOpacity>

            {/* Item 2: Notifications Switch */}
            <View className="flex-row justify-between items-center p-4.5 border-b border-white/40 p-4">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="notifications" size={16} color="#8E9E6E" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Nhắc nhở hàng ngày
                </Text>
              </View>
              <Switch
                value={reminders}
                onValueChange={setReminders}
                trackColor={{ false: "#D1D5DB", true: "#8E9E6E" }}
                thumbColor={reminders ? "white" : "#F4F3F4"}
              />
            </View>

            {/* Item 3: Mic Sensitivity */}
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/courses")}
              className="flex-row justify-between items-center p-4.5 border-b border-white/40 active:bg-white/10 p-4"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="mic" size={16} color="#8E9E6E" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Độ nhạy micro
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 font-bold mr-2">Bật</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#6B7280"
                  className="animate-arrow-right"
                />
              </View>
            </TouchableOpacity>

            {/* Item 4: Daily Goal */}
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/leaderboard")}
              className="flex-row justify-between items-center p-4.5 active:bg-white/10 p-4"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <MaterialCommunityIcons name="target" size={16} color="#8E9E6E" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Mục tiêu hằng ngày
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 font-bold mr-2">20 phút</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#6B7280"
                  className="animate-arrow-right"
                />
              </View>
            </TouchableOpacity>
          </View>
        </AnimatedBlock>

        {/* --- SECTION: CÀI ĐẶT (GENERAL SETTINGS) --- */}
        <AnimatedBlock variant="listItem" delay={190} className="mx-6 mb-6">
          <Text
            className="text-base font-bold text-charcoal mb-3 px-1"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Cài đặt
          </Text>

          <View className="bg-[#E2E8D3] rounded-3xl overflow-hidden border border-[#D6DDC6]/30">
            {/* Item 1: Personal Info */}
            <TouchableOpacity
              onPress={() => router.push("/profile/edit")}
              className="flex-row justify-between items-center p-4.5 border-b border-white/40 active:bg-white/10 p-4"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="person" size={16} color="#8E9E6E" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Thông tin cá nhân
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#6B7280"
                className="animate-arrow-right"
              />
            </TouchableOpacity>

            {/* Item 2: Current package */}
            <TouchableOpacity
              onPress={() => router.push("/profile/subscription")}
              className="flex-row justify-between items-center p-4.5 border-b border-white/40 active:bg-white/10 p-4"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="ribbon" size={16} color="#E0B034" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Gói học hiện tại
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 font-bold mr-2">
                  {subscriptionLoading ? "..." : subscriptionLabel}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#6B7280"
                  className="animate-arrow-right"
                />
              </View>
            </TouchableOpacity>

            {/* Item 3: Account verification */}
            <TouchableOpacity
              onPress={() => router.push("/profile/verify")}
              className="flex-row justify-between items-center p-4.5 border-b border-white/40 active:bg-white/10 p-4"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons
                    name={user?.isVerified ? "shield-checkmark" : "shield-outline"}
                    size={16}
                    color={user?.isVerified ? "#2F855A" : "#C05621"}
                  />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Xác thực tài khoản
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text
                  className={`text-xs font-bold mr-2 ${
                    user?.isVerified ? "text-[#2F855A]" : "text-[#C05621]"
                  }`}
                >
                  {user?.isVerified ? "Đã xác thực" : "Xác thực ngay"}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>

            {/* Item 4: Dark Mode */}
            <TouchableOpacity
              onPress={() => Alert.alert("Chế độ tối", "Giao diện tối chưa được thiết kế trong phiên bản hiện tại.")}
              className="flex-row justify-between items-center p-4.5 active:bg-white/10 p-4"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="moon" size={16} color="#8E9E6E" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Chế độ tối
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#6B7280"
                className="animate-arrow-right"
              />
            </TouchableOpacity>
          </View>
        </AnimatedBlock>

        {/* --- SECTION: KHÁC (OTHER SETTINGS) --- */}
        <AnimatedBlock variant="listItem" delay={240} className="mx-6 mb-6">
          <Text
            className="text-base font-bold text-charcoal mb-3 px-1"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Khác
          </Text>

          <View className="bg-[#E2E8D3] rounded-3xl overflow-hidden border border-[#D6DDC6]/30">
            {/* Item 1: Privacy Policy */}
            <TouchableOpacity
              onPress={() => router.push("/terms")}
              className="flex-row justify-between items-center p-4.5 active:bg-white/10 p-4"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark" size={16} color="#8E9E6E" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Chính sách bảo mật
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#6B7280"
                className="animate-arrow-right"
              />
            </TouchableOpacity>
          </View>
        </AnimatedBlock>

        {/* --- LOGOUT BUTTON --- */}
        <AnimatedBlock variant="button" delay={290}>
          <TouchableOpacity
            activeOpacity={0.9}
            className={`mx-6 bg-[#DC2626] py-4 rounded-2xl flex-row justify-center items-center shadow-sm border border-[#B91C1C] active:bg-[#B91C1C] ${
              logoutMutation.isPending ? "opacity-60" : ""
            }`}
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <Animated.View style={logoutAnimatedStyle}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color="white"
                className="mr-2"
                style={{ transform: [{ scaleX: -1 }] }}
              />
            </Animated.View>
            <Text
              className="text-white text-base font-bold ml-2"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
            </Text>
          </TouchableOpacity>
        </AnimatedBlock>
      </ScrollView>
    </SafeScreen>
  );
}
