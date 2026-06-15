import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { AnimatedBlock } from "@/components/AnimatedPage";
import { useScrollToTopOnFocus } from "@/hooks/use-scroll-to-top-on-focus";
import { useAuthStore } from "@/store/authStore";
import SafeScreen from "../../components/SafeScreen";
import { useGetPracticeSessions } from "@/hooks/practice-session/use-get-practice-sessions";
import NotificationButton from "@/components/NotificationButton";
import { useRouter } from "expo-router";
import { useCurrentSubscription } from "@/hooks/enrollment/use-current-subscription";

export default function ProgressScreen() {
  const scrollRef = useScrollToTopOnFocus();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const {
    label: subscriptionLabel,
    hasPremiumAccess,
    isLoading: subscriptionLoading,
  } = useCurrentSubscription();
  const displayName = user?.name?.trim() || "Bạn";
  const avatarSource = user?.avatar
    ? { uri: user.avatar }
    : require("../../assets/images/Profile.png");
  const completedProfileFields = [
    user?.name,
    user?.email,
    user?.avatar,
    user?.phoneNumber,
    user?.dateOfBirth,
  ].filter(Boolean).length;
  const profileProgress = Math.round((completedProfileFields / 5) * 100);
  const formatDate = (date?: string | null) =>
    date
      ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date))
      : "Chưa có";

  const stats = [
    { title: "Vai trò", value: user?.role || "learner", icon: "person-outline", type: "ionicons" },
    { title: "Trạng thái", value: user?.isActive ? "Hoạt động" : "Tạm khóa", icon: "pulse-outline", type: "ionicons" },
    { title: "Gói học", value: subscriptionLoading ? "Đang tải..." : subscriptionLabel, icon: "book-open-page-variant", type: "material" },
    { title: "Đăng nhập", value: formatDate(user?.lastLoginAt), icon: "music", type: "feather" },
  ];

  const badges = [
    { name: "Đã thêm email", icon: "mail-outline", checked: Boolean(user?.email), progress: user?.email ? null : "0%" },
    { name: "Có ảnh đại diện", icon: "person-circle-outline", checked: Boolean(user?.avatar), progress: user?.avatar ? null : "0%" },
    { name: "Số điện thoại", icon: "call-outline", checked: Boolean(user?.phoneNumber), progress: user?.phoneNumber ? null : "0%" },
    { name: "Ngày sinh", icon: "calendar-outline", checked: Boolean(user?.dateOfBirth), progress: user?.dateOfBirth ? null : "0%" },
  ];

  const { data: practiceSessions, isLoading: sessionsLoading } = useGetPracticeSessions();

  const staticHistory = [
    { title: "Tạo tài khoản", time: formatDate(user?.createdAt), score: user?.isActive ? "Đang hoạt động" : "Tạm khóa" },
    { title: "Cập nhật hồ sơ", time: formatDate(user?.updatedAt), score: `${profileProgress}%` },
    { title: "Lần đăng nhập gần nhất", time: formatDate(user?.lastLoginAt), score: "Thành công" },
  ];

  const practiceHistory = (() => {
    if (!practiceSessions || practiceSessions.length === 0) {
      return staticHistory;
    }
    return practiceSessions.slice(0, 10).map((session) => {
      const dateStr = session.createdAt ? formatDate(session.createdAt) : "Chưa có";
      let statusStr = "Thất bại";
      if (session.status === "completed") {
        statusStr = `Điểm: ${session.aiScore ?? 0}`;
      } else if (session.status === "pending") {
        statusStr = "Chờ duyệt";
      } else if (session.status === "processing") {
        statusStr = "Đang xử lý";
      }
      return {
        title: "Luyện sáo",
        time: dateStr,
        score: statusStr,
      };
    });
  })();

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
        <AnimatedBlock variant="header" className="px-6 pt-2 flex-row justify-between items-center bg-[#FDF8EA]">
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
            TIẾN ĐỘ
          </Text>

          {/* Bell Notifications */}
          <NotificationButton inverted />
        </AnimatedBlock>

        {/* --- MASCOT POPPING & BUBBLE SPEECH --- */}
        <AnimatedBlock variant="hero" delay={80} className="relative h-28 mx-20 z-50 mt-[-20] flex-row items-end justify-between overflow-visible">
          {/* Speech Bubble */}
          <View className="bg-white rounded-3xl px-5 py-3 shadow-md border border-gray-100 mb-2 relative max-w-[65%]">
            <Text className="text-xs text-charcoal font-bold leading-5">
              Sắp chạm mục tiêu rồi nè!
            </Text>
            {/* Triangle tail */}
            <View 
              style={{
                position: "absolute",
                right: -8,
                bottom: 12,
                width: 0,
                height: 0,
                borderTopWidth: 6,
                borderTopColor: "transparent",
                borderBottomWidth: 6,
                borderBottomColor: "transparent",
                borderLeftWidth: 8,
                borderLeftColor: "white",
              }}
            />
          </View>

          {/* Mascot Popping Up */}
          <Image
            source={require("../../assets/images/mascot_like2.png")}
            style={{ width: 110, height: 110, resizeMode: "contain", marginBottom: -28 }}
          />
        </AnimatedBlock>

        {/* --- PROGRESS USER CARD --- */}
        <AnimatedBlock variant="card" delay={130} className="bg-white rounded-[32px] p-5 mx-6 shadow-sm mb-6 border border-gray-50">
          <View className="flex-row items-center mb-5">
            <View className="relative mr-3">
              <Image
                source={avatarSource}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                className="shadow-sm border border-gray-100"
              />
              {hasPremiumAccess && (
                <View className="absolute -top-3.5 -left-1.5 rotate-[-36deg] z-10">
                  <MaterialCommunityIcons name="crown" size={20} color="#FFB800" />
                </View>
              )}
            </View>
            <View>
              <Text
                className="text-charcoal text-[16px] font-bold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                {displayName}
              </Text>
              <Text className="text-[13px] text-gray-400 font-bold mt-0.5">
                {user?.email || "Chưa có email"}
              </Text>
            </View>
          </View>

          {/* Progress Tracker Slider */}
          <View>
            <View className="flex-row justify-between items-center mb-2 px-1">
              <Text className="text-[12px] text-gray-400 font-bold">XP</Text>
              <Text className="text-[12px] text-charcoal font-extrabold">{profileProgress}%</Text>
            </View>
            
            {/* Custom Track Bar */}
            <View className="w-full h-2.5 bg-gray-100 rounded-full relative justify-center">
              {/* Fill Bar */}
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${profileProgress}%`, backgroundColor: Colors.light.primary }}
              />
              {/* Center Floating Handle Badge */}
              <View 
                style={{ position: "absolute", left: `${profileProgress}%`, marginLeft: -20 }}
                className="bg-white rounded-full px-2 py-0.5 shadow border border-gray-100 items-center justify-center"
              >
                <Text className="text-[13px] text-[#8E9E6E] font-extrabold">{profileProgress}%</Text>
              </View>
            </View>

            <Text className="text-[12px] text-[#8E9E6E] font-bold mt-2 px-1">
              Hồ sơ được tính từ dữ liệu tài khoản đã đăng nhập
            </Text>
          </View>
        </AnimatedBlock>

        {/* --- STATS GRID CARDS (2 COLUMNS WITH CUSTOM CIRCULAR CUTOUT) --- */}
        <AnimatedBlock variant="chip" delay={180} className="flex-row flex-wrap justify-between mx-6 mb-6 gap-y-4">
          {stats.map((stat, idx) => (
            <View
              key={idx}
              style={{ width: "48%" }}
              className="bg-[#8E9E6E] rounded-3xl p-4 relative overflow-hidden shadow-sm border border-[#8E9E6E]/20"
            >
              {/* Icon */}
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mb-4">
                {stat.type === "ionicons" && <Ionicons name={stat.icon as any} size={18} color="white" />}
                {stat.type === "material" && <MaterialCommunityIcons name={stat.icon as any} size={18} color="white" />}
                {stat.type === "feather" && <Feather name={stat.icon as any} size={16} color="white" />}
              </View>

              {/* Title & Value */}
              <Text className="text-[12px] text-white/70 font-semibold mb-1">{stat.title}</Text>
              <Text
                className="text-white text-base font-bold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </AnimatedBlock>

        {/* --- WEEKLY ACTIVITY CHARTS --- */}
        <AnimatedBlock variant="card" delay={230} className="bg-[#FFF9E6] rounded-[32px] p-5 mx-6 mb-6 shadow-sm border border-[#F4E0AC]/20">
          <Text
            className="text-sm font-bold text-charcoal mb-4 px-1"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Hoạt động tuần này
          </Text>

          {/* Bar Chart Visualization */}
          <View className="flex-row justify-between items-end h-24 mb-3 px-2">
            {[
              { day: "T2", height: 32 },
              { day: "T3", height: 36 },
              { day: "T4", height: 44 },
              { day: "T5", height: 64, active: true },
              { day: "T6", height: 32 },
              { day: "T7", height: 40 },
              { day: "CN", height: 48 },
            ].map((bar, idx) => (
              <View key={idx} className="items-center flex-1">
                {/* Track */}
                <View className="w-5 h-20 bg-[#E6ECDB] rounded-full justify-end overflow-hidden mb-1.5">
                  {/* Fill */}
                  <View 
                    className={`w-full rounded-full ${bar.active ? "bg-[#8E9E6E]" : "bg-[#8E9E6E]/40"}`}
                    style={{ height: bar.height }}
                  />
                </View>
                <Text className="text-[12px] text-charcoal/60 font-bold">{bar.day}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row justify-between items-center px-1 pt-2 border-t border-gray-150/40">
            <Text className="text-[12px] text-charcoal/60 font-semibold">Nguồn: <Text className="font-bold text-charcoal">Tài khoản</Text></Text>
            <Text className="text-[12px] text-primary font-bold">{profileProgress}% hồ sơ</Text>
          </View>
        </AnimatedBlock>

        {/* --- ACHIEVEMENTS BADGES ROW --- */}
        <AnimatedBlock variant="chip" delay={280} className="mb-6">
          <Text
            className="text-sm font-bold text-charcoal mb-4 mx-6"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Thành tích
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 6, gap: 12 }}
          >
            {badges.map((badge, idx) => (
              <View
                key={idx}
                className="w-24 bg-[#E2E8D3] rounded-3xl p-3 items-center relative shadow-sm border border-[#D6DDC6]/30"
              >
                {/* Floating badge top-left indicator */}
                <View className="absolute top-1.5 left-1.5">
                  {badge.checked ? (
                    <View className="w-5 h-5 rounded-full bg-[#8E9E6E] items-center justify-center border border-white">
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  ) : (
                    <View className="bg-[#FFF9E6] px-1 py-0.5 rounded-full border border-primary/20 items-center justify-center">
                      <Text className="text-[11px] text-primary font-extrabold">{badge.progress}</Text>
                    </View>
                  )}
                </View>

                {/* Badge Center Icon */}
                <View className="w-10 h-10 rounded-full bg-white items-center justify-center mt-3 mb-3 shadow-sm">
                  <Ionicons name={badge.icon as any} size={20} color="#8E9E6E" />
                </View>

                {/* Badge title */}
                <Text className="text-[12px] text-charcoal font-bold text-center leading-3 py-1">{badge.name}</Text>
              </View>
            ))}
          </ScrollView>
        </AnimatedBlock>

        {/* --- PRACTICE HISTORY --- */}
        <AnimatedBlock variant="listItem" delay={330} className="mx-6">
          <Text
            className="text-sm font-bold text-charcoal mb-4"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Lịch sử luyện tập
          </Text>

          <View className="gap-3.5">
            {sessionsLoading ? (
              <ActivityIndicator size="small" color="#8E9E6E" className="py-6" />
            ) : (
              practiceHistory.map((item, idx) => (
                <View
                  key={idx}
                  className="w-full bg-[#E2E8D3] rounded-3xl p-4 flex-row items-center justify-between shadow-sm border border-[#D6DDC6]/30"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-9 h-9 rounded-full bg-white items-center justify-center mr-3 border border-[#8E9E6E]/20 shadow-sm">
                      <Ionicons name="checkmark" size={18} color="#8E9E6E" />
                    </View>
                    <View>
                      <Text
                        className="text-charcoal text-sm font-bold"
                        style={{ fontFamily: "BeVietnamPro-Medium" }}
                      >
                        {item.title}
                      </Text>
                      <Text className="text-[12px] text-gray-400 font-bold mt-0.5">{item.time}</Text>
                    </View>
                  </View>

                  <Text className="text-sm font-extrabold text-charcoal/80">{item.score}</Text>
                </View>
              ))
            )}
          </View>
        </AnimatedBlock>
      </ScrollView>
    </SafeScreen>
  );
}
