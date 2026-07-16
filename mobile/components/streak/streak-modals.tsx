import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { Modal, Text, TouchableOpacity, View } from "react-native";

// Mốc chúc mừng chuỗi học: 5, 10, 20, 30, 40, ...
export const isStreakMilestone = (streak: number) =>
  streak === 5 || (streak > 0 && streak % 10 === 0);

export const getNextStreakMilestone = (streak: number) => {
  if (streak < 5) return 5;
  if (streak < 10) return 10;
  return (Math.floor(streak / 10) + 1) * 10;
};

const getPrevStreakMilestone = (streak: number) => {
  if (streak < 5) return 0;
  if (streak < 10) return 5;
  return Math.floor(streak / 10) * 10;
};

type CelebrationProps = {
  visible: boolean;
  streak: number;
  onClose: () => void;
};

// Popup chúc mừng khi đạt mốc chuỗi học (hiện lúc đăng nhập).
export function StreakCelebrationModal({
  visible,
  streak,
  onClose,
}: CelebrationProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <View className="w-full items-center gap-3 rounded-[32px] bg-white px-6 pb-6 pt-8">
          <LottieView
            source={require("../../assets/images/flame.json")}
            autoPlay
            loop
            style={{ width: 120, height: 120 }}
          />
          <View className="rounded-full bg-[#FFF3E0] px-4 py-1.5">
            <Text className="text-sm font-bold text-[#E8843C]">
              {streak} ngày liên tục
            </Text>
          </View>
          <Text
            className="text-center text-2xl font-bold text-[#10120C]"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Chúc mừng bạn! 🎉
          </Text>
          <Text className="text-center text-sm leading-6 text-[#55594F]">
            Bạn đã duy trì chuỗi học{" "}
            <Text className="font-bold text-[#E8843C]">{streak} ngày</Text> liên
            tiếp. Giữ vững phong độ nhé!
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onClose}
            className="mt-2 w-full items-center rounded-full bg-[#8E9E6E] py-4"
          >
            <Text className="font-bold text-white">Tiếp tục học</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

type StreakStatProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function StreakStat({ icon, label, value }: StreakStatProps) {
  return (
    <View className="flex-1 items-center gap-1 rounded-[18px] bg-[#F7F8F3] py-3">
      <Ionicons name={icon} size={18} color="#8E9E6E" />
      <Text className="text-lg font-bold text-[#10120C]">{value}</Text>
      <Text className="text-[11px] font-semibold text-[#8A8D84]">{label}</Text>
    </View>
  );
}

type DetailProps = {
  visible: boolean;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  onClose: () => void;
};

// Popup chi tiết chuỗi học khi người dùng chạm vào streak.
export function StreakDetailModal({
  visible,
  currentStreak,
  longestStreak,
  totalActiveDays,
  onClose,
}: DetailProps) {
  const nextMilestone = getNextStreakMilestone(currentStreak);
  const prevMilestone = getPrevStreakMilestone(currentStreak);
  const remaining = Math.max(0, nextMilestone - currentStreak);
  const span = nextMilestone - prevMilestone || 1;
  const progress = Math.min(
    1,
    Math.max(0, (currentStreak - prevMilestone) / span),
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1"
        />
        <View className="gap-5 rounded-t-[32px] bg-white px-6 pb-9 pt-6">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-lg font-bold text-[#10120C]"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Chuỗi học của bạn
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#F1F2EC]"
            >
              <Ionicons name="close" size={20} color="#10120C" />
            </TouchableOpacity>
          </View>

          <View className="items-center gap-0.5 rounded-[24px] bg-[#FFF7EC] py-6">
            <LottieView
              source={require("../../assets/images/flame.json")}
              autoPlay
              loop
              style={{ width: 72, height: 72 }}
            />
            <Text className="text-4xl font-black text-[#E8843C]">
              {currentStreak}
            </Text>
            <Text className="text-sm font-bold text-[#B4753A]">
              ngày học liên tiếp
            </Text>
          </View>

          <View className="flex-row gap-3">
            <StreakStat
              icon="flame"
              label="Hiện tại"
              value={`${currentStreak}`}
            />
            <StreakStat
              icon="trophy"
              label="Kỷ lục"
              value={`${longestStreak}`}
            />
            <StreakStat
              icon="calendar"
              label="Tổng ngày"
              value={`${totalActiveDays}`}
            />
          </View>

          <View className="gap-2 rounded-[20px] bg-[#F7F8F3] p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-[#4A533B]">
                Mốc kế tiếp: {nextMilestone} ngày
              </Text>
              <Text className="text-xs font-bold text-[#8E9E6E]">
                {remaining === 0 ? "Đã đạt!" : `Còn ${remaining} ngày`}
              </Text>
            </View>
            <View className="h-2.5 w-full overflow-hidden rounded-full bg-[#E2E8D3]">
              <View
                className="h-full rounded-full bg-[#8E9E6E]"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </View>
          </View>

          <Text className="text-center text-xs leading-5 text-[#8A8D84]">
            Học mỗi ngày để giữ ngọn lửa không tắt nhé!
          </Text>
        </View>
      </View>
    </Modal>
  );
}
