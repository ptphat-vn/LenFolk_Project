import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { Href, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { Ionicons, Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AnimatedBlock } from "@/components/AnimatedPage";
import { useScrollToTopOnFocus } from "@/hooks/use-scroll-to-top-on-focus";
import SafeScreen from "../../components/SafeScreen";
import { useGetLessons } from "@/hooks/lesson/use-get-lessons";
import { useGetCourses } from "@/hooks/course/use-get-courses";
import { useGetProgressList } from "@/hooks/progress/use-get-progress-list";
import NotificationButton from "@/components/NotificationButton";

export default function CoursesScreen() {
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWidth, setFilterWidth] = useState(0);
  const filterIndicatorX = useSharedValue(0);

  const { data: dbLessons, isLoading: lessonsLoading } = useGetLessons();
  const { data: courses } = useGetCourses();
  const { data: progressList } = useGetProgressList();

  const allLessonsMapped = React.useMemo(() => {
    if (!dbLessons) return [];
    return dbLessons.map((lesson) => {
      const course = courses?.find((c) => c._id === lesson.courseId);
      const category = course
        ? course.level === "beginner"
          ? "Cơ bản"
          : course.level === "intermediate"
          ? "Trung cấp"
          : "Nâng cao"
        : "Cơ bản";
      const userProgress = progressList?.find((p) => p.lessonId === lesson._id);
      const status = userProgress?.status || "not_started";
      const progress = (userProgress?.completionPercent || 0) / 100;

      const minutes = Math.floor(lesson.duration / 60);
      const seconds = lesson.duration % 60;
      const duration = `${minutes}:${String(seconds).padStart(2, "0")}`;

      return {
        id: lesson._id,
        category,
        title: lesson.title,
        duration,
        status,
        progress,
      };
    });
  }, [dbLessons, courses, progressList]);

  const categories = ["Tất cả", "Cơ bản", "Trung cấp", "Nâng cao"];
  const activeFilterIndex = categories.indexOf(activeFilter);

  React.useEffect(() => {
    filterIndicatorX.value = withSpring(activeFilterIndex * filterWidth, {
      damping: 22,
      stiffness: 220,
      mass: 0.7,
      overshootClamping: false,
    });
  }, [activeFilterIndex, filterIndicatorX, filterWidth]);

  const filterIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: filterIndicatorX.value }],
  }));

  // Filter lessons based on category pill and search query
  const filteredLessons = allLessonsMapped.filter((lesson) => {
    const matchesFilter = activeFilter === "Tất cả" || lesson.category === activeFilter;
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* --- TOP CONTAINER (CREAM HEADER) --- */}
        <AnimatedBlock variant="header" className="bg-[#FDF8EA] pt-2 pb-5 px-6">
          {/* Header Navigation Row */}
          <View className="flex-row justify-between items-center mb-6">
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

            {/* Center Screen Title */}
            <Text
              className="text-xl font-bold text-charcoal text-center"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              BÀI HỌC
            </Text>

            {/* Green Circle Bell Notification Button */}
            <NotificationButton inverted />
          </View>

          {/* Search Bar Input */}
          <View className="w-full flex-row items-center bg-white rounded-full px-5 py-3 shadow-sm border border-gray-100 mb-2">
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-charcoal text-sm ml-3 py-1"
              placeholder="Tìm kiếm"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              className="pl-3 border-l border-gray-150"
              onPress={() => {
                setSearchQuery("");
                setActiveFilter("Tất cả");
              }}
            >
              <Ionicons name="options-outline" size={20} color="#8E9E6E" />
            </TouchableOpacity>
          </View>
        </AnimatedBlock>

        {/* --- CATEGORY SELECTOR TABS ROW --- */}
        <AnimatedBlock
          variant="chip"
          delay={90}
          className="flex-row justify-between mx-6 z-10 -mb-[1px] relative"
          style={{ overflow: "hidden" }}
        >
          <View
            pointerEvents="none"
            className="absolute inset-0"
            onLayout={(event) => {
              setFilterWidth(event.nativeEvent.layout.width / categories.length);
            }}
          />
          {filterWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              className="absolute left-0 top-0 bottom-0 bg-[#8E9E6E] rounded-t-2xl"
              style={[{ width: filterWidth }, filterIndicatorStyle]}
            />
          )}
          {categories.map((cat) => {
            const isSelected = activeFilter === cat;

            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(cat)}
                className="py-3.5 items-center justify-center flex-1 z-10"
              >
                <Text
                  className={`text-[16px] font-bold ${
                    isSelected ? "text-[#10120C]" : "text-charcoal"
                  }`}
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </AnimatedBlock>

        {/* --- SAGE GREEN CONTAINER FOR LESSONS LIST --- */}
        <View
          className="mx-6 shadow-sm overflow-hidden"
          style={{
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            borderTopLeftRadius: activeFilter === "Tất cả" ? 0 : 20,
            borderTopRightRadius: activeFilter === "Nâng cao" ? 0 : 20,
          }}
        >
          <AnimatedBlock
            variant="listContainer"
            delay={420}
            className="bg-[#8E9E6E] pt-8 pb-4 px-5"
          >
            {lessonsLoading ? (
              <ActivityIndicator color="white" size="large" className="py-12" />
            ) : filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  activeOpacity={0.9}
                  delayLongPress={350}
                  onPress={() =>
                    router.push({
                      pathname: "/lesson/[id]",
                      params: { id: String(lesson.id) },
                    } as unknown as Href)
                  }
                  onLongPress={() => {
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Medium,
                    ).catch(() => undefined);
                    Alert.alert(
                      lesson.title,
                      `${lesson.category} • ${lesson.duration}`,
                      [
                        { text: "Đóng", style: "cancel" },
                        {
                          text: "Mở bài học",
                          onPress: () =>
                            router.push({
                              pathname: "/lesson/[id]",
                              params: { id: String(lesson.id) },
                            } as unknown as Href),
                        },
                      ],
                    );
                  }}
                  className="w-full bg-[#E2E8D3] rounded-3xl p-5 mb-4 flex-row items-center justify-between shadow-sm border border-[#D6DDC6]/40"
                >
                  {/* Left Column: Icon Status badge + Title & Category */}
                  <View className="min-w-0 flex-row items-center flex-1 pr-4 px-2">
                    {/* Status Badge */}
                    <View className="mr-4">
                      {lesson.status === "completed" && (
                        <View className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border-2 border-[#8E9E6E]">
                          <Ionicons name="checkmark" size={20} color="#8E9E6E" />
                        </View>
                      )}
                      {lesson.status === "in_progress" && (
                        <View className="w-10 h-10 rounded-full bg-[#8E9E6E] justify-center items-center shadow-sm">
                          <Ionicons name="pause" size={18} color="white" />
                        </View>
                      )}
                      {lesson.status === "not_started" && (
                        <View className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border-2 border-white">
                          <Ionicons name="play" size={18} color="#8E9E6E" style={{ marginLeft: 3 }} />
                        </View>
                      )}
                    </View>

                    {/* Titles */}
                    <View className="min-w-0 flex-1">
                      <Text numberOfLines={1} className="text-xs text-charcoal/70 font-semibold mb-0.5">
                        {lesson.category}
                      </Text>
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        className="text-[16px] font-bold text-charcoal leading-5"
                        style={{ fontFamily: "BeVietnamPro-Medium" }}
                      >
                        {lesson.title}
                      </Text>

                      {/* Progress bar under title for in_progress status */}
                      {lesson.status === "in_progress" && (
                        <View className="w-full max-w-[180px] h-1.5 bg-white rounded-full mt-2.5 overflow-hidden">
                          <View
                            className="h-full bg-primary"
                            style={{ width: `${(lesson.progress || 0.6) * 100}%`, backgroundColor: Colors.light.primary }}
                          />
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Right Column: Duration duration */}
                  <Text
                    numberOfLines={1}
                    className="shrink-0 text-sm font-bold text-charcoal/90"
                  >
                    {lesson.duration}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View className="items-center justify-center py-20 bg-[#E2E8D3] rounded-3xl p-6">
                <Feather name="search" size={32} color="#8E9E6E" className="mb-3" />
                <Text className="text-base font-bold text-charcoal text-center mb-1">
                  Không tìm thấy bài học nào
                </Text>
                <Text className="text-xs text-charcoal/60 text-center px-4 leading-4">
                  Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc của bạn.
                </Text>
              </View>
            )}
          </AnimatedBlock>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
