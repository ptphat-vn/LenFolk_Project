import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProfileTabScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState(true);

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
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>

          {/* Title */}
          <Text
            className="text-xl font-bold text-charcoal text-center"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            HỒ SƠ
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

        {/* --- USER ACCOUNT CARD --- */}
        <View className="bg-white rounded-[32px] p-5 mx-6 shadow-sm mb-6 mt-2 border border-gray-50">
          <View className="flex-row items-center mb-4">
            <Image
              source={require("../../assets/images/Profile.png")}
              style={{ width: 64, height: 64, borderRadius: 32 }}
              className="mr-4 shadow border border-gray-100"
            />
            <View className="flex-1">
              <Text
                className="text-charcoal text-lg font-bold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Hoàng Minh
              </Text>
              <Text className="text-xs text-gray-400 font-bold mt-0.5">
                nguyenhoangminh4455@gmail.com
              </Text>
              
              {/* Ratings and trophies */}
              <View className="flex-row items-center mt-2 gap-4">
                <View className="flex-row items-center">
                  <Text className="text-xs">⭐</Text>
                  <Text className="text-xs font-bold text-charcoal/80 ml-1">2.980</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-xs">🏆</Text>
                  <Text className="text-xs font-bold text-charcoal/80 ml-1">3</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Edit Profile outline button */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-full bg-white border border-gray-200 py-3.5 rounded-full items-center justify-center shadow-sm"
          >
            <Text
              className="text-charcoal font-bold text-sm"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Chỉnh sửa hồ sơ
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- SECTION: HỌC TẬP (LEARNING SETTINGS) --- */}
        <View className="mx-6 mb-6">
          <Text
            className="text-base font-bold text-charcoal mb-3 px-1"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Học tập
          </Text>

          <View className="bg-[#E2E8D3] rounded-3xl overflow-hidden border border-[#D6DDC6]/30">
            {/* Item 1: BPM */}
            <TouchableOpacity className="flex-row justify-between items-center p-4.5 border-b border-white/40 active:bg-white/10 p-4">
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
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
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
            <TouchableOpacity className="flex-row justify-between items-center p-4.5 border-b border-white/40 active:bg-white/10 p-4">
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
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>

            {/* Item 4: Daily Goal */}
            <TouchableOpacity className="flex-row justify-between items-center p-4.5 active:bg-white/10 p-4">
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
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- SECTION: CÀI ĐẶT (GENERAL SETTINGS) --- */}
        <View className="mx-6 mb-6">
          <Text
            className="text-base font-bold text-charcoal mb-3 px-1"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Cài đặt
          </Text>

          <View className="bg-[#E2E8D3] rounded-3xl overflow-hidden border border-[#D6DDC6]/30">
            {/* Item 1: Personal Info */}
            <TouchableOpacity className="flex-row justify-between items-center p-4.5 border-b border-white/40 active:bg-white/10 p-4">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="person" size={16} color="#8E9E6E" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Thông tin cá nhân
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>

            {/* Item 2: Upgrade Premium */}
            <TouchableOpacity className="flex-row justify-between items-center p-4.5 border-b border-white/40 active:bg-white/10 p-4">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="ribbon" size={16} color="#E0B034" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Nâng cấp Premium
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>

            {/* Item 3: Dark Mode */}
            <TouchableOpacity className="flex-row justify-between items-center p-4.5 active:bg-white/10 p-4">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="moon" size={16} color="#8E9E6E" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Chế độ tối
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- SECTION: KHÁC (OTHER SETTINGS) --- */}
        <View className="mx-6 mb-6">
          <Text
            className="text-base font-bold text-charcoal mb-3 px-1"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Khác
          </Text>

          <View className="bg-[#E2E8D3] rounded-3xl overflow-hidden border border-[#D6DDC6]/30">
            {/* Item 1: Privacy Policy */}
            <TouchableOpacity className="flex-row justify-between items-center p-4.5 active:bg-white/10 p-4">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-8 h-8 rounded-full bg-white/40 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark" size={16} color="#8E9E6E" />
                </View>
                <Text className="text-sm font-bold text-charcoal" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                  Chính sách bảo mật
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- LOGOUT BUTTON --- */}
        <TouchableOpacity
          activeOpacity={0.9}
          className="mx-6 bg-[#E2E8D3] py-4 rounded-2xl flex-row justify-center items-center shadow-sm border border-gray-200/20 active:bg-white/10"
          onPress={() => router.replace("/(auth)")}
        >
          <Ionicons name="log-out-outline" size={20} color="#8E9E6E" className="mr-2" style={{ transform: [{ scaleX: -1 }] }} />
          <Text
            className="text-charcoal/80 text-base font-bold ml-2"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
