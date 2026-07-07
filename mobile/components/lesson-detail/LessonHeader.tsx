import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import type { LessonDetailViewModel } from "./types";

type Props = {
  lesson: LessonDetailViewModel;
  onBack: () => void;
};

export function LessonHeader({ lesson, onBack }: Props) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onBack}
        className="h-11 w-11 items-center justify-center rounded-full bg-white"
      >
        <Ionicons name="arrow-back" size={22} color="#10120C" />
      </TouchableOpacity>
      <View className="min-w-0 flex-1 items-end">
        <View className="max-w-full rounded-full bg-[#E2E8D3] px-4 py-2">
          <Text
            selectable
            numberOfLines={1}
            className="text-xs font-bold text-[#687451]"
          >
            {lesson.category} · {lesson.duration}
          </Text>
        </View>
      </View>
    </View>
  );
}
