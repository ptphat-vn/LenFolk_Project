import { getApiErrorMessage } from "@/lib/api-error";
import React, { useState } from "react";
import { ActivityIndicator, Alert, TextInput, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather } from "@expo/vector-icons";
import { AnimatedBlock } from "@/components/AnimatedPage";
import { useForgotPassword } from "@/hooks/auth/use-forgot-password";

export default function ForgotChoiceScreen() {
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "sms">("email");
  const [email, setEmail] = useState("");
  const forgotMutation = useForgotPassword();

  const handleSend = () => {
    if (method === "sms") {
      Alert.alert("Chưa hỗ trợ", "Hiện tại chỉ hỗ trợ đặt lại mật khẩu qua Email.");
      return;
    }
    const value = email.trim();
    if (!value) {
      Alert.alert("Lỗi", "Vui lòng nhập email của bạn.");
      return;
    }

    forgotMutation.mutate(value, {
      // Backend trả message trung tính (không lộ email tồn tại hay không) → luôn sang bước nhập mã.
      onSuccess: () => {
        router.push({ pathname: "/otp", params: { email: value } });
      },
      onError: (error: any) => {
        Alert.alert("Lỗi", getApiErrorMessage(error, "Vui lòng thử lại sau."));
      },
    });
  };

  return (
    <View className="flex-1 bg-white pt-14 px-6 pb-12">
      <StatusBar style="dark" />

      {/* Giới hạn bề rộng nội dung trên màn hình lớn (iPad) */}
      <View className="flex-1 w-full max-w-[480px] self-center justify-between">

      {/* Header Area */}
      <AnimatedBlock variant="panel">
        <AnimatedBlock variant="header" className="flex-row items-center mb-10">
          <TouchableOpacity
            className="p-2 rounded-full bg-gray-50 mr-4"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#10120C" className="animate-arrow-left" />
          </TouchableOpacity>
          <Text
            className="text-2xl font-bold text-charcoal"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Quên mật khẩu
          </Text>
        </AnimatedBlock>

        {/* Info Description */}
        <AnimatedBlock variant="chip" delay={80}>
          <Text className="text-base text-gray-500 leading-7 text-center px-4 mb-10 mt-6">
            Hãy chọn thông tin liên hệ mà chúng tôi sẽ sử dụng để đặt lại mật khẩu của bạn.
          </Text>
        </AnimatedBlock>

        {/* Choice Cards */}
        <AnimatedBlock variant="card" delay={150} className="gap-5">
          {/* Email Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            className={`w-full flex-row items-center p-6 rounded-3xl border-2 bg-white shadow-sm transition-all ${method === "email" ? "border-primary" : "border-gray-100"
              }`}
            onPress={() => setMethod("email")}
          >
            <View className="w-12 h-12 rounded-full border border-primary justify-center items-center mr-5">
              <Feather name="mail" size={22} color="#8E9E6E" />
            </View>
            <Text
              className="text-base font-bold text-charcoal"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Email
            </Text>
          </TouchableOpacity>

          {/* SMS Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            className={`w-full flex-row items-center p-6 rounded-3xl border-2 bg-white shadow-sm transition-all ${method === "sms" ? "border-primary" : "border-gray-100"
              }`}
            onPress={() => setMethod("sms")}
          >
            <View className="w-12 h-12 rounded-full border border-primary justify-center items-center mr-5">
              <Feather name="message-square" size={22} color="#8E9E6E" />
            </View>
            <Text
              className="text-base font-bold text-charcoal"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              SMS
            </Text>
          </TouchableOpacity>

          {/* Email input (chỉ hỗ trợ phương thức Email) */}
          {method === "email" && (
            <View className="w-full flex-row items-center bg-white border border-primary rounded-2xl px-4 py-1 shadow-sm mt-1">
              <Feather name="mail" size={20} color="#8E9E6E" />
              <TextInput
                className="flex-1 text-charcoal text-base ml-3 py-4"
                placeholder="Nhập email của bạn"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          )}
        </AnimatedBlock>
      </AnimatedBlock>

      {/* Action Button at Bottom */}
      <AnimatedBlock variant="button" delay={240} className="w-full">
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={forgotMutation.isPending}
          className="w-full bg-primary pl-6 pr-2 py-2 rounded-full flex-row justify-between items-center shadow-lg shadow-primary/20"
          onPress={handleSend}
        >
          <Text
            className="text-white text-base font-bold ml-4"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            {forgotMutation.isPending ? "Đang gửi mã..." : "Gửi mã"}
          </Text>
          <View className="w-12 h-12 rounded-full bg-white justify-center items-center">
            {forgotMutation.isPending ? (
              <ActivityIndicator color="#8E9E6E" />
            ) : (
              <Ionicons name="arrow-forward" size={22} color="#8E9E6E" className="animate-arrow-right" />
            )}
          </View>
        </TouchableOpacity>
      </AnimatedBlock>
      </View>
    </View>
  );
}

