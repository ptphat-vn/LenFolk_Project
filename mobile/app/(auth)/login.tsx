import React, { useState } from "react";
import { ActivityIndicator, Alert, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather } from "@expo/vector-icons";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useLogin } from "@/hooks/auth/use-login";
import { AnimatedBlock } from "@/components/AnimatedPage";
import SlideToConfirm from "@/components/SlideToConfirm";

type BouncingNoteProps = {
  delay: number;
  icon: "musical-note" | "musical-notes";
  size: number;
  color: string;
  style: object;
};

function BouncingNote({ delay, icon, size, color, style }: BouncingNoteProps) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );

    return () => cancelAnimation(progress);
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [4, -10]) },
      { rotate: `${interpolate(progress.value, [0, 1], [-6, 8])}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute" }, style, animatedStyle]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Animated.View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const loginMutation = useLogin();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email và mật khẩu.");
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => router.replace("/(tabs)"),
        onError: (error) => {
          Alert.alert(
            "Đăng nhập thất bại",
            error instanceof Error ? error.message : "Vui lòng thử lại."
          );
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F8F9FA]"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="dark" />

        {/* Back Button */}
        <AnimatedBlock variant="header" className="absolute top-14 left-6 z-10">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-gray-100"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" className="animate-arrow-left" />
          </TouchableOpacity>
        </AnimatedBlock>

        {/* Large Avatar/Logo Placeholder at Top */}
        <AnimatedBlock variant="hero" delay={80} className="items-center mt-24 mb-6 relative">
          <BouncingNote
            delay={0}
            icon="musical-note"
            size={24}
            color="#8E9E6E"
            style={{ left: "21%", top: 8 }}
          />
          <BouncingNote
            delay={220}
            icon="musical-notes"
            size={20}
            color="#F0C96A"
            style={{ right: "20%", top: 30 }}
          />
          <BouncingNote
            delay={420}
            icon="musical-note"
            size={17}
            color="#8E9E6E"
            style={{ right: "27%", bottom: 6 }}
          />
          <BouncingNote
            delay={140}
            icon="musical-notes"
            size={16}
            color="#F0C96A"
            style={{ left: "29%", bottom: 4 }}
          />
          <BouncingNote
            delay={560}
            icon="musical-note"
            size={19}
            color="#8E9E6E"
            style={{ left: "14%", top: 52 }}
          />
          <BouncingNote
            delay={720}
            icon="musical-notes"
            size={15}
            color="#F0C96A"
            style={{ right: "13%", top: 2 }}
          />
          <Image
            source={require("../../assets/images/mascot_thoisao.png")}
            style={{ width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: "white" }}
            className="shadow-md"
          />
        </AnimatedBlock>

        {/* Cream Card Container Rising from Bottom */}
        <AnimatedBlock
          variant="panel"
          delay={140}
          className="bg-accent rounded-t-[40px] px-6 pt-10 pb-12 shadow-2xl flex-1 justify-between"
          style={{ minHeight: 500 }}
        >
          <View>
            {/* Title & Subtitle */}
            <Text
              className="text-2xl font-bold text-primary text-center mb-2"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Đăng nhập để tiếp tục
            </Text>
            <Text className="text-sm text-charcoal/70 text-center leading-6 mb-8 px-4">
              Đăng nhập vào tài khoản để tiếp tục các khóa học của bạn
            </Text>

            {/* Inputs Stack */}
            <View className="gap-4 mb-6">
              {/* Email Input */}
              <View className="w-full flex-row items-center bg-white border border-primary/50 rounded-2xl px-4 py-4 shadow-sm">
                <Feather name="mail" size={20} color="#8E9E6E" className="mr-3" />
                <TextInput
                  className="flex-1 text-charcoal text-base ml-2.5"
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password Input */}
              <View className="w-full flex-row items-center bg-white border border-primary/50 rounded-2xl px-4 py-4 shadow-sm">
                <Feather name="lock" size={20} color="#8E9E6E" className="mr-3" />
                <TextInput
                  className="flex-1 text-charcoal text-base ml-2.5"
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
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View className="flex-row justify-between items-center mb-8 px-1">
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-row items-center"
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View className={`w-5 h-5 rounded border ${rememberMe ? "bg-primary border-primary justify-center items-center" : "border-primary/50 bg-white"}`}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text className="text-sm text-charcoal/80 ml-2.5 font-medium">Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/forgot")}>
                <Text
                  className="text-sm font-bold text-red-500"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button — trượt mũi tên để xác nhận */}
            <View className="mb-6">
              <SlideToConfirm
                label="Trượt để đăng nhập"
                loadingLabel="Đang đăng nhập..."
                onConfirm={handleLogin}
                loading={loginMutation.isPending}
              />
            </View>

            {/* Or Separator */}
            <View className="flex-row justify-center items-center mb-6">
              <View className="flex-1 h-[1px] bg-primary/20" />
              <Text className="mx-4 text-xs text-charcoal/50 font-medium">Hoặc</Text>
              <View className="flex-1 h-[1px] bg-primary/20" />
            </View>

            {/* Google Sign-in Alternative */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => Alert.alert("Google", "Đăng nhập bằng Google sẽ sớm ra mắt. Vui lòng dùng email và mật khẩu.")}
              className="w-full bg-white py-4 rounded-2xl flex-row justify-center items-center border border-gray-100 shadow-sm mb-6"
            >
              <Image
                source={require("../../assets/images/Google.png")}
                style={{ width: 20, height: 20, marginRight: 10, resizeMode: "contain" }}
              />
              <Text className="text-charcoal text-base font-semibold">
                Tiếp tục với Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Navigation Link */}
          <View className="flex-row justify-center">
            <Text className="text-sm text-charcoal/60">Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text
                className="text-sm font-extrabold text-sky-500"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedBlock>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
