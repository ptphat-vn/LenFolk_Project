import { Image } from "expo-image";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { mouthPlacementPracticeImages } from "./practice-assets";

type Props = {
  onOpenImage: (index: number) => void;
};

export function LessonTwoMouthPlacementPractice({ onOpenImage }: Props) {
  return (
    <View className="gap-4 rounded-[26px] bg-white p-5">
      <View>
        <Text className="text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
          Hình mẫu thực hành
        </Text>
        <Text className="mt-1 text-sm leading-5 text-[#777B70]">
          Xem cách đặt môi, cầm sáo và hướng hơi trước khi ghi âm.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {mouthPlacementPracticeImages.map((imageSource, index) => (
          <TouchableOpacity
            key={`mouth-placement-${index}`}
            activeOpacity={0.88}
            onPress={() => onOpenImage(index)}
            className="w-64 overflow-hidden rounded-[22px] bg-[#F7F8F3]"
          >
            <Image
              source={imageSource}
              contentFit="contain"
              style={{ height: 240, width: "100%" }}
            />
            <Text className="px-4 py-3 text-xs font-semibold text-[#687451]">
              Mẫu {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
