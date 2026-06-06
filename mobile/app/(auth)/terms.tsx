import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedBlock } from "@/components/AnimatedPage";

export default function TermsScreen() {
  const router = useRouter();
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleAccept = () => {
    if (agreeTerms) {
      router.push("/profile");
    }
  };

  return (
    <View className="flex-1 bg-white pt-14 pb-10">
      <StatusBar style="dark" />

      {/* --- HEADER --- */}
      <AnimatedBlock variant="header" className="flex-row justify-between items-center px-6 mb-6">
        {/* Back Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-10 h-10 rounded-full justify-center items-center active:bg-gray-100"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#10120C" className="animate-arrow-left" />
        </TouchableOpacity>

        {/* Title */}
        <Text
          className="text-lg font-bold text-charcoal text-center"
          style={{ fontFamily: "BeVietnamPro-Medium" }}
        >
          Điều khoản và Điều kiện
        </Text>

        {/* Notification Bell Badge Green Circle */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-10 h-10 rounded-full justify-center items-center"
          style={{ backgroundColor: Colors.light.primary }}
        >
          <Ionicons name="notifications" size={20} color="white" />
        </TouchableOpacity>
      </AnimatedBlock>

      {/* --- SCROLL CONTENT --- */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Large Cream Card containing terms */}
        <AnimatedBlock variant="card" delay={80} className="bg-[#FFF9E6] rounded-[40px] px-6 py-10 shadow-sm mb-8">
          <Text className="text-charcoal/80 text-sm leading-6 mb-6 font-medium text-justify">
            Khi sử dụng Lenfolk, người dùng đồng ý tuân thủ các điều khoản của nền tảng. Tài khoản cá nhân cần được bảo mật và không chia sẻ cho người khác. Toàn bộ bài học, video và tài liệu trên Lenfolk thuộc quyền sở hữu của ứng dụng và không được sao chép hay phát tán trái phép.
          </Text>

          <Text className="text-charcoal/80 text-sm leading-6 mb-6 font-medium text-justify">
            Lenfolk có thể sử dụng dữ liệu âm thanh để AI phân tích kỹ thuật thổi sáo và cải thiện trải nghiệm học tập. Một số tính năng hoặc khóa học nâng cao có thể yêu cầu thanh toán để truy cập.
          </Text>

          <Text className="text-charcoal/80 text-sm leading-6 font-medium text-justify">
            Người dùng không được đăng tải nội dung xúc phạm, spam hoặc gây ảnh hưởng tiêu cực đến cộng đồng. Lenfolk có quyền cập nhật điều khoản và thay đổi nội dung ứng dụng khi cần thiết. Việc tiếp tục sử dụng ứng dụng đồng nghĩa với việc bạn chấp nhận các điều khoản trên.
          </Text>
        </AnimatedBlock>

        {/* Checkbox agreement row */}
        <AnimatedBlock variant="chip" delay={150}>
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center mb-8 px-2"
            onPress={() => setAgreeTerms(!agreeTerms)}
          >
          <View
            className={`w-6 h-6 rounded border items-center justify-center ${
              agreeTerms ? "bg-primary border-primary" : "border-primary/50 bg-white"
            }`}
            style={agreeTerms ? { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary } : {}}
          >
            {agreeTerms && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text className="text-[13px] text-charcoal/90 ml-3 font-semibold leading-5 flex-1">
            Tôi đồng ý với tất cả các điều khoản và điều kiện.
          </Text>
          </TouchableOpacity>
        </AnimatedBlock>

        {/* Green Sage Submit Button "Chấp Nhận" */}
        <AnimatedBlock variant="button" delay={220}>
          <TouchableOpacity
            activeOpacity={0.9}
            className={`w-full py-4.5 rounded-full items-center justify-center shadow-md py-4 ${
              agreeTerms ? "opacity-100" : "opacity-50"
            }`}
            style={{ backgroundColor: agreeTerms ? "#9AA87E" : "#C2C5BA" }}
            disabled={!agreeTerms}
            onPress={handleAccept}
          >
          <Text
            className="text-[#10120C] text-base font-bold"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Chấp Nhận
          </Text>
          </TouchableOpacity>
        </AnimatedBlock>
      </ScrollView>
    </View>
  );
}
