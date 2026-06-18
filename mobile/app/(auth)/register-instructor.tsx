import { AnimatedBlock } from "@/components/AnimatedPage";
import { useRegisterInstructor } from "@/hooks/auth/use-register-instructor";
import { AxiosError } from "axios";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ApiErrorResponse = {
  message?: string;
};

const optionalValue = (value: string) => value.trim() || undefined;

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as ApiErrorResponse | undefined)?.message ??
      "Không thể gửi đơn đăng ký. Vui lòng thử lại."
    );
  }

  return error instanceof Error
    ? error.message
    : "Không thể gửi đơn đăng ký. Vui lòng thử lại.";
};

export default function RegisterInstructorScreen() {
  const router = useRouter();
  const registerMutation = useRegisterInstructor();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const handleSubmit = () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      Alert.alert("Thông tin chưa hợp lệ", "Họ tên cần ít nhất 2 ký tự.");
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      Alert.alert("Thông tin chưa hợp lệ", "Vui lòng nhập email hợp lệ.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Thông tin chưa hợp lệ", "Mật khẩu cần ít nhất 8 ký tự.");
      return;
    }

    if (websiteUrl.trim() && !/^https?:\/\/\S+$/i.test(websiteUrl.trim())) {
      Alert.alert(
        "Thông tin chưa hợp lệ",
        "Website cần bắt đầu bằng http:// hoặc https://.",
      );
      return;
    }

    const hasBankDetails =
      bankName.trim() || accountName.trim() || accountNumber.trim();

    registerMutation.mutate(
      {
        name: normalizedName,
        email: normalizedEmail,
        password,
        bio: optionalValue(bio),
        expertise: optionalValue(expertise),
        websiteUrl: optionalValue(websiteUrl),
        bankDetails: hasBankDetails
          ? {
              bankName: optionalValue(bankName),
              accountName: optionalValue(accountName),
              accountNumber: optionalValue(accountNumber),
            }
          : undefined,
      },
      {
        onSuccess: (data) => {
          Alert.alert("Đã gửi đơn", data.message, [
            { text: "Về đăng nhập", onPress: () => router.replace("/login") },
          ]);
        },
        onError: (error) => {
          Alert.alert("Đăng ký thất bại", getErrorMessage(error));
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FDF8EA]"
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AnimatedBlock
          variant="header"
          className="flex-row items-center px-6 pt-14 pb-6 "
        >
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>
          <View className="flex-1 pt-3">
            <Text className="text-2xl font-bold text-charcoal">
              Đăng ký giảng viên
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Hồ sơ sẽ được admin xét duyệt trước khi đăng nhập.
            </Text>
          </View>
        </AnimatedBlock>

        <AnimatedBlock
          variant="panel"
          className="bg-white rounded-t-[36px] px-6 pt-8 pb-10 gap-5"
        >
          <FormField
            icon="user"
            placeholder="Họ và tên *"
            value={name}
            onChangeText={setName}
          />
          <FormField
            icon="mail"
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View className="flex-row items-center border border-primary rounded-2xl px-4 bg-white">
            <Feather name="lock" size={20} color="#8E9E6E" />
            <TextInput
              className="flex-1 text-charcoal text-base ml-3 py-4"
              placeholder="Mật khẩu (tối thiểu 8 ký tự) *"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#8E9E6E"
              />
            </TouchableOpacity>
          </View>

          <Text className="text-xs font-bold text-primary mt-2">
            THÔNG TIN CHUYÊN MÔN
          </Text>
          <FormField
            icon="award"
            placeholder="Chuyên môn, nhạc cụ"
            value={expertise}
            onChangeText={setExpertise}
          />
          <FormField
            icon="globe"
            placeholder="Website (https://...)"
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
            autoCapitalize="none"
          />
          <View className="border border-primary rounded-2xl px-4 bg-white">
            <TextInput
              className="text-charcoal text-base py-4 min-h-28"
              placeholder="Giới thiệu kinh nghiệm giảng dạy"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              maxLength={1000}
              value={bio}
              onChangeText={setBio}
            />
          </View>

          <Text className="text-xs font-bold text-primary mt-2">
            THÔNG TIN NHẬN THANH TOÁN
          </Text>
          <FormField
            icon="credit-card"
            placeholder="Tên ngân hàng"
            value={bankName}
            onChangeText={setBankName}
          />
          <FormField
            icon="user-check"
            placeholder="Tên chủ tài khoản"
            value={accountName}
            onChangeText={setAccountName}
            autoCapitalize="characters"
          />
          <FormField
            icon="hash"
            placeholder="Số tài khoản"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="number-pad"
          />

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={registerMutation.isPending}
            onPress={handleSubmit}
            className="w-full bg-primary py-4 rounded-full flex-row items-center justify-center gap-2 mt-3"
          >
            {registerMutation.isPending && (
              <ActivityIndicator color="white" />
            )}
            <Text className="text-white text-base font-bold">
              {registerMutation.isPending
                ? "Đang gửi hồ sơ..."
                : "Gửi hồ sơ đăng ký"}
            </Text>
          </TouchableOpacity>
        </AnimatedBlock>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FormFieldProps = React.ComponentProps<typeof TextInput> & {
  icon: React.ComponentProps<typeof Feather>["name"];
};

function FormField({ icon, ...props }: FormFieldProps) {
  return (
    <View className="flex-row items-center border border-primary rounded-2xl px-4 bg-white">
      <Feather name={icon} size={20} color="#8E9E6E" />
      <TextInput
        {...props}
        className="flex-1 text-charcoal text-base ml-3 py-4"
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}
