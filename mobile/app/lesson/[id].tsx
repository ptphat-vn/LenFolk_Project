import React from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import YoutubePlayer from "react-native-youtube-iframe";

import SafeScreen from "@/components/SafeScreen";
import { lessons as allLessons } from "@/constants/lessons";
import { useGetDetailLesson } from "@/hooks/lesson/use-get-detail-lesson";
import { useGetCourses } from "@/hooks/course/use-get-courses";
import { useGetProgressList } from "@/hooks/progress/use-get-progress-list";
import { useCreateProgress } from "@/hooks/progress/use-create-progress";
import { useUpdateProgress } from "@/hooks/progress/use-update-progress";
import { getNoteLabel } from "@/constants/practice-notes";

function getYoutubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: dbLesson, isLoading: lessonLoading } = useGetDetailLesson(id || "");
  const { data: courses } = useGetCourses();
  const { data: progressList, isLoading: progressLoading } = useGetProgressList();
  const createProgress = useCreateProgress();
  const updateProgress = useUpdateProgress();
  const trackedLessonRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (!dbLesson || progressLoading || trackedLessonRef.current === dbLesson._id) {
      return;
    }

    trackedLessonRef.current = dbLesson._id;
    const existing = progressList?.find((item) => item.lessonId === dbLesson._id);
    const lastAccessedAt = new Date().toISOString();

    if (existing) {
      if (existing.status !== "completed") {
        updateProgress.mutate({
          id: existing._id,
          status: "in_progress",
          completionPercent: Math.max(existing.completionPercent, 5),
          lastAccessedAt,
        });
      }
      return;
    }

    createProgress.mutate({
      courseId: dbLesson.courseId,
      lessonId: dbLesson._id,
      status: "in_progress",
      completionPercent: 5,
      lastAccessedAt,
    });
  }, [createProgress, dbLesson, progressList, progressLoading, updateProgress]);

  const lesson = React.useMemo(() => {
    if (!dbLesson) return null;
    const course = courses?.find((c) => c._id === dbLesson.courseId);
    const category = course
      ? course.level === "beginner"
        ? "Cơ bản"
        : course.level === "intermediate"
        ? "Trung cấp"
        : "Nâng cao"
      : "Cơ bản";
    const mockLesson = allLessons.find((l) => String(l.id) === id || l.title === dbLesson.title);

    const minutes = Math.floor(dbLesson.duration / 60);
    const seconds = dbLesson.duration % 60;
    const duration = `${minutes}:${String(seconds).padStart(2, "0")}`;

    return {
      id: dbLesson._id,
      title: dbLesson.title,
      category,
      duration,
      objective: dbLesson.description || mockLesson?.objective || "Nhận biết tư thế cầm sáo và vị trí đặt môi đúng.",
      theory: dbLesson.techniques?.length ? dbLesson.techniques : (mockLesson?.theory || ["Thực hành đúng kỹ thuật", "Luyện hơi đều đặn"]),
      targetNote: mockLesson?.targetNote || dbLesson.techniques?.[0] || "A",
      practiceTip: mockLesson?.practiceTip || "Giữ nốt ổn định trong 3 đến 5 giây.",
      videoUrl: dbLesson.videoUrl || null,
    };
  }, [dbLesson, courses, id]);

  const youtubeVideoId = React.useMemo(() => {
    return getYoutubeVideoId(lesson?.videoUrl);
  }, [lesson?.videoUrl]);

  const player = useVideoPlayer(null, (player) => {
    player.loop = false;
  });

  React.useEffect(() => {
    if (lesson?.videoUrl && !youtubeVideoId) {
      player.replaceAsync(lesson.videoUrl);
    }
  }, [lesson?.videoUrl, youtubeVideoId, player]);

  if (lessonLoading) {
    return (
      <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
        <Stack.Screen options={{ title: "Bài học" }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8E9E6E" />
        </View>
      </SafeScreen>
    );
  }

  if (!lesson) {
    return (
      <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
        <Stack.Screen options={{ title: "Bài học" }} />
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#8E9E6E" />
          <Text selectable className="text-lg font-bold text-[#10120C]">
            Không tìm thấy bài học
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-full bg-[#8E9E6E] px-6 py-3"
          >
            <Text className="font-bold text-white">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <Stack.Screen options={{ title: lesson.title, headerShown: false }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 48, gap: 20 }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>
          <View className="rounded-full bg-[#E2E8D3] px-4 py-2">
            <Text selectable className="text-xs font-bold text-[#687451]">
              {lesson.category} · {lesson.duration}
            </Text>
          </View>
        </View>

        {/* --- VIDEO PLAYER --- */}
        {youtubeVideoId ? (
          <View className="overflow-hidden rounded-[28px] bg-black w-full shadow-sm">
            <YoutubePlayer
              height={200}
              play={false}
              videoId={youtubeVideoId}
            />
          </View>
        ) : (
          lesson.videoUrl && (
            <View className="overflow-hidden rounded-[28px] bg-black aspect-[16/9] w-full shadow-sm">
              <VideoView
                style={{ width: "100%", height: "100%" }}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
              />
            </View>
          )
        )}

        <View className="gap-4 rounded-[30px] bg-[#8E9E6E] p-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/90">
            <Ionicons name="book-outline" size={28} color="#8E9E6E" />
          </View>
          <Text
            selectable
            className="text-2xl font-bold leading-8 text-white"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            {lesson.title}
          </Text>
          <Text selectable className="text-sm leading-6 text-white/90">
            {lesson.objective}
          </Text>
        </View>

        <View className="gap-4 rounded-[28px] bg-white p-6">
          <Text
            selectable
            className="text-lg font-bold text-[#10120C]"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Nội dung chính
          </Text>
          {lesson.theory.map((item, index) => (
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

        <View className="gap-3 rounded-[28px] bg-[#F4E0AC] p-6">
          <View className="flex-row items-center gap-3">
            <Ionicons name="musical-note" size={24} color="#7C672D" />
            <Text selectable className="text-base font-bold text-[#4B421F]">
              Bài tập thực hành
            </Text>
          </View>
          <Text selectable className="text-sm leading-6 text-[#5F542D]">
            {lesson.practiceTip}
          </Text>
          <Text selectable className="text-xs font-bold text-[#7C672D]">
            Nốt mục tiêu: {getNoteLabel(lesson.targetNote)}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push(
              {
                pathname: "/practice/[lessonId]",
                params: {
                  lessonId: String(lesson.id),
                  note: lesson.targetNote,
                },
              } as unknown as Href,
            )
          }
          className="flex-row items-center justify-between rounded-[24px] bg-[#10120C] px-6 py-5"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Ionicons name="mic" size={22} color="white" />
            </View>
            <View>
              <Text className="text-base font-bold text-white">Ghi âm nốt thổi</Text>
              <Text className="text-xs text-white/65">AI phân tích cơ bản + LLM</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={22} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}
