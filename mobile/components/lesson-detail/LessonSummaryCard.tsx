import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { LessonDetailViewModel } from "./types";

type Props = {
  lesson: LessonDetailViewModel;
};

export function LessonSummaryCard({ lesson }: Props) {
  return (
    <View className="gap-4 rounded-[30px] bg-[#8E9E6E] p-6">
      <View className="flex-row items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/90">
          <Ionicons name="book-outline" size={28} color="#8E9E6E" />
        </View>
        <Text
          selectable
          className="min-w-0 flex-1 text-xl font-bold leading-8 text-white"
          style={{ fontFamily: "BeVietnamPro-Medium" }}
        >
          {lesson.title}
        </Text>
      </View>
      <Text selectable className="text-sm leading-6 text-white/90">
        {lesson.objective}
      </Text>
    </View>
  );
}
