import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    // Navigate back to login screen after successful reset
    router.replace("/login");
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
          <View className="flex-row items-center mb-10 mt-4">
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
              Tạo mật khẩu mới
            </Text>
          </View>

          {/* Prompt Description */}
          <Text
            className="text-base font-semibold text-charcoal/80 text-center mb-12"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Tạo mật khẩu mới của bạn
          </Text>

          {/* Inputs Stack */}
          <View className="gap-6 px-1">
            {/* Password */}
            <View className="w-full flex-row items-center bg-white border border-primary rounded-2xl px-4 py-4.5 shadow-sm">
              <Feather name="lock" size={20} color="#8E9E6E" />
              <TextInput
                className="flex-1 text-charcoal text-base ml-3 py-4"
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

            {/* Confirm Password */}
            <View className="w-full flex-row items-center bg-white border border-primary rounded-2xl px-4 py-4.5 shadow-sm">
              <Feather name="lock" size={20} color="#8E9E6E" />
              <TextInput
                className="flex-1 text-charcoal text-base ml-3 py-4"
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#8E9E6E" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Button "Tiếp tục" at bottom with white round right arrow */}
        <View className="w-full mb-4">
          <TouchableOpacity
            activeOpacity={0.9}
            className="w-full bg-primary pl-6 pr-2 py-2 rounded-full flex-row justify-between items-center shadow-lg shadow-primary/20"
            onPress={handleSubmit}
          >
            <Text
              className="text-white text-base font-bold ml-4"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Tiếp tục
            </Text>
            <View className="w-12 h-12 rounded-full bg-white justify-center items-center">
              <Ionicons name="arrow-forward" size={22} color="#8E9E6E" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
