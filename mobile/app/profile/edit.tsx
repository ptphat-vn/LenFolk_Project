import { getApiErrorMessage } from "@/lib/api-error";
import React, { useState } from "react";
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
  Image,
  Modal,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuthStore } from "@/store/authStore";
import SafeScreen from "@/components/SafeScreen";
import { useUpdateMe } from "@/hooks/user/use-update-me";
import { useCurrentSubscription } from "@/hooks/enrollment/use-current-subscription";

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateInputValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};

const formatDateOfBirth = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const toDateApiValue = (value: string) => parseDateInputValue(value).toISOString();

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateMe = useUpdateMe();
  const { hasPremiumAccess } = useCurrentSubscription();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? toDateInputValue(new Date(user.dateOfBirth)) : ""
  );
  const [dob, setDob] = useState<Date>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date()
  );
  const [pickerDob, setPickerDob] = useState(dob);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [gender, setGender] = useState<"male" | "female" | "other">(
    user?.gender || "other"
  );
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const handleOpenDatePicker = () => {
    setPickerDob(dob);
    setShowDatePicker(true);
  };

  const commitDob = (nextDate: Date) => {
    const normalizedDate = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      nextDate.getDate(),
      12,
    );

    setDob(normalizedDate);
    setDateOfBirth(toDateInputValue(normalizedDate));
  };

  const onChangeDob = (event: any, selectedDate?: Date) => {
    if (event?.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === "ios") {
        setPickerDob(selectedDate);
        return;
      }

      commitDob(selectedDate);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Bạn cần cấp quyền truy cập thư viện ảnh để thay đổi ảnh đại diện."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể chọn ảnh từ thư viện");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên của bạn");
      return;
    }

    try {
      const avatarFile =
        avatar && avatar !== user?.avatar
          ? {
              uri: avatar,
              name: `avatar-${Date.now()}.jpg`,
              type: "image/jpeg",
            }
          : undefined;

      await updateMe.mutateAsync({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber || null,
        dateOfBirth: dateOfBirth ? toDateApiValue(dateOfBirth) : null,
        gender,
        avatar: avatarFile,
      });

      Alert.alert("Thành công", "Đã cập nhật thông tin hồ sơ của bạn!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        getApiErrorMessage(error, "Có lỗi xảy ra khi cập nhật hồ sơ"),
      );
    }
  };

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: "Chỉnh sửa hồ sơ", headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* --- HEADER --- */}
        <View className="px-6 pt-2 pb-4 flex-row justify-between items-center bg-[#FDF8EA]">
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-gray-100"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            className="text-xl font-bold text-[#10120C] text-center"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            SỬA HỒ SƠ
          </Text>

          <View className="w-10 h-10" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          className="flex-1 bg-white rounded-t-[30px] pt-8 shadow-inner"
        >
          {/* Circular Avatar Preview */}
          <View className="items-center mb-6">
            <View className="relative">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={pickImage}
                className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 items-center justify-center overflow-hidden shadow-sm"
              >
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={44} color="#C4C9B8" />
                )}
              </TouchableOpacity>
              {hasPremiumAccess && (
                <View className="absolute -top-4 -left-2 rotate-[-36deg] z-10">
                  <MaterialCommunityIcons name="crown" size={30} color="#FFB800" />
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={pickImage}
              className="mt-2.5 px-4 py-1.5 rounded-full bg-[#E2E8D3]"
            >
              <Text className="text-xs font-bold text-[#687451]">
                Thay đổi ảnh đại diện
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-[#8E9E6E] mb-2">TÊN ĐẦY ĐỦ</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nhập họ tên của bạn"
              placeholderTextColor="#9CA3AF"
              className="w-full bg-[#F3F4F6]/50 border border-gray-200 rounded-2xl px-4 py-3.5 text-charcoal text-sm"
            />
          </View>

          {/* Email */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-[#8E9E6E] mb-2">EMAIL</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="example@gmail.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="w-full bg-[#F3F4F6]/50 border border-gray-200 rounded-2xl px-4 py-3.5 text-charcoal text-sm"
            />
          </View>

          {/* Phone Number */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-[#8E9E6E] mb-2">SỐ ĐIỆN THOẠI</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              className="w-full bg-[#F3F4F6]/50 border border-gray-200 rounded-2xl px-4 py-3.5 text-charcoal text-sm"
            />
          </View>

          {/* Date of Birth */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-[#8E9E6E] mb-2">NGÀY SINH</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenDatePicker}
              className="w-full bg-[#F3F4F6]/50 border border-gray-200 rounded-2xl px-4 py-3.5 flex-row justify-between items-center"
            >
              <Text numberOfLines={1} className={dateOfBirth ? "min-w-0 flex-1 text-[#10120C] text-sm" : "min-w-0 flex-1 text-[#9CA3AF] text-sm"}>
                {formatDateOfBirth(dateOfBirth) || "Chọn ngày sinh của bạn"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#8E9E6E" />
            </TouchableOpacity>
          </View>

          {/* Gender */}
          <View className="mb-8">
            <Text className="text-xs font-bold text-[#8E9E6E] mb-2">GIỚI TÍNH</Text>
            <View className="flex-row gap-3">
              {(["male", "female", "other"] as const).map((g) => {
                const label = g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác";
                const isSelected = gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    className={`flex-1 py-3 rounded-2xl border items-center justify-center ${
                      isSelected
                        ? "bg-[#8E9E6E] border-[#8E9E6E]"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-white" : "text-[#10120C]"
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSave}
            disabled={updateMe.isPending}
            className={`w-full bg-[#8E9E6E] py-4 rounded-full items-center justify-center shadow-sm flex-row gap-2 ${
              updateMe.isPending ? "opacity-60" : ""
            }`}
          >
            {updateMe.isPending && <ActivityIndicator color="white" />}
            <Text
              className="text-white text-base font-bold"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              {updateMe.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal for iOS / Dialog for Android */}
      {showDatePicker && Platform.OS === "ios" && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white rounded-t-[30px] p-6 pb-10">
              <View className="flex-row justify-between items-center mb-4">
                <Text numberOfLines={1} className="min-w-0 flex-1 pr-3 text-lg font-bold text-[#10120C]">Chọn ngày sinh</Text>
                <TouchableOpacity
                  onPress={() => {
                    commitDob(pickerDob);
                    setShowDatePicker(false);
                  }}
                  className="bg-[#8E9E6E] px-4 py-2 rounded-full"
                >
                  <Text className="text-white font-bold text-sm">Xong</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pickerDob}
                mode="date"
                display="spinner"
                locale="vi-VN"
                themeVariant="light"
                textColor="#10120C"
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

