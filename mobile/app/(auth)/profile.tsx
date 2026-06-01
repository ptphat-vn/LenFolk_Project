import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("Tiếng Việt");
  const [showCongrats, setShowCongrats] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = () => {
    setShowCongrats(true);
    setIsLoading(true);

    // Simulate loading and redirecting to tabs home screen
    setTimeout(() => {
      setIsLoading(false);
      setShowCongrats(false);
      // Thiết lập mock session để qua Auth Guard và vào Trang chủ
      useAuthStore.setState({
        user: { username: name || "Minh", email: email || "minh@lenfolk.vn" },
        token: "mock-session-token",
      });
      router.replace("/(tabs)");
    }, 3000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="dark" />

        {/* Top Header Section */}
        <View>
          {/* Header */}
          <View className="flex-row items-center mb-8 mt-4">
            <TouchableOpacity
              className="p-2 rounded-full bg-gray-50 mr-4"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#10120C" />
            </TouchableOpacity>
            <Text
              className="text-2xl font-bold text-charcoal"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Hoàn thiện hồ sơ của bạn
            </Text>
          </View>

          {/* Avatar Area with Edit Badge */}
          <View className="items-center mb-10 mt-2">
            <View className="relative">
              <Image
                source={require("../../assets/images/Profile.png")}
                style={{ width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: "white" }}
                className="shadow-md"
              />
              {/* Edit Icon Badge */}
              <TouchableOpacity
                activeOpacity={0.8}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full justify-center items-center border-2 border-white shadow"
                style={{ backgroundColor: Colors.light.primary }}
              >
                <Feather name="edit-2" size={15} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Cards Stack with Shadows */}
          <View className="gap-5 px-1">
            {/* Full Name */}
            <View className="w-full flex-row items-center bg-white border border-gray-100 rounded-2xl px-5 py-4.5 shadow shadow-gray-100">
              <TextInput
                className="flex-1 text-charcoal text-base font-semibold py-4"
                placeholder="Tên"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Birth Date */}
            <View className="w-full flex-row items-center bg-white border border-gray-100 rounded-2xl px-5 py-4.5 shadow shadow-gray-100">
              <Feather name="calendar" size={20} color="#8E9E6E" className="mr-3.5" />
              <TextInput
                className="flex-1 text-charcoal text-base ml-2.5 font-semibold py-4"
                placeholder="Ngày sinh"
                placeholderTextColor="#9CA3AF"
                value={birthDate}
                onChangeText={setBirthDate}
              />
            </View>

            {/* Email */}
            <View className="w-full flex-row items-center bg-white border border-gray-100 rounded-2xl px-5 py-4.5 shadow shadow-gray-100">
              <Feather name="mail" size={20} color="#8E9E6E" className="mr-3.5" />
              <TextInput
                className="flex-1 text-charcoal text-base ml-2.5 font-semibold py-4"
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Phone Number with Vietnam flag code */}
            <View className="w-full flex-row items-center bg-white border border-gray-100 rounded-2xl px-5 py-4.5 shadow shadow-gray-100">
              <View className="flex-row items-center mr-3 border-r border-gray-100 pr-3.5">
                <Text className="text-xl mr-2">🇻🇳</Text>
                <Ionicons name="chevron-down" size={14} color="#6B7280" />
              </View>
              <Text className="text-base text-charcoal font-semibold mr-2">( +84 )</Text>
              <TextInput
                className="flex-1 text-charcoal text-base font-semibold py-4"
                placeholder="999-999-9999"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Language dropdown select */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="w-full flex-row items-center bg-white border border-gray-100 rounded-2xl px-5 py-4.5 shadow shadow-gray-100 justify-between"
            >
              <View className="flex-row items-center py-4">
                <Ionicons name="language" size={20} color="#8E9E6E" className="mr-3.5" />
                <Text className="text-base text-charcoal font-semibold ml-2.5">{language}</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit button "Đăng nhập" with white round right arrow */}
        <View className="w-full mb-4">
          <TouchableOpacity
            activeOpacity={0.9}
            className="w-full bg-primary pl-6 pr-2 py-2 rounded-full flex-row justify-between items-center shadow-lg shadow-primary/20"
            onPress={handleComplete}
          >
            <Text
              className="text-white text-base font-bold ml-4"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Đăng nhập
            </Text>
            <View className="w-12 h-12 rounded-full bg-white justify-center items-center">
              <Ionicons name="arrow-forward" size={22} color="#8E9E6E" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- SUCCESS CONGRATS MODAL OVERLAY --- */}
      <Modal
        visible={showCongrats}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/55 justify-center items-center px-8">
          <View className="bg-white rounded-[40px] px-8 py-10 w-full items-center shadow-2xl">
            {/* Mascot successfully done logo */}
            <Image
              source={require("../../assets/images/Profile.png")}
              style={{ width: 144, height: 144, borderRadius: 72 }}
              className="mb-8 shadow-sm"
            />

            {/* Title */}
            <Text
              className="text-3xl font-bold text-charcoal text-center mb-5"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Chúc mừng!
            </Text>

            {/* Subtext description */}
            <Text className="text-sm text-gray-500 text-center leading-6 mb-8 px-2 font-medium">
              Tài khoản của bạn đã sẵn sàng để sử dụng. Bạn sẽ được chuyển hướng đến trang chủ trong vài giây nữa.
            </Text>

            {/* Spinner Loading Animation */}
            {isLoading && (
              <ActivityIndicator
                size="large"
                color="#8E9E6E"
                className="mt-2"
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
