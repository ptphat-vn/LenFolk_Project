import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function GameScreen() {
  const games = [
    {
      title: "Thổi Theo Nhịp",
      badge: "Khó + 20 XP/vòng",
      desc: "Thổi đúng theo nhịp metronome. Luyện cảm giác nhịp điệu chuyên nghiệp.",
      icon: "wind-power",
      type: "material",
    },
    {
      title: "Nghe & Đoán Nốt",
      badge: "Dễ + 10 XP/câu",
      desc: "Nghe âm thanh và chọn đúng nốt nhạc. Luyện tai nghe âm thanh.",
      icon: "headphones",
      type: "feather",
    },
    {
      title: "Bấm Đúng Nốt",
      badge: "Trung bình + 15 XP/câu",
      desc: "Nhìn nốt nhạc hiển thị và bấm đúng lỗ trên sáo. Luyện kỹ thuật bấm.",
      icon: "music-note",
      type: "material",
    },
  ];

  const tops = [
    { rank: 4, name: "Lan Anh", score: "3.540", avatar: require("../../assets/images/Profile.png") },
    { rank: 5, name: "Minh Quân", score: "2.892", avatar: require("../../assets/images/Profile.png") },
    { rank: 6, name: "Hùng Nhân", score: "2.248", avatar: require("../../assets/images/Profile.png") },
    { rank: 7, name: "Ngọc Hiển", score: "2.126", avatar: require("../../assets/images/Profile.png") },
    { rank: 8, name: "Tú Ngân", score: "1.902", avatar: require("../../assets/images/Profile.png") },
    { rank: 9, name: "Hải Lan", score: "1.830", avatar: require("../../assets/images/Profile.png") },
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
            TRÒ CHƠI
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

        {/* --- DAILY CHALLENGE GREEN BANNER CARD --- */}
        <View 
          className="mx-6 bg-[#8E9E6E] p-5 rounded-[32px] mb-6 shadow-sm border border-[#8E9E6E]/20 relative flex-row justify-between items-center"
        >
          {/* Left Contents */}
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-white text-[15px] font-extrabold" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                ⚡ THÁCH THỨC NGÀY
              </Text>
              
              {/* Gold Multiplier badge */}
              <View className="bg-[#FFF9E6] px-2 py-0.5 rounded-md ml-3 border border-[#F4E0AC]/40">
                <Text className="text-[9px] text-[#8E9E6E] font-extrabold">X3 XP</Text>
              </View>
            </View>

            <Text className="text-white/80 text-xs font-semibold mb-3">
              Chơi 3 trò, nhận thưởng lớn
            </Text>

            {/* Slider track progress bar */}
            <View className="w-full bg-white/20 h-2 rounded-full mb-1">
              <View className="h-full bg-white rounded-full" style={{ width: "33%" }} />
            </View>
            <Text className="text-[9px] text-white/90 font-bold">1/3 hoàn thành</Text>
          </View>

          {/* Right Pause circle button */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm"
          >
            <Ionicons name="pause" size={20} color="#8E9E6E" />
          </TouchableOpacity>
        </View>

        {/* --- CAROUSEL SELECT GAMES SECTION --- */}
        <View className="mb-8">
          <Text
            className="text-base font-bold text-charcoal mb-4 mx-6"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Chọn trò chơi:
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {games.map((game, idx) => (
              <View
                key={idx}
                className="w-64 bg-[#E2E8D3] rounded-[32px] p-5 shadow-sm border border-[#D6DDC6]/30 flex-col justify-between my-2"
                style={{ minHeight: 180 }}
              >
                {/* Header Row */}
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
                    {game.type === "material" && <MaterialCommunityIcons name={game.icon as any} size={20} color="#8E9E6E" />}
                    {game.type === "feather" && <Feather name={game.icon as any} size={18} color="#8E9E6E" />}
                  </View>
                  <View className="ml-3 flex-1">
                    <Text
                      className="text-charcoal text-sm font-bold leading-5"
                      style={{ fontFamily: "BeVietnamPro-Medium" }}
                    >
                      {game.title}
                    </Text>
                    <Text className="text-[8px] text-[#8E9E6E] font-bold">{game.badge}</Text>
                  </View>
                </View>

                {/* Description */}
                <Text className="text-charcoal/70 text-[11px] leading-5 font-semibold mb-4 text-left">
                  {game.desc}
                </Text>

                {/* Submit Play Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="w-full bg-[#FFF9E6] py-2.5 rounded-full items-center justify-center border border-[#F4E0AC]/30 shadow-sm"
                >
                  <Text
                    className="text-charcoal font-bold text-xs"
                    style={{ fontFamily: "BeVietnamPro-Medium" }}
                  >
                    Bắt đầu chơi
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View className="flex-row justify-center gap-1.5 mt-4">
            <View className="w-1.5 h-1.5 rounded-full bg-[#8E9E6E]" />
            <View className="w-1.5 h-1.5 rounded-full bg-[#C2C5BA]" />
            <View className="w-1.5 h-1.5 rounded-full bg-[#C2C5BA]" />
          </View>
        </View>

        {/* --- WEEKLY TOP LEADERBOARD PODIUMS --- */}
        <View className="mx-6 mb-3 flex-row justify-between items-center">
          <Text
            className="text-base font-bold text-charcoal"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Top tuần này
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-xs text-[#8E9E6E] font-bold mr-1">Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={14} color="#8E9E6E" />
          </TouchableOpacity>
        </View>

        {/* Podiums visualization */}
        <View className="flex-row justify-around items-end h-40 mx-10 mb-2 relative z-20">
          {/* Rank 2 (Silver) */}
          <View className="items-center">
            <View className="relative mb-2">
              <Image source={require("../../assets/images/Profile.png")} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#C0C0C0" }} />
              <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#C0C0C0] items-center justify-center border border-white">
                <Text className="text-[8px] text-white font-extrabold">2</Text>
              </View>
            </View>
            <Text className="text-[10px] font-bold text-charcoal mb-0.5">Minh Anh</Text>
            {/* Column Bar 2 */}
            <View style={{ width: 44, height: 50 }} className="bg-[#8E9E6E]/60 rounded-t-xl items-center justify-center">
              <Text className="text-[14px] text-white font-black">2</Text>
            </View>
          </View>

          {/* Rank 1 (Gold) */}
          <View className="items-center">
            <View className="relative mb-3">
              <Image source={require("../../assets/images/Profile.png")} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: "#F4E0AC" }} />
              <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#F4E0AC] items-center justify-center border border-white shadow-sm">
                <Text className="text-[9px] text-[#8E9E6E] font-black">👑</Text>
              </View>
            </View>
            <Text className="text-xs font-bold text-charcoal mb-0.5">Hoàng Minh</Text>
            {/* Column Bar 1 */}
            <View style={{ width: 50, height: 75 }} className="bg-[#8E9E6E] rounded-t-xl items-center justify-center">
              <Text className="text-[18px] text-white font-black">1</Text>
            </View>
          </View>

          {/* Rank 3 (Bronze) */}
          <View className="items-center">
            <View className="relative mb-2">
              <Image source={require("../../assets/images/Profile.png")} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#CD7F32" }} />
              <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#CD7F32] items-center justify-center border border-white">
                <Text className="text-[8px] text-white font-extrabold">3</Text>
              </View>
            </View>
            <Text className="text-[10px] font-bold text-charcoal mb-0.5">Bảo Lâm</Text>
            {/* Column Bar 3 */}
            <View style={{ width: 44, height: 40 }} className="bg-[#8E9E6E]/60 rounded-t-xl items-center justify-center">
              <Text className="text-[14px] text-white font-black">3</Text>
            </View>
          </View>
        </View>

        {/* --- CREAM BASE CONTAINER LISTING OTHERS --- */}
        <View 
          className="bg-[#FFF9E6] rounded-[40px] pt-8 pb-6 px-6 mx-6 shadow-sm -mt-6 border border-[#F4E0AC]/20 relative z-10"
        >
          {tops.map((top, idx) => (
            <View
              key={idx}
              className="w-full bg-[#8E9E6E] p-4.5 p-3.5 mb-3 rounded-2xl flex-row items-center justify-between shadow-sm border border-[#8E9E6E]/20"
            >
              {/* Left Rank & Avatar/Name */}
              <View className="flex-row items-center flex-1">
                {/* Rank circle */}
                <View className="w-6 h-6 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
                  <Text className="text-[10px] text-primary font-extrabold">{top.rank}</Text>
                </View>
                
                {/* Avatar */}
                <Image source={top.avatar} style={{ width: 32, height: 32, borderRadius: 16 }} className="mr-3" />
                
                {/* Name */}
                <Text
                  className="text-white text-xs font-bold"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  {top.name}
                </Text>
              </View>

              {/* Score gold text */}
              <Text className="text-xs text-[#F4E0AC] font-black">{top.score} điểm</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
