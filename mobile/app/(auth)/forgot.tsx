import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function ForgotChoiceScreen() {
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "sms">("email");

  return (
    <View className="flex-1 bg-white pt-14 px-6 pb-12 justify-between">
      <StatusBar style="dark" />

      {/* Header Area */}
      <View>
        <View className="flex-row items-center mb-10">
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
            Quên mật khẩu
          </Text>
        </View>

        {/* Info Description */}
        <Text className="text-base text-gray-500 leading-7 text-center px-4 mb-10 mt-6">
          Hãy chọn thông tin liên hệ mà chúng tôi sẽ sử dụng để đặt lại mật khẩu của bạn.
        </Text>

        {/* Choice Cards */}
        <View className="gap-5">
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
        </View>
      </View>

      {/* Action Button at Bottom - styled exactly like the screenshot with "Đăng nhập" and a right arrow inside a white circle */}
      <View className="w-full">
        <TouchableOpacity
          activeOpacity={0.9}
          className="w-full bg-primary pl-6 pr-2 py-2 rounded-full flex-row justify-between items-center shadow-lg shadow-primary/20"
          onPress={() => router.push("/otp")}
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
    </View>
  );
}
