import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";

import { AnimatedBlock } from "@/components/AnimatedPage";
import SafeScreen from "@/components/SafeScreen";
import {
  getRandomPracticeNote,
  PRACTICE_NOTES,
} from "@/constants/practice-notes";
import {
  getLessonNumberFromTitle,
  lessonHasPractice,
} from "@/constants/lessons";
import { useGetLessons } from "@/hooks/lesson/use-get-lessons";
import { useScrollToTopOnFocus } from "@/hooks/use-scroll-to-top-on-focus";

const NOTE_COLORS = [
  "#DCE6CB",
  "#E9DDBD",
  "#D8E4E2",
  "#E5D8CE",
  "#DDE0C8",
  "#E8D7C0",
  "#D6E1D4",
];

export default function PracticeTabScreen() {
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const { data: lessons, isLoading } = useGetLessons();
  const orderedLessons = React.useMemo(
    () => [...(lessons ?? [])].sort((a, b) => a.order - b.order),
    [lessons],
  );
  // Bài giới thiệu (ví dụ Bài 1) không có phần luyện tập nên không hiển thị ở
  // danh sách "Luyện theo bài học".
  const practiceableLessons = React.useMemo(
    () =>
      orderedLessons.filter((lesson) =>
        lessonHasPractice(getLessonNumberFromTitle(lesson.title) ?? lesson.order),
      ),
    [orderedLessons],
  );
  const firstLesson = practiceableLessons[0] || orderedLessons[0];
  const notePracticeLesson =
    practiceableLessons.find(
      (lesson) =>
        (getLessonNumberFromTitle(lesson.title) ?? lesson.order) !== 2,
    ) || firstLesson;

  const openPractice = (
    lessonId?: string,
    note?: string,
    lessonNumber?: number | string,
    practiceMode: "note" | "lesson" = "lesson",
  ) => {
    if (!lessonId) return;

    Haptics.selectionAsync().catch(() => undefined);
    router.push({
      pathname: "/practice/[lessonId]",
      params: {
        lessonId,
        lessonNumber: lessonNumber != null ? String(lessonNumber) : undefined,
        practiceMode,
        note: note || getRandomPracticeNote().pitch,
      },
    } as unknown as Href);
  };

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <AnimatedBlock variant="header" className="px-6 pb-5 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text
                className="text-2xl font-bold text-[#10120C]"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Luyện tập
              </Text>
              <Text className="mt-1 text-sm text-[#777B70]">
                Luyện cao độ mỗi ngày cùng AI
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
              <Ionicons name="musical-notes" size={22} color="#8E9E6E" />
            </View>
          </View>
        </AnimatedBlock>

        <AnimatedBlock variant="hero" delay={80} className="mx-6 mb-7">
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!firstLesson}
            onPress={() =>
              openPractice(
                notePracticeLesson?._id,
                undefined,
                notePracticeLesson?.order,
                "note",
              )
            }
            className="overflow-hidden rounded-[32px] bg-[#8E9E6E] px-6 py-6"
          >
            <View className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <View className="absolute -bottom-12 right-16 h-28 w-28 rounded-full border-[18px] border-white/5" />

            <View className="mb-7 flex-row items-start justify-between">
              <View className="rounded-full bg-white/15 px-3 py-1.5">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-white">
                  Bài luyện hôm nay
                </Text>
              </View>
              <Ionicons name="shuffle" size={22} color="white" />
            </View>

            <Text
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Luyện nốt ngẫu nhiên
            </Text>
            <Text className="mt-2 max-w-[270px] text-sm leading-6 text-white/75">
              AI chọn một trong 7 nốt và đánh giá độ chính xác, độ ổn định khi
              bạn thổi.
            </Text>

            <View className="mt-6 flex-row items-center self-start rounded-full bg-white px-5 py-3">
              <Ionicons name="mic" size={18} color="#687451" />
              <Text className="ml-2 text-sm font-bold text-[#687451]">
                Bắt đầu ngay
              </Text>
            </View>
          </TouchableOpacity>
        </AnimatedBlock>

        <AnimatedBlock variant="panel" delay={130} className="mb-8">
          <View className="mb-4 flex-row items-end justify-between px-6">
            <View className="min-w-0 flex-1 pr-3">
              <Text
                numberOfLines={1}
                className="text-lg font-bold text-[#10120C]"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Chọn nốt
              </Text>
              <Text numberOfLines={1} className="mt-1 text-xs text-[#777B70]">
                Luyện riêng từng cao độ
              </Text>
            </View>
            <Text numberOfLines={1} className="shrink-0 text-xs font-bold text-[#8E9E6E]">7 nốt cơ bản</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
          >
            {PRACTICE_NOTES.map((practiceNote, index) => (
              <TouchableOpacity
                key={practiceNote.pitch}
                activeOpacity={0.85}
                disabled={!notePracticeLesson}
                onPress={() =>
                  openPractice(
                    notePracticeLesson?._id,
                    practiceNote.pitch,
                    notePracticeLesson?.order,
                    "note",
                  )
                }
                className="h-24 w-[72px] items-center justify-between rounded-[24px] border border-white/70 px-2 py-3"
                style={{ backgroundColor: NOTE_COLORS[index] }}
              >
                <Text className="text-[10px] font-bold text-[#687451]/60">
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <Text
                  className="text-base font-bold text-[#39402F]"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  {practiceNote.label}
                </Text>
                <Ionicons name="play" size={13} color="#687451" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AnimatedBlock>

        <AnimatedBlock variant="panel" delay={180} className="px-6">
          <View className="mb-4">
            <Text
              className="text-lg font-bold text-[#10120C]"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Luyện theo bài học
            </Text>
            <Text className="mt-1 text-xs text-[#777B70]">
              Chọn nội dung và luyện với một nốt ngẫu nhiên
            </Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#8E9E6E" size="large" className="py-16" />
          ) : practiceableLessons.length > 0 ? (
            <View className="overflow-hidden rounded-[28px] bg-white px-5">
              {practiceableLessons.map((lesson, index) => (
                <TouchableOpacity
                  key={lesson._id}
                  activeOpacity={0.82}
                  onPress={() => openPractice(lesson._id, undefined, lesson.order, "lesson")}
                  className={`flex-row items-center py-5 ${
                    index < practiceableLessons.length - 1
                      ? "border-b border-[#ECEDE8]"
                      : ""
                  }`}
                >
                  <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-[#F1F4EA]">
                    <Text className="text-xs font-bold text-[#687451]">
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      numberOfLines={2}
                      className="text-sm font-bold leading-5 text-[#10120C]"
                      style={{ fontFamily: "BeVietnamPro-Medium" }}
                    >
                      {lesson.title}
                    </Text>
                    <View className="mt-1.5 flex-row items-center">
                      <Ionicons name="time-outline" size={13} color="#9A9D94" />
                      <Text numberOfLines={1} className="ml-1 text-xs text-[#8A8D84]">
                        {Math.max(1, Math.ceil(lesson.duration / 60))} phút
                      </Text>
                      <View className="mx-2 h-1 w-1 rounded-full bg-[#C5C7C0]" />
                      <Text numberOfLines={1} className="min-w-0 flex-1 text-xs text-[#8A8D84]">
                        AI chọn nốt
                      </Text>
                    </View>
                  </View>
                  <View className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-[#FDF8EA]">
                    <Ionicons name="arrow-forward" size={17} color="#8E9E6E" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center rounded-[28px] bg-white px-6 py-14">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F1F4EA]">
                <Ionicons
                  name="musical-notes-outline"
                  size={26}
                  color="#8E9E6E"
                />
              </View>
              <Text className="mt-4 text-center text-sm font-bold text-[#10120C]">
                Chưa có bài luyện tập
              </Text>
            </View>
          )}
        </AnimatedBlock>
      </ScrollView>
    </SafeScreen>
  );
}
