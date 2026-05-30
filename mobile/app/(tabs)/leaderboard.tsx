import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProgressScreen() {
  const stats = [
    { title: "Tổng giờ", value: "14h 32m", icon: "time-outline", type: "ionicons" },
    { title: "Bài hoàn thành", value: "18/45", icon: "book-open-page-variant", type: "material" },
    { title: "Chuỗi học tập", value: "12 ngày", icon: "flame", type: "ionicons" },
    { title: "Điểm trung bình AI", value: "79/100", icon: "music", type: "feather" },
  ];

  const badges = [
    { name: "Bài học đầu tiên", icon: "book-outline", checked: true, progress: null },
    { name: "7 ngày liên tiếp", icon: "flame-outline", checked: true, progress: null },
    { name: "Âm thanh chuẩn", icon: "musical-notes-outline", checked: true, progress: null },
    { name: "Hoàn thành khóa", icon: "checkmark-circle-outline", checked: false, progress: "35%" },
  ];

  const history = [
    { title: "Bài 3: Thổi hơi", time: "5 giờ trước", score: "78%" },
    { title: "Bài 2: Cầm sáo", time: "Hôm qua", score: "85%" },
    { title: "Bài 1: Làm quen", time: "2 ngày trước", score: "98%" },
  ];

  return (
    <View className="flex-1 bg-[#FDF8EA]">
      <StatusBar style="dark" />

      {/* Main Scroll Container */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* --- HEADER --- */}
        <View className="px-6 pt-14 pb-4 flex-row justify-between items-center bg-[#FDF8EA]">
          {/* Back Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-gray-100"
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>

          {/* Title */}
          <Text
            className="text-xl font-bold text-charcoal text-center"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            TIẾN ĐỘ
          </Text>

          {/* Bell Notifications */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full justify-center items-center shadow"
            style={{ backgroundColor: Colors.light.primary }}
          >
            <Ionicons name="notifications" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* --- MASCOT POPPING & BUBBLE SPEECH --- */}
        <View className="relative h-28 mx-6 mt-2 z-20 flex-row items-end justify-between overflow-visible">
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
            style={{ width: 110, height: 110, resizeMode: "contain", marginBottom: -10 }}
          />
        </View>

        {/* --- PROGRESS USER CARD --- */}
        <View className="bg-white rounded-[32px] p-5 mx-6 shadow-sm mb-6 border border-gray-50">
          {/* User Profile Info Row */}
          <View className="flex-row items-center mb-5">
            <Image
              source={require("../../assets/images/Profile.png")}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              className="mr-3 shadow-sm border border-gray-100"
            />
            <View>
              <Text
                className="text-charcoal text-[15px] font-bold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Hoàng Minh
              </Text>
              <Text className="text-[11px] text-gray-400 font-bold mt-0.5">
                Level 5 · Học viên Trung cấp
              </Text>
            </View>
          </View>

          {/* Progress Tracker Slider */}
          <View>
            <View className="flex-row justify-between items-center mb-2 px-1">
              <Text className="text-[10px] text-gray-400 font-bold">XP</Text>
              <Text className="text-[10px] text-charcoal font-extrabold">2340 / 3000</Text>
            </View>
            
            {/* Custom Track Bar */}
            <View className="w-full h-2.5 bg-gray-100 rounded-full relative justify-center">
              {/* Fill Bar */}
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: "50%", backgroundColor: Colors.light.primary }}
              />
              {/* Center Floating Handle Badge */}
              <View 
                style={{ position: "absolute", left: "50%", marginLeft: -20 }}
                className="bg-white rounded-full px-2 py-0.5 shadow border border-gray-100 items-center justify-center"
              >
                <Text className="text-[9px] text-[#8E9E6E] font-extrabold">50%</Text>
              </View>
            </View>

            <Text className="text-[10px] text-[#8E9E6E] font-bold mt-2 px-1">
              Còn 660 XP → Level 6
            </Text>
          </View>
        </View>

        {/* --- STATS GRID CARDS (2 COLUMNS WITH CUSTOM CIRCULAR CUTOUT) --- */}
        <View className="flex-row flex-wrap gap-4 mx-6 mb-6">
          {stats.map((stat, idx) => (
            <View
              key={idx}
              className="bg-[#8E9E6E] rounded-3xl p-4.5 p-4 flex-1 min-w-[45%] relative overflow-hidden shadow-sm border border-[#8E9E6E]/20"
            >
              {/* Floating cutout circle on the right edge */}
              <View 
                style={{ position: "absolute", right: -12, top: "40%", width: 24, height: 24, borderRadius: 12 }}
                className="bg-[#FDF8EA]"
              />

              {/* Icon */}
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mb-4">
                {stat.type === "ionicons" && <Ionicons name={stat.icon as any} size={18} color="white" />}
                {stat.type === "material" && <MaterialCommunityIcons name={stat.icon as any} size={18} color="white" />}
                {stat.type === "feather" && <Feather name={stat.icon as any} size={16} color="white" />}
              </View>

              {/* Title & Value */}
              <Text className="text-[10px] text-white/70 font-semibold mb-1">{stat.title}</Text>
              <Text
                className="text-white text-base font-bold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        {/* --- WEEKLY ACTIVITY CHARTS --- */}
        <View className="bg-[#FFF9E6] rounded-[32px] p-5 mx-6 mb-6 shadow-sm border border-[#F4E0AC]/20">
          <Text
            className="text-sm font-bold text-charcoal mb-4 px-1"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Hoạt động tuần này
          </Text>

          {/* Bar Chart Visualization */}
          <View className="flex-row justify-between items-end h-24 mb-3 px-2">
            {[
              { day: "T2", height: "40%" },
              { day: "T3", height: "45%" },
              { day: "T4", height: "55%" },
              { day: "T5", height: "80%", active: true },
              { day: "T6", height: "40%" },
              { day: "T7", height: "50%" },
              { day: "CN", height: "60%" },
            ].map((bar, idx) => (
              <View key={idx} className="items-center flex-1">
                {/* Track */}
                <View className="w-5 h-20 bg-[#E6ECDB] rounded-full justify-end overflow-hidden mb-1.5">
                  {/* Fill */}
                  <View 
                    className={`w-full h-[${bar.height}] rounded-full ${bar.active ? "bg-[#8E9E6E]" : "bg-[#8E9E6E]/40"}`}
                  />
                </View>
                <Text className="text-[10px] text-charcoal/60 font-bold">{bar.day}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row justify-between items-center px-1 pt-2 border-t border-gray-150/40">
            <Text className="text-[10px] text-charcoal/60 font-semibold">Tổng tuần: <Text className="font-bold text-charcoal">118 phút</Text></Text>
            <Text className="text-[10px] text-primary font-bold">+240 XP</Text>
          </View>
        </View>

        {/* --- ACHIEVEMENTS BADGES ROW --- */}
        <View className="mb-6">
          <Text
            className="text-sm font-bold text-charcoal mb-4 mx-6"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Thành tích
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
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
                      <Text className="text-[8px] text-primary font-extrabold">{badge.progress}</Text>
                    </View>
                  )}
                </View>

                {/* Badge Center Icon */}
                <View className="w-10 h-10 rounded-full bg-white items-center justify-center mt-3 mb-3 shadow-sm">
                  <Ionicons name={badge.icon as any} size={20} color="#8E9E6E" />
                </View>

                {/* Badge title */}
                <Text className="text-[8px] text-charcoal font-bold text-center leading-3">{badge.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* --- PRACTICE HISTORY --- */}
        <View className="mx-6">
          <Text
            className="text-sm font-bold text-charcoal mb-4"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Lịch sử luyện tập
          </Text>

          <View className="gap-3.5">
            {history.map((item, idx) => (
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
                    <Text className="text-[10px] text-gray-400 font-bold mt-0.5">{item.time}</Text>
                  </View>
                </View>

                <Text className="text-sm font-extrabold text-charcoal/80">{item.score}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
