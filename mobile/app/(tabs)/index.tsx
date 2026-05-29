import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { Ionicons, FontAwesome5, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <ScrollView 
      className="flex-1 bg-[#FDF8EA]" // Cream/yellow soft base background matching headers
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <StatusBar style="dark" />

      {/* --- TOP CONTAINER (SOFT CREAM HEADER CARD) --- */}
      <View className="bg-[#FDF8EA] rounded-b-[40px] px-6 pt-14 pb-8 shadow-sm">
        {/* Welcome row */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <Image 
              source={require("../../assets/images/Profile.png")}
              style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "white" }}
              className="mr-3 shadow"
            />
            <View>
              <Text 
                className="text-primary text-base font-bold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Xin chào, Minh
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">Hôm nay bạn muốn học gì?</Text>
            </View>
          </View>

          {/* Bell Notifications */}
          <TouchableOpacity 
            activeOpacity={0.8}
            className="w-12 h-12 rounded-full bg-[#8E9E6E]/20 border border-[#8E9E6E]/10 justify-center items-center"
          >
            <Ionicons name="notifications" size={22} color="#8E9E6E" />
          </TouchableOpacity>
        </View>

        {/* Search Input Bar */}
        <View className="w-full flex-row items-center bg-white rounded-full px-5 py-3 shadow-sm border border-gray-100">
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput 
            className="flex-1 text-charcoal text-sm ml-3"
            placeholder="Tìm kiếm"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity className="pl-3 border-l border-gray-150">
            <Ionicons name="options-outline" size={20} color="#8E9E6E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- BODY SCRoll AREA (WHITE WRAPPER CONTAINER) --- */}
      <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-12 shadow-2xl -mt-6 flex-1">
        {/* Streak & Goals Block Row */}
        <View className="flex-row justify-between gap-4 mb-6">
          {/* Study streak points */}
          <View className="flex-1 bg-[#F3F4F6]/50 rounded-3xl p-4 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-200 justify-center items-center mr-3">
              <Ionicons name="flame" size={20} color="#E05B35" />
            </View>
            <View>
              <Text 
                className="text-charcoal text-base font-bold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                12 Điểm
              </Text>
              <Text className="text-[10px] text-gray-400 font-bold">Chuỗi học tập</Text>
            </View>
          </View>

          {/* Goals status */}
          <View className="flex-1 bg-[#8E9E6E]/10 rounded-3xl p-4 flex-row items-center justify-between">
            <View>
              <Text 
                className="text-primary text-sm font-extrabold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Mục tiêu
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="book-outline" size={12} color="#8E9E6E" />
                <Text className="text-[10px] text-gray-500 font-bold ml-1">1/2</Text>
              </View>
              <View className="flex-row items-center mt-0.5">
                <MaterialCommunityIcons name="weight-lifter" size={12} color="#8E9E6E" />
                <Text className="text-[10px] text-gray-500 font-bold ml-1">2/3</Text>
              </View>
            </View>
            <View className="w-10 h-10 rounded-full bg-[#8E9E6E]/20 items-center justify-center">
              <Ionicons name="checkmark-done-circle" size={22} color="#8E9E6E" />
            </View>
          </View>
        </View>

        {/* Continue lesson green banner button */}
        <TouchableOpacity
          activeOpacity={0.95}
          className="w-full bg-[#D6DDC6]/50 py-4.5 px-5 rounded-[24px] flex-row justify-between items-center border border-[#8E9E6E]/20 mb-8"
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-white border border-gray-100 justify-center items-center shadow-sm">
              <Ionicons name="book" size={22} color="#8E9E6E" />
            </View>
            <Text 
              className="text-charcoal text-base font-bold ml-4"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Tiếp tục bài học của bạn
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={22} color="#8E9E6E" />
        </TouchableOpacity>

        {/* Ôn tập hôm nay Section */}
        <View className="mb-8">
          <Text 
            className="text-lg font-bold text-charcoal mb-4"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Ôn tập hôm nay
          </Text>

          <View className="flex-row justify-between gap-3">
            {/* Luyện hơi 1 */}
            <View className="items-center flex-1">
              <TouchableOpacity className="w-14 h-14 rounded-full bg-[#8E9E6E]/15 border border-[#8E9E6E]/20 justify-center items-center mb-2">
                <MaterialCommunityIcons name="timer-music-outline" size={24} color="#8E9E6E" />
              </TouchableOpacity>
              <Text className="text-[11px] text-charcoal font-bold text-center">Luyện hơi 1</Text>
            </View>

            {/* Luyện hơi 2 */}
            <View className="items-center flex-1">
              <TouchableOpacity className="w-14 h-14 rounded-full bg-[#8E9E6E]/15 border border-[#8E9E6E]/20 justify-center items-center mb-2">
                <MaterialCommunityIcons name="timer-music-outline" size={24} color="#8E9E6E" />
              </TouchableOpacity>
              <Text className="text-[11px] text-charcoal font-bold text-center">Luyện hơi 2</Text>
            </View>

            {/* Luyện ngón */}
            <View className="items-center flex-1">
              <TouchableOpacity className="w-14 h-14 rounded-full bg-[#8E9E6E]/15 border border-[#8E9E6E]/20 justify-center items-center mb-2">
                <MaterialCommunityIcons name="gesture-tap" size={24} color="#8E9E6E" />
              </TouchableOpacity>
              <Text className="text-[11px] text-charcoal font-bold text-center">Luyện ngón</Text>
            </View>

            {/* Đánh lưỡi */}
            <View className="items-center flex-1">
              <TouchableOpacity className="w-14 h-14 rounded-full bg-[#8E9E6E]/15 border border-[#8E9E6E]/20 justify-center items-center mb-2">
                <Ionicons name="musical-notes-outline" size={22} color="#8E9E6E" />
              </TouchableOpacity>
              <Text className="text-[11px] text-charcoal font-bold text-center">Đánh lưỡi</Text>
            </View>
          </View>
        </View>

        {/* Bài học hôm nay Section */}
        <View className="mb-8">
          <Text 
            className="text-lg font-bold text-charcoal mb-4"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Bài học hôm nay
          </Text>

          {/* Mascot lesson board card */}
          <View className="w-full bg-[#8E9E6E]/70 rounded-[32px] p-6 relative overflow-visible shadow-sm">
            {/* Peaking mascot in the top right */}
            <Image 
              source={require("../../assets/images/mascot_like2.png")}
              style={{ width: 110, height: 110, resizeMode: "contain", position: "absolute", right: 10, top: -45, zIndex: 10 }}
            />

            <View className="flex-row justify-between gap-4 mt-2">
              {/* Lesson Card 1 */}
              <TouchableOpacity 
                activeOpacity={0.9}
                className="flex-1 bg-[#F8F9FA] rounded-2xl p-4 shadow-sm"
              >
                <Text className="text-xs text-gray-400 font-bold mb-1">01</Text>
                <Text 
                  className="text-charcoal text-sm font-bold leading-5 mb-3"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Kỹ thuật rung hơi
                </Text>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={12} color="gray" />
                    <Text className="text-[10px] text-gray-400 ml-1 font-bold">12 phút</Text>
                  </View>
                  <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
                    <Ionicons className="arrow-up-forward" size={12} color="#8E9E6E" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Lesson Card 2 */}
              <TouchableOpacity 
                activeOpacity={0.9}
                className="flex-1 bg-[#F8F9FA] rounded-2xl p-4 shadow-sm"
              >
                <Text className="text-xs text-gray-400 font-bold mb-1">02</Text>
                <Text 
                  className="text-charcoal text-sm font-bold leading-5 mb-3"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Luyện tập giai điệu
                </Text>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={12} color="gray" />
                    <Text className="text-[10px] text-gray-400 ml-1 font-bold">10 phút</Text>
                  </View>
                  <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
                    <Ionicons className="arrow-up-forward" size={12} color="#8E9E6E" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Lộ trình học tập Grid Section */}
        <View className="mb-10">
          <Text 
            className="text-lg font-bold text-charcoal mb-4"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Lộ trình học tập
          </Text>

          <View className="gap-4">
            {/* First Row */}
            <View className="flex-row gap-4">
              {/* Nhập môn */}
              <TouchableOpacity 
                activeOpacity={0.9}
                className="flex-1 bg-[#D6DDC6]/50 p-5 rounded-3xl border border-[#8E9E6E]/20 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <Ionicons name="document-text-outline" size={28} color="#8E9E6E" />
                  <Ionicons name="open-outline" size={18} color="#8E9E6E" />
                </View>
                <Text 
                  className="text-charcoal text-base font-bold"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Nhập môn
                </Text>
              </TouchableOpacity>

              {/* Cơ bản */}
              <TouchableOpacity 
                activeOpacity={0.9}
                className="flex-1 bg-[#D6DDC6]/50 p-5 rounded-3xl border border-[#8E9E6E]/20 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#8E9E6E" />
                  <Ionicons name="open-outline" size={18} color="#8E9E6E" />
                </View>
                <Text 
                  className="text-charcoal text-base font-bold"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Cơ bản
                </Text>
              </TouchableOpacity>
            </View>

            {/* Second Row (Locked) */}
            <View className="flex-row gap-4">
              {/* Trung cấp (Locked) */}
              <View className="flex-1 bg-[#8E9E6E]/20 p-5 rounded-3xl opacity-80 border border-gray-100 shadow-sm">
                <View className="flex-row justify-between items-start mb-4">
                  <Ionicons name="musical-note-outline" size={28} color="#8E9E6E" />
                  <Ionicons name="lock-closed" size={18} color="#8E9E6E" />
                </View>
                <Text 
                  className="text-charcoal text-base font-bold opacity-60"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Trung cấp
                </Text>
              </View>

              {/* Nâng cao (Locked) */}
              <View className="flex-1 bg-[#8E9E6E]/20 p-5 rounded-3xl opacity-80 border border-gray-100 shadow-sm">
                <View className="flex-row justify-between items-start mb-4">
                  <Ionicons name="school-outline" size={28} color="#8E9E6E" />
                  <Ionicons name="lock-closed" size={18} color="#8E9E6E" />
                </View>
                <Text 
                  className="text-charcoal text-base font-bold opacity-60"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Nâng cao
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
