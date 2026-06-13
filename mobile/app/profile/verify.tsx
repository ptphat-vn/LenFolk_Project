import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import SafeScreen from "@/components/SafeScreen";

export default function AccountVerificationScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [contactInfo, setContactInfo] = useState(user?.phoneNumber || user?.email || "");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = () => {
    if (!contactInfo.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hoặc email.");
      return;
    }

    setIsSending(false);
    Alert.alert(
      "Chưa hỗ trợ",
      "Backend chưa có dịch vụ gửi OTP. Tài khoản sẽ không được đánh dấu xác thực trên thiết bị.",
    );
  };

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    setIsVerifying(false);
    Alert.alert("Chưa hỗ trợ", "Backend chưa có endpoint xác minh OTP.");
  };

  const handleResendOtp = () => {
    setTimer(60);
    Alert.alert("Chưa hỗ trợ", "Backend chưa có dịch vụ gửi lại OTP.");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ title: "Xác thực tài khoản", headerShown: false }} />

        {/* --- HEADER --- */}
        <View className="px-6 pt-2 pb-4 flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-gray-100"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>
          <Text
            className="text-lg font-bold text-charcoal"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            XÁC THỰC
          </Text>
          <View className="w-10 h-10" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          className="flex-1 bg-white rounded-t-[30px] pt-8 shadow-inner"
        >
          {user?.isVerified ? (
            /* --- VERIFIED SUCCESS STATE --- */
            <View className="items-center py-10 gap-6">
              <View className="w-24 h-24 rounded-full bg-[#E2E8D3] items-center justify-center shadow-sm">
                <Ionicons name="shield-checkmark" size={54} color="#8E9E6E" />
              </View>

              <Text
                className="text-2xl font-black text-charcoal text-center"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Tài khoản đã xác thực
              </Text>
              
              <Text className="text-sm text-gray-500 text-center leading-6 px-4">
                Chúc mừng! Tài khoản của bạn đã được xác minh chính chủ. Trạng thái xác thực sẽ được áp dụng trên toàn bộ hệ thống LenFolk.
              </Text>

              <View className="w-full bg-[#F3F4F6] rounded-2xl p-5 gap-3 mt-4 border border-gray-150">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-400">Trạng thái:</Text>
                  <Text className="text-xs font-bold text-[#8E9E6E]">Đã xác thực</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-400">Liên hệ xác thực:</Text>
                  <Text className="text-xs font-bold text-charcoal">{contactInfo || "SMS/Email"}</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.back()}
                className="w-full bg-[#8E9E6E] py-4 rounded-full items-center justify-center mt-6 shadow-sm"
              >
                <Text
                  className="text-white text-base font-bold"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Quay lại
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* --- FORM INPUT VERIFICATION STATE --- */
            <View className="gap-6">
              <View className="items-center mb-2">
                <MaterialCommunityIcons name="security" size={54} color="#8E9E6E" />
                <Text
                  className="text-xl font-bold text-charcoal mt-3 text-center"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Xác minh chính chủ
                </Text>
                <Text className="text-xs text-gray-400 text-center mt-1">
                  Nhận tích xanh bảo vệ tài khoản của bạn trên LenFolk
                </Text>
              </View>

              {!otpSent ? (
                /* STEP 1: ENTER PHONE/EMAIL */
                <View className="gap-5">
                  <View>
                    <Text className="text-xs font-bold text-[#8E9E6E] mb-2">SỐ ĐIỆN THOẠI / EMAIL</Text>
                    <TextInput
                      value={contactInfo}
                      onChangeText={setContactInfo}
                      placeholder="Nhập số điện thoại hoặc email của bạn"
                      placeholderTextColor="#9CA3AF"
                      className="w-full bg-[#F3F4F6]/50 border border-gray-200 rounded-2xl px-4 py-3.5 text-charcoal text-sm"
                    />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleSendOtp}
                    disabled={isSending}
                    className="w-full bg-primary py-4 rounded-full items-center justify-center flex-row gap-2 shadow-sm"
                  >
                    {isSending && <ActivityIndicator color="white" />}
                    <Text
                      className="text-white text-base font-bold"
                      style={{ fontFamily: "BeVietnamPro-Medium" }}
                    >
                      {isSending ? "Đang gửi mã..." : "Gửi mã OTP xác thực"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* STEP 2: ENTER OTP */
                <View className="gap-5 animate-fade-in">
                  <View>
                    <Text className="text-xs font-bold text-[#8E9E6E] mb-2">NHẬP MÃ OTP</Text>
                    <TextInput
                      value={otpCode}
                      onChangeText={setOtpCode}
                      placeholder="Nhập mã xác thực (123456)"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={6}
                      className="w-full bg-[#F3F4F6]/50 border border-gray-200 rounded-2xl px-4 py-3.5 text-charcoal text-center text-lg font-black tracking-widest"
                    />
                    <Text className="text-[10px] text-gray-400 mt-2 text-center">
                      Đã gửi OTP về {contactInfo}
                    </Text>
                  </View>

                  <View className="items-center">
                    {timer > 0 ? (
                      <Text className="text-xs text-gray-500 font-medium">
                        Gửi lại mã sau <Text className="font-bold text-[#8E9E6E]">{timer}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={handleResendOtp}>
                        <Text className="text-xs font-bold text-[#8E9E6E] underline">
                          Gửi lại mã OTP
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="gap-3 mt-2">
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={handleVerifyOtp}
                      disabled={isVerifying}
                      className="w-full bg-primary py-4 rounded-full items-center justify-center flex-row gap-2 shadow-sm"
                    >
                      {isVerifying && <ActivityIndicator color="white" />}
                      <Text
                        className="text-white text-base font-bold"
                        style={{ fontFamily: "BeVietnamPro-Medium" }}
                      >
                        Xác nhận
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setOtpSent(false)}
                      className="w-full bg-white border border-gray-200 py-3.5 rounded-full items-center justify-center"
                    >
                      <Text className="text-gray-500 font-bold text-sm">Quay lại nhập thông tin</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeScreen>
    </KeyboardAvoidingView>
  );
}
