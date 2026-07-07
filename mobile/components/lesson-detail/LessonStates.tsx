import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import SafeScreen from "@/components/SafeScreen";

type LoadingStateProps = {
  title?: string;
};

export function LessonLoadingState({ title = "Bài học" }: LoadingStateProps) {
  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <Stack.Screen options={{ title }} />
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#8E9E6E" />
      </View>
    </SafeScreen>
  );
}

type NotFoundStateProps = {
  onBack: () => void;
};

export function LessonNotFoundState({ onBack }: NotFoundStateProps) {
  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <Stack.Screen options={{ title: "Bài học" }} />
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#8E9E6E" />
        <Text selectable className="text-lg font-bold text-[#10120C]">
          Không tìm thấy bài học
        </Text>
        <TouchableOpacity
          onPress={onBack}
          className="rounded-full bg-[#8E9E6E] px-6 py-3"
        >
          <Text className="font-bold text-white">Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

type LockedStateProps = {
  body: string;
  ctaIcon: keyof typeof Ionicons.glyphMap;
  ctaLabel: string;
  onBack: () => void;
  onCtaPress: () => void;
  title: string;
};

function LessonAccessState({
  body,
  ctaIcon,
  ctaLabel,
  onBack,
  onCtaPress,
  title,
}: LockedStateProps) {
  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <Stack.Screen options={{ title, headerShown: false }} />
      <View className="flex-1 justify-center gap-5 px-6">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBack}
          className="absolute left-6 top-6 h-11 w-11 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="arrow-back" size={22} color="#10120C" />
        </TouchableOpacity>

        <View className="items-center gap-4 rounded-[30px] bg-white p-7">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E2E8D3]">
            <Ionicons name="lock-closed" size={30} color="#687451" />
          </View>
          <Text
            selectable
            className="text-center text-xl font-bold text-[#10120C]"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            {title}
          </Text>
          <Text selectable className="text-center text-sm leading-6 text-[#55594F]">
            {body}
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onCtaPress}
            className="mt-2 w-full flex-row items-center justify-center gap-2 rounded-[22px] bg-[#10120C] px-5 py-4"
          >
            <Ionicons name={ctaIcon} size={20} color="white" />
            <Text className="font-bold text-white">{ctaLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
  );
}

type LessonLockedStateProps = {
  message: string;
  onBack: () => void;
  onSubscribe: () => void;
};

export function LessonLockedState({
  message,
  onBack,
  onSubscribe,
}: LessonLockedStateProps) {
  return (
    <LessonAccessState
      body={message}
      ctaIcon="card-outline"
      ctaLabel="Mở gói Technique"
      onBack={onBack}
      onCtaPress={onSubscribe}
      title="Bài học thuộc gói Technique"
    />
  );
}

type PrerequisiteLockedStateProps = {
  onBack: () => void;
  onPreviousLesson: () => void;
  previousLessonTitle?: string;
};

export function LessonPrerequisiteLockedState({
  onBack,
  onPreviousLesson,
  previousLessonTitle,
}: PrerequisiteLockedStateProps) {
  return (
    <LessonAccessState
      body={`Bạn cần đánh dấu hoàn thành "${previousLessonTitle}" trước khi tiếp tục.`}
      ctaIcon="book-outline"
      ctaLabel="Quay lại bài trước"
      onBack={onBack}
      onCtaPress={onPreviousLesson}
      title="Chưa thể học bài này"
    />
  );
}
