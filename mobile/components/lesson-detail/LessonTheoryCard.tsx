import { Text, View } from "react-native";

type Props = {
  theory: string[];
};

export function LessonTheoryCard({ theory }: Props) {
  return (
    <View className="gap-4 rounded-[28px] bg-white p-6">
      <Text
        selectable
        className="text-lg font-bold text-[#10120C]"
        style={{ fontFamily: "BeVietnamPro-Medium" }}
      >
        Nội dung chính
      </Text>
      {theory.map((item, index) => (
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
  );
}
