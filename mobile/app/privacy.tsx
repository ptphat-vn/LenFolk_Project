import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AnimatedBlock } from "@/components/AnimatedPage";
import SafeScreen from "@/components/SafeScreen";

const sections = [
  {
    title: "Dữ liệu được thu thập",
    content:
      "LenFolk có thể thu thập thông tin tài khoản, tiến độ học tập, lịch sử luyện tập và dữ liệu âm thanh khi bạn chủ động sử dụng tính năng phân tích bằng AI.",
  },
  {
    title: "Mục đích sử dụng",
    content:
      "Dữ liệu được dùng để vận hành tài khoản, cá nhân hóa bài học, phân tích kỹ thuật thổi sáo, theo dõi tiến độ và cải thiện chất lượng dịch vụ.",
  },
  {
    title: "Âm thanh luyện tập",
    content:
      "Ứng dụng chỉ truy cập micro khi bạn cho phép và bắt đầu một phiên luyện tập. Dữ liệu âm thanh không được dùng cho mục đích quảng cáo.",
  },
  {
    title: "Chia sẻ và bảo vệ dữ liệu",
    content:
      "LenFolk không bán thông tin cá nhân. Dữ liệu chỉ được chia sẻ với nhà cung cấp dịch vụ cần thiết để vận hành hệ thống hoặc khi pháp luật yêu cầu.",
  },
  {
    title: "Quyền của bạn",
    content:
      "Bạn có thể cập nhật thông tin cá nhân, thu hồi quyền truy cập micro hoặc liên hệ LenFolk để yêu cầu truy cập, chỉnh sửa hay xóa dữ liệu tài khoản.",
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />
      <AnimatedBlock
        variant="header"
        className="flex-row items-center px-6 pb-4 pt-2"
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="arrow-back" size={22} color="#10120C" />
        </TouchableOpacity>
        <Text
          numberOfLines={2}
          className="min-w-0 flex-1 pr-10 text-center text-lg font-bold text-charcoal"
          style={{ fontFamily: "BeVietnamPro-Medium" }}
        >
          Chính sách bảo mật
        </Text>
      </AnimatedBlock>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <AnimatedBlock
          variant="card"
          delay={80}
          className="rounded-[32px] bg-white p-6"
        >
          <View className="gap-6">
            {sections.map((section) => (
              <View key={section.title}>
                <Text
                  numberOfLines={2}
                  className="mb-2 text-sm font-bold text-charcoal"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  {section.title}
                </Text>
                <Text className="text-sm leading-6 text-charcoal/65">
                  {section.content}
                </Text>
              </View>
            ))}
          </View>

          <Text className="mt-7 text-xs leading-5 text-charcoal/45">
            Cập nhật lần cuối: 15/06/2026
          </Text>
        </AnimatedBlock>
      </ScrollView>
    </SafeScreen>
  );
}
