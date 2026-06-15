import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AnimatedBlock } from "@/components/AnimatedPage";
import SafeScreen from "@/components/SafeScreen";
import { useGetLessons } from "@/hooks/lesson/use-get-lessons";
import { useScrollToTopOnFocus } from "@/hooks/use-scroll-to-top-on-focus";

export default function PracticeTabScreen() {
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const { data: lessons, isLoading } = useGetLessons();
  const orderedLessons = React.useMemo(
    () => [...(lessons ?? [])].sort((a, b) => a.order - b.order),
    [lessons],
  );

  const openPractice = (lessonId?: string, note?: string) => {
    if (!lessonId) return;

    router.push({
      pathname: "/practice/[lessonId]",
      params: { lessonId, note: note || "A4" },
    } as unknown as Href);
  };

  const firstLesson = orderedLessons[0];

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <AnimatedBlock
          variant="header"
          className="bg-[#FDF8EA] px-6 pt-2 pb-5"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text
                className="text-xl font-bold text-charcoal"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                LUYỆN TẬP
              </Text>
              <Text className="mt-1 text-xs font-semibold text-charcoal/55">
                Chọn bài và bắt đầu luyện cùng AI
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!firstLesson}
              onPress={() =>
                openPractice(firstLesson?._id, firstLesson?.techniques?.[0])
              }
              className="h-11 w-11 items-center justify-center rounded-full bg-[#8E9E6E]"
            >
              <Ionicons name="mic" size={21} color="white" />
            </TouchableOpacity>
          </View>
        </AnimatedBlock>

        <AnimatedBlock
          variant="hero"
          delay={90}
          className="mx-6 mb-7 rounded-[32px] bg-[#8E9E6E] p-6"
        >
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!firstLesson}
            onPress={() =>
              openPractice(firstLesson?._id, firstLesson?.techniques?.[0])
            }
          >
            <View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Ionicons name="sparkles" size={24} color="white" />
            </View>
            <Text
              className="text-lg font-bold text-white"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Luyện tập nhanh
            </Text>
            <Text className="mt-2 text-sm leading-5 text-white/75">
              Mở bài luyện đầu tiên và nhận phản hồi cao độ từ AI ngay lập tức.
            </Text>
            <View className="mt-5 flex-row items-center self-start rounded-full bg-white px-4 py-2.5">
              <Text className="mr-2 text-xs font-bold text-[#687451]">
                Bắt đầu luyện
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#687451" />
            </View>
          </TouchableOpacity>
        </AnimatedBlock>

        <AnimatedBlock variant="panel" delay={150} className="px-6">
          <Text
            className="mb-4 text-base font-bold text-charcoal"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Chọn nội dung luyện tập
          </Text>

          {isLoading ? (
            <ActivityIndicator color="#8E9E6E" size="large" className="py-16" />
          ) : orderedLessons.length > 0 ? (
            <View className="gap-4">
              {orderedLessons.map((lesson, index) => {
                const note = lesson.techniques?.[0] || "A4";

                return (
                  <AnimatedBlock
                    key={lesson._id}
                    variant="card"
                    delay={190 + index * 45}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => openPractice(lesson._id, note)}
                      className="flex-row items-center rounded-[28px] border border-[#D6DDC6]/50 bg-white p-5"
                    >
                      <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-[#E2E8D3]">
                        <MaterialCommunityIcons
                          name="music-note-eighth"
                          size={24}
                          color="#687451"
                        />
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text className="text-[11px] font-bold uppercase text-[#8E9E6E]">
                          Bài luyện {String(index + 1).padStart(2, "0")}
                        </Text>
                        <Text
                          numberOfLines={2}
                          className="mt-1 text-sm font-bold leading-5 text-charcoal"
                          style={{ fontFamily: "BeVietnamPro-Medium" }}
                        >
                          {lesson.title}
                        </Text>
                        <Text className="mt-1 text-xs text-charcoal/50">
                          {Math.max(1, Math.ceil(lesson.duration / 60))} phút ·{" "}
                          {note}
                        </Text>
                      </View>
                      <View className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-[#FFF9E6]">
                        <Ionicons name="arrow-forward" size={18} color="#8E9E6E" />
                      </View>
                    </TouchableOpacity>
                  </AnimatedBlock>
                );
              })}
            </View>
          ) : (
            <View className="items-center rounded-[28px] bg-white px-6 py-14">
              <Ionicons name="musical-notes-outline" size={30} color="#8E9E6E" />
              <Text className="mt-3 text-center text-sm font-bold text-charcoal">
                Chưa có bài luyện tập
              </Text>
            </View>
          )}
        </AnimatedBlock>
      </ScrollView>
    </SafeScreen>
  );
}
