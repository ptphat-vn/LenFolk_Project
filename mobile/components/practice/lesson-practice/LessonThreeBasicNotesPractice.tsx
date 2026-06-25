import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";

import { basicNotesPracticeImage } from "./practice-assets";

type Props = {
  targetNote: string;
  targetNoteLabel: string;
  onOpenImage: () => void;
};

export function LessonThreeBasicNotesPractice({
  targetNote,
  targetNoteLabel,
  onOpenImage,
}: Props) {
  return (
    <View className="gap-4 rounded-[26px] bg-white p-5">
      <View>
        <Text className="text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
          Bảng thế bấm ngón
        </Text>
        <Text className="mt-1 text-sm leading-5 text-[#777B70]">
          Chọn nốt bên dưới rồi đối chiếu bảng để đặt ngón đúng trước khi thổi.
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onOpenImage}
        className="overflow-hidden rounded-[22px] bg-[#F7F8F3]"
      >
        <Image
          source={basicNotesPracticeImage}
          contentFit="contain"
          style={{ height: 230, width: "100%" }}
        />
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="text-xs font-semibold text-[#687451]">
            Đang luyện: {targetNoteLabel} ({targetNote})
          </Text>
          <Ionicons name="expand-outline" size={18} color="#687451" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
