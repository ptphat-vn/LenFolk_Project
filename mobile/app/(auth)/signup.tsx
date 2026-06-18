import React, { useState } from "react";
import { Alert, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import { Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRegister } from "@/hooks/auth/use-register";
import { AnimatedBlock } from "@/components/AnimatedPage";
import SlideToConfirm from "@/components/SlideToConfirm";
import { getOnboardingRoute } from "@/constants/onboarding";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const registerMutation = useRegister();

  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ tên, email và mật khẩu.");
      return;
    }

    if (!agreeTerms) {
      Alert.alert("Điều khoản", "Bạn cần đồng ý với Điều khoản & Điều kiện.");
      return;
    }

    registerMutation.mutate(
      { name, email, password },
      {
        onSuccess: (data) => {
          router.replace(getOnboardingRoute(data.user) || "/(tabs)");
        },
        onError: (error) => {
          Alert.alert(
            "Đăng ký thất bại",
            error instanceof Error ? error.message : "Vui lòng thử lại."
          );
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FDF8EA]" // Cream/yellow soft top background
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="dark" />

        {/* Empty top spacer to let background show */}
        <View className="h-32" />

        {/* White container rising from the bottom */}
        <AnimatedBlock variant="panel" className="bg-white rounded-t-[40px] px-6 pt-10 pb-12 shadow-2xl">
          {/* Header titles */}
          <AnimatedBlock variant="header">
            <Text 
              className="text-4xl font-extrabold text-primary mb-3"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Bắt đầu!!!
            </Text>
            <Text className="text-sm text-gray-500 leading-6 mb-8">
              Tạo tài khoản để tiếp tục tất cả khóa học của bạn
            </Text>
          </AnimatedBlock>

          {/* Input Fields */}
          <AnimatedBlock variant="card" delay={100} className="gap-5 mb-6">
            {/* Name Input */}
            <View className="w-full flex-row items-center bg-white border border-primary rounded-2xl px-4 py-4 shadow-sm">
              <Feather name="user" size={20} color="#8E9E6E" />
              <TextInput
                className="flex-1 text-charcoal text-base ml-3"
                placeholder="Họ và tên"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Input */}
            <View className="w-full flex-row items-center bg-white border border-primary rounded-2xl px-4 py-4 shadow-sm">
              <Feather name="mail" size={20} color="#8E9E6E" />
              <TextInput
                className="flex-1 text-charcoal text-base ml-3"
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View className="w-full flex-row items-center bg-white border border-primary rounded-2xl px-4 py-4 shadow-sm">
              <Feather name="lock" size={20} color="#8E9E6E" />
              <TextInput
                className="flex-1 text-charcoal text-base ml-3"
                placeholder="Mật khẩu"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#8E9E6E" />
              </TouchableOpacity>
            </View>
          </AnimatedBlock>

          {/* Terms Agreement Checkbox Row */}
          <AnimatedBlock variant="chip" delay={170}>
            <TouchableOpacity 
              activeOpacity={0.8}
              className="flex-row items-center mb-8 px-1"
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
            <View className={`w-6 h-6 rounded-full border items-center justify-center ${
              agreeTerms 
                ? "bg-primary border-primary" 
                : "border-primary/50 bg-white"
            }`}>
              {agreeTerms && <Ionicons name="checkmark" size={14} color="white" />}
            </View>
            <Text className="text-sm text-charcoal/80 ml-3 font-semibold">
              Đồng ý với Điều khoản & Điều kiện
            </Text>
            </TouchableOpacity>
          </AnimatedBlock>

          {/* Register Button — trượt mũi tên để xác nhận */}
          <AnimatedBlock variant="button" delay={230} className="mb-8">
            <SlideToConfirm
              label="Trượt để đăng ký"
              loadingLabel="Đang đăng ký..."
              onConfirm={handleRegister}
              loading={registerMutation.isPending}
            />
          </AnimatedBlock>

          {/* Social login separator */}
          <Text className="text-sm text-charcoal/60 text-center font-bold mb-6">
            Hoặc tiếp tục với
          </Text>

          {/* Social buttons circular */}
          <View className="flex-row justify-center gap-6 mb-8">
            {/* Google Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => Alert.alert("Google", "Đăng ký bằng Google sẽ sớm ra mắt. Vui lòng dùng email và mật khẩu.")}
              className="w-16 h-16 rounded-full bg-white justify-center items-center border border-gray-100 shadow-md"
            >
              <Image 
                source={require("../../assets/images/Google.png")} 
                style={{ width: 26, height: 26, resizeMode: "contain" }} 
              />
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => Alert.alert("Apple", "Đăng ký bằng Apple sẽ sớm ra mắt. Vui lòng dùng email và mật khẩu.")}
              className="w-16 h-16 rounded-full bg-white justify-center items-center border border-gray-100 shadow-md"
            >
              <Image 
                source={require("../../assets/images/Apple.png")} 
                style={{ width: 26, height: 26, resizeMode: "contain" }} 
              />
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View className="flex-row justify-center">
            <Text className="text-sm text-charcoal/60">Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text 
                className="text-sm font-extrabold text-sky-500"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Đăng nhập
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="items-center mt-5"
            onPress={() => router.push("/register-instructor" as Href)}
          >
            <Text className="text-sm font-bold text-primary">
              Đăng ký trở thành giảng viên
            </Text>
          </TouchableOpacity>
        </AnimatedBlock>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
