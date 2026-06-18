import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/authStore";
import { useUpdateMe } from "@/hooks/user/use-update-me";

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateOfBirth = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

export default function CompleteProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateMe = useUpdateMe();

  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? toDateInputValue(new Date(user.dateOfBirth)) : "",
  );
  const [dob, setDob] = useState<Date>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date(2005, 0, 1),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | "other">(
    user?.gender || "other",
  );

  const onChangeDob = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDob(selectedDate);
      setDateOfBirth(toDateInputValue(selectedDate));
    }
  };

  const handleComplete = async () => {
    if (!user) {
      Alert.alert("Cần đăng nhập", "Vui lòng đăng nhập để hoàn thiện hồ sơ.", [
        { text: "Đến đăng nhập", onPress: () => router.replace("/login") },
      ]);
      return;
    }

    if (!name.trim() || !phoneNumber.trim() || !dateOfBirth) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập họ tên, số điện thoại và ngày sinh.",
      );
      return;
    }

    const parsedDate = new Date(dateOfBirth);
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert("Ngày sinh không hợp lệ", "Vui lòng chọn lại ngày sinh.");
      return;
    }

    try {
      await updateMe.mutateAsync({
        name: name.trim(),
        email: user.email,
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: parsedDate.toISOString(),
        gender,
      });

      router.replace("/profile/verify");
    } catch (error: any) {
      Alert.alert(
        "Không thể lưu hồ sơ",
        error?.response?.data?.message || "Vui lòng thử lại sau.",
      );
    }
  };

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: "Hoàn thiện hồ sơ", headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 24, paddingBottom: 44, gap: 22 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white">
              <Ionicons name="person-add-outline" size={22} color="#8E9E6E" />
            </View>
            <Text
              numberOfLines={1}
              className="min-w-0 flex-1 px-4 text-center text-lg font-bold text-[#10120C]"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Hoàn thiện hồ sơ
            </Text>
            <View className="h-11 w-11" />
          </View>

          <View className="items-center rounded-[30px] bg-white px-6 py-7">
            <Image
              source={require("../../assets/images/Profile.png")}
              style={{ width: 96, height: 96, borderRadius: 48 }}
            />
            <Text
              className="mt-5 text-center text-xl font-bold text-[#10120C]"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Chào mừng bạn đến LenFolk
            </Text>
            <Text className="mt-2 text-center text-sm leading-6 text-[#777B70]">
              Bổ sung vài thông tin cơ bản rồi xác thực email để bắt đầu học.
            </Text>
          </View>

          <View className="gap-5 rounded-[30px] bg-white p-5">
            <View>
              <Text className="mb-2 text-xs font-bold text-[#8E9E6E]">
                HỌ VÀ TÊN
              </Text>
              <View className="flex-row items-center rounded-2xl border border-[#E5E7E1] bg-[#F7F8F3] px-4 py-3">
                <Ionicons name="person-outline" size={19} color="#8E9E6E" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Nhập họ tên của bạn"
                  placeholderTextColor="#9CA3AF"
                  className="ml-3 min-w-0 flex-1 text-sm text-[#10120C]"
                />
              </View>
            </View>

            <View>
              <Text className="mb-2 text-xs font-bold text-[#8E9E6E]">
                EMAIL ĐĂNG KÝ
              </Text>
              <View className="flex-row items-center rounded-2xl border border-[#E5E7E1] bg-[#F7F8F3] px-4 py-3">
                <Ionicons name="mail-outline" size={19} color="#8E9E6E" />
                <TextInput
                  value={user?.email || ""}
                  editable={false}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  className="ml-3 min-w-0 flex-1 text-sm text-[#777B70]"
                />
                <Ionicons name="lock-closed-outline" size={16} color="#A5AA9E" />
              </View>
            </View>

            <View>
              <Text className="mb-2 text-xs font-bold text-[#8E9E6E]">
                SỐ ĐIỆN THOẠI
              </Text>
              <View className="flex-row items-center rounded-2xl border border-[#E5E7E1] bg-[#F7F8F3] px-4 py-3">
                <Ionicons name="call-outline" size={19} color="#8E9E6E" />
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  className="ml-3 min-w-0 flex-1 text-sm text-[#10120C]"
                />
              </View>
            </View>

            <View>
              <Text className="mb-2 text-xs font-bold text-[#8E9E6E]">
                NGÀY SINH
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center justify-between rounded-2xl border border-[#E5E7E1] bg-[#F7F8F3] px-4 py-4"
              >
                <View className="min-w-0 flex-1 flex-row items-center">
                  <Ionicons name="calendar-outline" size={19} color="#8E9E6E" />
                  <Text
                    numberOfLines={1}
                    className={`ml-3 min-w-0 flex-1 text-sm ${
                      dateOfBirth ? "text-[#10120C]" : "text-[#9CA3AF]"
                    }`}
                  >
                    {formatDateOfBirth(dateOfBirth) || "Chọn ngày sinh"}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color="#8E9E6E" />
              </TouchableOpacity>
            </View>

            <View>
              <Text className="mb-2 text-xs font-bold text-[#8E9E6E]">
                GIỚI TÍNH
              </Text>
              <View className="flex-row gap-3">
                {(["male", "female", "other"] as const).map((value) => {
                  const label =
                    value === "male" ? "Nam" : value === "female" ? "Nữ" : "Khác";
                  const isSelected = gender === value;

                  return (
                    <TouchableOpacity
                      key={value}
                      activeOpacity={0.85}
                      onPress={() => setGender(value)}
                      className={`h-12 flex-1 items-center justify-center rounded-2xl border ${
                        isSelected
                          ? "border-[#8E9E6E] bg-[#8E9E6E]"
                          : "border-[#E5E7E1] bg-[#F7F8F3]"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? "text-white" : "text-[#687451]"
                        }`}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={updateMe.isPending}
            onPress={handleComplete}
            className={`flex-row items-center justify-center gap-2 rounded-[24px] bg-[#10120C] px-6 py-5 ${
              updateMe.isPending ? "opacity-70" : ""
            }`}
          >
            {updateMe.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="arrow-forward-circle" size={21} color="white" />
            )}
            <Text className="font-bold text-white">
              {updateMe.isPending ? "Đang lưu..." : "Tiếp tục xác thực email"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && Platform.OS === "ios" && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <View className="rounded-t-[30px] bg-white p-6 pb-10">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-[#10120C]">
                  Chọn ngày sinh
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  className="rounded-full bg-[#8E9E6E] px-4 py-2"
                >
                  <Text className="text-sm font-bold text-white">Xong</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dob}
                mode="date"
                display="spinner"
                locale="vi-VN"
                maximumDate={new Date()}
                onChange={onChangeDob}
                style={{ width: "100%", height: 180 }}
              />
            </View>
          </View>
        </Modal>
      )}

      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          locale="vi-VN"
          maximumDate={new Date()}
          onChange={onChangeDob}
        />
      )}
    </SafeScreen>
  );
}
