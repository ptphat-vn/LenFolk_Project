import { Ionicons } from "@expo/vector-icons";
import { getNoteLabel } from "@/constants/practice-notes";
import { Text, TouchableOpacity, View } from "react-native";

import type { LessonDetailViewModel } from "./types";

type Props = {
  lesson: LessonDetailViewModel;
  onPracticePress: () => void;
};

export function LessonPracticeSection({ lesson, onPracticePress }: Props) {
  if (!lesson.hasPractice) {
    return (
      <View className="flex-row items-center gap-3 rounded-[28px] bg-[#E8EFDD] p-6">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-white/70">
          <Ionicons name="book-outline" size={22} color="#687451" />
        </View>
        <Text selectable className="min-w-0 flex-1 text-sm leading-6 text-[#4A533B]">
          Đây là bài giới thiệu, chỉ cần đọc và làm quen với cây sáo — chưa có
          phần ghi âm luyện tập. Hãy chuyển sang các bài sau để bắt đầu luyện
          thổi cùng AI.
        </Text>
      </View>
    );
  }

  return (
    <>
      <View className="gap-3 rounded-[28px] bg-[#F4E0AC] p-6">
        <View className="flex-row items-center gap-3">
          <Ionicons name="musical-note" size={24} color="#7C672D" />
          <Text
            selectable
            numberOfLines={2}
            className="min-w-0 flex-1 text-base font-bold text-[#4B421F]"
          >
            Bài tập thực hành
          </Text>
        </View>
        <Text selectable className="text-sm leading-6 text-[#5F542D]">
          {lesson.practiceTip}
        </Text>
        {lesson.lessonNumber === 2 ? (
          <Text selectable className="text-xs font-bold text-[#7C672D]">
            Mục tiêu: tạo được âm sáo rõ
          </Text>
        ) : (
          <Text selectable className="text-xs font-bold text-[#7C672D]">
            Nốt mục tiêu: {getNoteLabel(lesson.targetNote)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPracticePress}
        className="flex-row items-center justify-between rounded-[24px] bg-[#10120C] px-6 py-5"
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="mic" size={22} color="white" />
          </View>
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="text-base font-bold text-white">
              {lesson.lessonNumber === 2 ? "Ghi âm tiếng sáo" : "Ghi âm nốt thổi"}
            </Text>
            <Text numberOfLines={1} className="text-xs text-white/65">
              {lesson.lessonNumber === 2
                ? "AI kiểm tra âm sáo rõ hay chưa"
                : "AI phân tích cơ bản + LLM"}
            </Text>
          </View>
        </View>
        <Ionicons name="arrow-forward" size={22} color="white" />
      </TouchableOpacity>
    </>
  );
}
