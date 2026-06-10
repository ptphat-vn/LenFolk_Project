import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import SafeScreen from "@/components/SafeScreen";
import { getLessonById } from "@/constants/lessons";

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLessonById(id);

  if (!lesson) {
    return (
      <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
        <Stack.Screen options={{ title: "Bài học" }} />
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#8E9E6E" />
          <Text selectable className="text-lg font-bold text-[#10120C]">
            Không tìm thấy bài học
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-full bg-[#8E9E6E] px-6 py-3"
          >
            <Text className="font-bold text-white">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <Stack.Screen options={{ title: lesson.title, headerShown: false }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 48, gap: 20 }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>
          <View className="rounded-full bg-[#E2E8D3] px-4 py-2">
            <Text selectable className="text-xs font-bold text-[#687451]">
              {lesson.category} · {lesson.duration}
            </Text>
          </View>
        </View>

        <View className="gap-4 rounded-[30px] bg-[#8E9E6E] p-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/90">
            <Ionicons name="book-outline" size={28} color="#8E9E6E" />
          </View>
          <Text
            selectable
            className="text-2xl font-bold leading-8 text-white"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            {lesson.title}
          </Text>
          <Text selectable className="text-sm leading-6 text-white/90">
            {lesson.objective}
          </Text>
        </View>

        <View className="gap-4 rounded-[28px] bg-white p-6">
          <Text
            selectable
            className="text-lg font-bold text-[#10120C]"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Nội dung chính
          </Text>
          {lesson.theory.map((item, index) => (
            <View key={item} className="flex-row gap-3">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-[#E2E8D3]">
                <Text selectable className="text-xs font-bold text-[#687451]">
                  {index + 1}
                </Text>
              </View>
              <Text selectable className="flex-1 text-sm leading-6 text-[#44483D]">
                {item}
              </Text>
            </View>
          ))}
        </View>

        <View className="gap-3 rounded-[28px] bg-[#F4E0AC] p-6">
          <View className="flex-row items-center gap-3">
            <Ionicons name="musical-note" size={24} color="#7C672D" />
            <Text selectable className="text-base font-bold text-[#4B421F]">
              Bài tập thực hành
            </Text>
          </View>
          <Text selectable className="text-sm leading-6 text-[#5F542D]">
            {lesson.practiceTip}
          </Text>
          <Text selectable className="text-xs font-bold text-[#7C672D]">
            Nốt mục tiêu: {lesson.targetNote}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push(
              {
                pathname: "/practice/[lessonId]",
                params: {
                  lessonId: String(lesson.id),
                  note: lesson.targetNote,
                },
              } as unknown as Href,
            )
          }
          className="flex-row items-center justify-between rounded-[24px] bg-[#10120C] px-6 py-5"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Ionicons name="mic" size={22} color="white" />
            </View>
            <View>
              <Text className="text-base font-bold text-white">Ghi âm nốt thổi</Text>
              <Text className="text-xs text-white/65">AI phân tích cơ bản + LLM</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={22} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}
