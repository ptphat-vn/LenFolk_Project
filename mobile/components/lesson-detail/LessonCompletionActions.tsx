import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import type { Lesson } from "@/types/lessons.type";

type Props = {
  isCompleted: boolean;
  isMarkingComplete: boolean;
  nextLesson?: Lesson;
  onMarkComplete: () => void;
  onNextLesson: () => void;
};

export function LessonCompletionActions({
  isCompleted,
  isMarkingComplete,
  nextLesson,
  onMarkComplete,
  onNextLesson,
}: Props) {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={isCompleted || isMarkingComplete}
        onPress={onMarkComplete}
        className={`flex-row items-center justify-center gap-3 rounded-[24px] px-6 py-5 ${
          isCompleted ? "bg-[#E2E8D3]" : "bg-[#8E9E6E]"
        }`}
      >
        {isMarkingComplete ? (
          <ActivityIndicator color={isCompleted ? "#687451" : "white"} />
        ) : (
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
            size={22}
            color={isCompleted ? "#687451" : "white"}
          />
        )}
        <Text
          className={`text-base font-bold ${
            isCompleted ? "text-[#687451]" : "text-white"
          }`}
        >
          {isCompleted ? "Đã hoàn thành" : "Đánh dấu đã hoàn thành"}
        </Text>
      </TouchableOpacity>

      {nextLesson && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onNextLesson}
          className="flex-row items-center justify-between rounded-[24px] border border-[#D6DDC6] bg-white px-6 py-5"
        >
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
              Bài tiếp theo
            </Text>
            <Text
              numberOfLines={1}
              className="mt-1 text-base font-bold text-[#10120C]"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              {nextLesson.title}
            </Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#8E9E6E]">
            <Ionicons name="arrow-forward" size={22} color="white" />
          </View>
        </TouchableOpacity>
      )}
    </>
  );
}
