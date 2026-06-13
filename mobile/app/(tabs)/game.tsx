import React from "react";
import { Alert, View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { AnimatedBlock } from "@/components/AnimatedPage";
import { useScrollToTopOnFocus } from "@/hooks/use-scroll-to-top-on-focus";
import { useAuthStore } from "@/store/authStore";
import SafeScreen from "../../components/SafeScreen";
import NotificationButton from "@/components/NotificationButton";
import { useRouter } from "expo-router";

export default function GameScreen() {
  const scrollRef = useScrollToTopOnFocus();
  const router = useRouter();
  const [activeGameIndex, setActiveGameIndex] = React.useState(0);
  const [challengePaused, setChallengePaused] = React.useState(false);
  const user = useAuthStore((state) => state.user);
  const displayName = user?.name?.trim() || "Bạn";
  const avatarSource = user?.avatar
    ? { uri: user.avatar }
    : require("../../assets/images/Profile.png");

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / 272);
    setActiveGameIndex(Math.max(0, Math.min(games.length - 1, index)));
  };

  const games = [
    {
      title: "Thổi Theo Nhịp",
      badge: "Khó",
      xp: "+20 XP/vòng",
      players: "620 người chơi",
      desc: "Thổi đúng theo nhịp metronome. Luyện cảm giác nhịp điệu chuyên nghiệp.",
      icon: "wind-power",
      type: "material",
    },
    {
      title: "Nghe & Đoán Nốt",
      badge: "Dễ",
      xp: "+10 XP/câu",
      players: "1.240 người chơi",
      desc: "Nghe âm thanh và chọn đúng nốt nhạc. Luyện tai nghe âm thanh.",
      icon: "headphones",
      type: "feather",
    },
    {
      title: "Bấm Đúng Nốt",
      badge: "Trung bình",
      xp: "+15 XP/câu",
      players: "890 người chơi",
      desc: "Nhìn nốt nhạc hiển thị và bấm đúng lỗ trên sáo. Luyện kỹ thuật bấm.",
      icon: "music-note",
      type: "material",
    },
  ];

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />

      {/* Main Scroll Container */}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* --- HEADER --- */}
        <AnimatedBlock variant="header" className="px-6 pt-2 pb-4 flex-row justify-between items-center bg-[#FDF8EA]">
          {/* Back Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-gray-100"
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#10120C"
              className="animate-arrow-left"
            />
          </TouchableOpacity>

          {/* Title */}
          <Text
            className="text-xl font-bold text-charcoal text-center"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            TRÒ CHƠI
          </Text>

          {/* Bell Notifications */}
          <NotificationButton />
        </AnimatedBlock>

        {/* --- DAILY CHALLENGE GREEN BANNER CARD --- */}
        <AnimatedBlock
          variant="hero"
          delay={90}
          className="mx-6 bg-[#8E9E6E] p-5 rounded-[32px] mb-6 shadow-sm border border-[#8E9E6E]/20 relative"
          style={{ minHeight: 140 }}
        >
          {/* Ribbon Flag - absolute top right */}
          <View 
            style={{ position: "absolute", right: 26, top: -1, width: 44, height: 55, backgroundColor: "#FFF9E6", borderBottomLeftRadius: 8, borderBottomRightRadius: 8, alignItems: "center", justifyContent: "center" }}
            className="shadow-sm"
          >
            <Text className="text-[#8E9E6E] text-xs font-black">X3</Text>
            <Text className="text-[#8E9E6E] text-[12px] font-black mt-0.5">XP</Text>
          </View>

          {/* Left Contents */}
          <View className="pr-16">
            <View className="flex-row items-center mb-1">
              <Text className="text-white text-[16px] font-extrabold" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                ⚡ THÁCH THỨC NGÀY
              </Text>
            </View>

            <Text className="text-white/80 text-xs font-semibold mb-5 mt-1">
              Chơi 3 trò, nhận thưởng lớn
            </Text>

            {/* Slider track progress bar */}
            <View className="w-full bg-white/20 h-2 rounded-full mb-1">
              <View className="h-full bg-white rounded-full" style={{ width: "33%" }} />
            </View>
            <Text className="text-[13px] text-white/90 font-bold">1/3 hoàn thành</Text>
          </View>

          {/* Pause Button - absolute bottom right */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ position: "absolute", right: 20, bottom: 20 }}
            className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-md"
            onPress={() => setChallengePaused((value) => !value)}
          >
            <Ionicons name={challengePaused ? "play" : "pause"} size={22} color="#8E9E6E" />
          </TouchableOpacity>
        </AnimatedBlock>

        {/* --- CAROUSEL SELECT GAMES SECTION --- */}
        <AnimatedBlock variant="panel" delay={150} className="mb-8">
          <Text
            className="text-base font-bold text-charcoal mb-4 mx-6"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Chọn trò chơi:
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            snapToInterval={272}
            decelerationRate="fast"
            snapToAlignment="start"
            scrollEventThrottle={16}
            onScroll={handleScroll}
          >
            {games.map((game, idx) => (
              <AnimatedBlock
                variant="card"
                key={idx}
                delay={200 + idx * 55}
                className="w-64 rounded-[32px] overflow-hidden shadow-sm border border-gray-150 flex-col my-2"
                style={{ minHeight: 220 }}
              >
                {/* Green Header Part */}
                <View className="bg-[#8E9E6E] p-4 flex-row items-center rounded-t-[32px]">
                  {/* Circular Icon Container */}
                  <View className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-xs mr-3">
                    {game.type === "material" && <MaterialCommunityIcons name={game.icon as any} size={22} color="#8E9E6E" />}
                    {game.type === "feather" && <Feather name={game.icon as any} size={20} color="#8E9E6E" />}
                  </View>
                  
                  {/* Header text contents */}
                  <View className="flex-1">
                    <Text className="text-white text-sm font-bold leading-5" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                      {game.title}
                    </Text>
                    
                    {/* Badge + XP row */}
                    <View className="flex-row items-center mt-1 flex-wrap gap-1">
                      <View className="bg-white/20 px-1.5 py-0.5 rounded">
                        <Text className="text-[12px] text-white font-extrabold">{game.badge}</Text>
                      </View>
                      <Text className="text-[12px] text-white/90 font-bold ml-1">{game.xp}</Text>
                    </View>
                    
                    {/* Player count */}
                    <Text className="text-[12px] text-white/75 font-semibold mt-1">
                      {game.players}
                    </Text>
                  </View>
                </View>

                {/* Cream Body Part */}
                <View className="bg-[#FFF9E6] p-4 flex-1 justify-between rounded-b-[32px]">
                  {/* Description */}
                  <Text className="text-charcoal/70 text-[13px] leading-5 font-semibold mb-4 text-left">
                    {game.desc}
                  </Text>

                  {/* Play Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="w-full bg-white py-2 rounded-full items-center justify-center border border-gray-100 shadow-sm"
                    onPress={() =>
                      Alert.alert(
                        game.title,
                        "Backend hiện chưa có API game. Bạn vẫn có thể luyện nốt bằng AI trong mục Bài học.",
                        [
                          { text: "Đóng", style: "cancel" },
                          { text: "Mở bài học", onPress: () => router.push("/(tabs)/courses") },
                        ],
                      )
                    }
                  >
                    <Text
                      className="text-[#8E9E6E] font-bold text-xs"
                      style={{ fontFamily: "BeVietnamPro-Medium" }}
                    >
                      Bắt đầu chơi
                    </Text>
                  </TouchableOpacity>
                </View>
              </AnimatedBlock>
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View className="flex-row justify-center gap-1.5 mt-4">
            {games.map((_, idx) => (
              <View
                key={idx}
                className={`w-1.5 h-1.5 rounded-full ${idx === activeGameIndex ? "bg-[#8E9E6E]" : "bg-[#C2C5BA]"}`}
              />
            ))}
          </View>
        </AnimatedBlock>

        <AnimatedBlock variant="chip" delay={260} className="mx-6 mb-4 flex-row justify-between items-center">
          <Text
            className="text-base font-bold text-charcoal"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Xếp hạng của bạn
          </Text>
        </AnimatedBlock>

        <AnimatedBlock
          variant="card"
          delay={320}
          className="bg-[#FFF9E6] rounded-[32px] p-5 mx-6 shadow-sm border border-[#F4E0AC]/20"
        >
          <View className="bg-[#8E9E6E] rounded-3xl p-4 flex-row items-center mb-4">
            <View className="relative mr-3">
              <Image
                source={avatarSource}
                style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: "white" }}
                className="shadow-sm"
              />
              {user?.isSubscribed && (
                <View className="absolute -top-3.5 -left-1.5 rotate-[-15deg] z-10">
                  <MaterialCommunityIcons name="crown" size={22} color="#FFB800" />
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text
                className="text-white text-sm font-bold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                {displayName}
              </Text>
              <Text className="text-white/75 text-[12px] font-semibold mt-1">
                {user?.email || "Chưa có email"}
              </Text>
            </View>
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-[12px] font-extrabold">
                {user?.isVerified ? "Verified" : "Pending"}
              </Text>
            </View>
          </View>

          <View className="items-center py-5">
            <View className="w-12 h-12 rounded-full bg-[#8E9E6E]/15 items-center justify-center mb-3">
              <Ionicons name="podium-outline" size={24} color="#8E9E6E" />
            </View>
            <Text
              className="text-charcoal text-sm font-bold text-center"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Chưa có dữ liệu điểm thật
            </Text>
            <Text className="text-charcoal/60 text-xs text-center leading-5 mt-2 px-3">
              Khi API game trả về điểm và thứ hạng, khu vực này sẽ hiển thị bảng xếp hạng thật của tài khoản đang đăng nhập.
            </Text>
          </View>
        </AnimatedBlock>
      </ScrollView>
    </SafeScreen>
  );
}
