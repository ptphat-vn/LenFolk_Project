import React, { useState, useEffect } from "react";
import { Alert, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedBlock } from "@/components/AnimatedPage";

export default function OtpScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(59);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (val: string) => {
    if (otp.length < 4) {
      setOtp((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    setOtp((prev) => prev.slice(0, -1));
  };

  const renderSlot = (index: number) => {
    if (index >= otp.length) {
      return "";
    }
    // Mask all preceding digits as *, and show the last typed digit literally (like in the screenshot: * * 8)
    if (index === otp.length - 1) {
      return otp[index];
    }
    return "*";
  };

  return (
    <View className="flex-1 bg-white pt-14 px-6 pb-12 justify-between">
      <StatusBar style="dark" />

      {/* Header and top instructions */}
      <AnimatedBlock variant="panel">
        {/* Header */}
        <AnimatedBlock variant="header" className="flex-row items-center mb-8">
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

        {/* Subtitle masked contact */}
        <AnimatedBlock variant="chip" delay={80}>
          <Text
            className="text-sm font-semibold text-charcoal/80 text-center mb-10 px-4 leading-6"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Mã đã được gửi đến ( +84 ) ***-***-*999
          </Text>
        </AnimatedBlock>

        {/* OTP Input Slots Container */}
        <AnimatedBlock variant="card" delay={140} className="flex-row justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isCurrent = index === otp.length;
            return (
              <View
                key={index}
                className={`w-16 h-18 py-3 rounded-2xl bg-white shadow-md border-2 items-center justify-center ${isCurrent ? "border-primary" : "border-gray-100"
                  }`}
              >
                <Text
                  className="text-2xl font-bold text-charcoal"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  {renderSlot(index)}
                </Text>
              </View>
            );
          })}
        </AnimatedBlock>

        {/* Resend Code Countdown */}
        <TouchableOpacity
          disabled={timer > 0}
          className="self-center mb-6"
          onPress={() => {
            setTimer(59);
            Alert.alert("Chưa hỗ trợ", "Backend chưa có dịch vụ gửi OTP.");
          }}
        >
          <Text className="text-sm text-gray-500 font-medium">
            Gửi lại mã trong{" "}
            <Text className="text-[#0066FF] font-bold">{timer > 0 ? `${timer}s` : "gửi ngay"}</Text>
          </Text>
        </TouchableOpacity>
      </AnimatedBlock>

      {/* Custom On-screen Numpad */}
      <AnimatedBlock variant="card" delay={210} className="mb-4">
        {/* Row 1 */}
        <View className="flex-row justify-around py-3">
          {["1", "2", "3"].map((val) => (
            <TouchableOpacity
              key={val}
              className="w-20 h-16 justify-center items-center rounded-2xl active:bg-gray-50"
              onPress={() => handleKeyPress(val)}
            >
              <Text
                className="text-2xl font-bold text-charcoal"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                {val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Row 2 */}
        <View className="flex-row justify-around py-3">
          {["4", "5", "6"].map((val) => (
            <TouchableOpacity
              key={val}
              className="w-20 h-16 justify-center items-center rounded-2xl active:bg-gray-50"
              onPress={() => handleKeyPress(val)}
            >
              <Text
                className="text-2xl font-bold text-charcoal"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                {val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Row 3 */}
        <View className="flex-row justify-around py-3">
          {["7", "8", "9"].map((val) => (
            <TouchableOpacity
              key={val}
              className="w-20 h-16 justify-center items-center rounded-2xl active:bg-gray-50"
              onPress={() => handleKeyPress(val)}
            >
              <Text
                className="text-2xl font-bold text-charcoal"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                {val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Row 4 */}
        <View className="flex-row justify-around py-3">
          <TouchableOpacity
            className="w-20 h-16 justify-center items-center rounded-2xl active:bg-gray-50"
            onPress={() => handleKeyPress("*")}
          >
            <Text
              className="text-2xl font-bold text-charcoal"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              *
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-20 h-16 justify-center items-center rounded-2xl active:bg-gray-50"
            onPress={() => handleKeyPress("0")}
          >
            <Text
              className="text-2xl font-bold text-charcoal"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              0
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-20 h-16 justify-center items-center rounded-2xl active:bg-gray-50"
            onPress={handleBackspace}
          >
            <Ionicons name="backspace-outline" size={26} color="#10120C" />
          </TouchableOpacity>
        </View>
      </AnimatedBlock>

      {/* Submit button "Xác Minh" with white round right arrow */}
      <AnimatedBlock variant="button" delay={280} className="w-full">
        <TouchableOpacity
          activeOpacity={0.9}
          className="w-full bg-primary pl-6 pr-2 py-2 rounded-full flex-row justify-between items-center shadow-lg shadow-primary/20"
          onPress={() =>
            Alert.alert("Chưa hỗ trợ", "Backend chưa có endpoint xác minh OTP.")
          }
        >
          <Text
            className="text-white text-base font-bold ml-4"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Xác Minh
          </Text>
          <View className="w-12 h-12 rounded-full bg-white justify-center items-center">
            <Ionicons name="arrow-forward" size={22} color="#8E9E6E" className="animate-arrow-right" />
          </View>
        </TouchableOpacity>
      </AnimatedBlock>
    </View>
  );
}
