import React from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import YoutubePlayer from "react-native-youtube-iframe";

import SafeScreen from "@/components/SafeScreen";
import { lessons as allLessons, lessonHasPractice } from "@/constants/lessons";
import { useGetDetailLesson } from "@/hooks/lesson/use-get-detail-lesson";
import { useGetLessons } from "@/hooks/lesson/use-get-lessons";
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
  const { data: allLessonsData } = useGetLessons();
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
    const mockLesson = allLessons.find(
      (l) =>
        String(l.id) === id ||
        l.title === dbLesson.title ||
        dbLesson.title.includes(`Bài ${l.id}:`),
    );

    const minutes = Math.floor(dbLesson.duration / 60);
    const seconds = dbLesson.duration % 60;
    const duration = `${minutes}:${String(seconds).padStart(2, "0")}`;

    const hasPractice = lessonHasPractice(mockLesson?.id);

    // Bài giới thiệu (không có luyện tập) dùng nội dung cứng ở mobile để đảm bảo
    // hiển thị đúng dù dữ liệu backend còn trống.
    const objective = hasPractice
      ? dbLesson.description || mockLesson?.objective || "Nhận biết tư thế cầm sáo và vị trí đặt môi đúng."
      : mockLesson?.objective || dbLesson.description || "";
    const theory = hasPractice
      ? dbLesson.techniques?.length
        ? dbLesson.techniques
        : mockLesson?.theory || ["Thực hành đúng kỹ thuật", "Luyện hơi đều đặn"]
      : mockLesson?.theory?.length
        ? mockLesson.theory
        : dbLesson.techniques || [];

    return {
      id: dbLesson._id,
      lessonNumber: mockLesson?.id,
      title: dbLesson.title,
      category,
      duration,
      hasPractice,
      objective,
      theory,
      targetNote: mockLesson?.targetNote || dbLesson.techniques?.[0] || "A",
      practiceTip: mockLesson?.practiceTip || "Giữ nốt ổn định trong 3 đến 5 giây.",
      videoUrl: dbLesson.videoUrl || null,
    };
  }, [dbLesson, courses, id]);

  const orderedDbLessons = React.useMemo(
    () => [...(allLessonsData ?? [])].sort((a, b) => a.order - b.order),
    [allLessonsData],
  );
  const nextLesson = React.useMemo(() => {
    if (!dbLesson) return undefined;
    const currentIndex = orderedDbLessons.findIndex(
      (item) => item._id === dbLesson._id,
    );
    return currentIndex >= 0 ? orderedDbLessons[currentIndex + 1] : undefined;
  }, [orderedDbLessons, dbLesson]);

  const currentProgress = React.useMemo(
    () => progressList?.find((item) => item.lessonId === dbLesson?._id),
    [progressList, dbLesson],
  );
  const isCompleted = currentProgress?.status === "completed";

  const markAsCompleted = () => {
    if (!dbLesson || isCompleted || updateProgress.isPending || createProgress.isPending) {
      return;
    }

    const lastAccessedAt = new Date().toISOString();
    const onSuccess = () => {
      Alert.alert("Đã hoàn thành", "Bài học đã được đánh dấu hoàn thành.");
    };

    if (currentProgress) {
      updateProgress.mutate(
        {
          id: currentProgress._id,
          status: "completed",
          completionPercent: 100,
          lastAccessedAt,
        },
        { onSuccess },
      );
    } else {
      createProgress.mutate(
        {
          courseId: dbLesson.courseId,
          lessonId: dbLesson._id,
          status: "completed",
          completionPercent: 100,
          lastAccessedAt,
        },
        { onSuccess },
      );
    }
  };

  // Quay về danh sách bài học chính thay vì lùi từng bài trong ngăn xếp.
  const goToLessons = () => {
    router.replace("/(tabs)/courses");
  };

  const goToNextLesson = () => {
    if (!nextLesson) return;
    // Dùng replace để bài hiện tại không bị xếp chồng trong ngăn xếp — nhờ vậy
    // bấm back từ bài kế tiếp sẽ về thẳng danh sách bài học, không lùi về bài cũ.
    router.replace({
      pathname: "/lesson/[id]",
      params: { id: nextLesson._id },
    } as unknown as Href);
  };

  const isMarkingComplete = updateProgress.isPending || createProgress.isPending;

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
            onPress={goToLessons}
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
        <View className="flex-row items-center justify-between gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goToLessons}
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>
          <View className="min-w-0 flex-1 items-end">
            <View className="max-w-full rounded-full bg-[#E2E8D3] px-4 py-2">
            <Text selectable numberOfLines={1} className="text-xs font-bold text-[#687451]">
              {lesson.category} · {lesson.duration}
            </Text>
            </View>
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
          <View className="flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/90">
              <Ionicons name="book-outline" size={28} color="#8E9E6E" />
            </View>
            <Text
              selectable
              className="min-w-0 flex-1 text-xl font-bold leading-8 text-white"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              {lesson.title}
            </Text>
          </View>
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

        {lesson.hasPractice ? (
          <>
            <View className="gap-3 rounded-[28px] bg-[#F4E0AC] p-6">
              <View className="flex-row items-center gap-3">
                <Ionicons name="musical-note" size={24} color="#7C672D" />
                <Text selectable numberOfLines={2} className="min-w-0 flex-1 text-base font-bold text-[#4B421F]">
                  Bài tập thực hành
                </Text>
              </View>
              <Text selectable className="text-sm leading-6 text-[#5F542D]">
                {lesson.practiceTip}
              </Text>
              {lesson.lessonNumber === 2 ? (
                <Text selectable className="text-xs font-bold text-[#7C672D]">
                  Mục tiêu: tạo được âm sáo rõ
                </Text>
              ) : (
                <Text selectable className="text-xs font-bold text-[#7C672D]">
                  Nốt mục tiêu: {getNoteLabel(lesson.targetNote)}
                </Text>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push(
                  {
                    pathname: "/practice/[lessonId]",
                    params: {
                      lessonId: String(lesson.id),
                      lessonNumber: lesson.lessonNumber ? String(lesson.lessonNumber) : undefined,
                      note: lesson.targetNote,
                    },
                  } as unknown as Href,
                )
              }
              className="flex-row items-center justify-between rounded-[24px] bg-[#10120C] px-6 py-5"
            >
              <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <Ionicons name="mic" size={22} color="white" />
                </View>
                <View className="min-w-0 flex-1">
                  <Text numberOfLines={1} className="text-base font-bold text-white">
                    {lesson.lessonNumber === 2 ? "Ghi âm tiếng sáo" : "Ghi âm nốt thổi"}
                  </Text>
                  <Text numberOfLines={1} className="text-xs text-white/65">
                    {lesson.lessonNumber === 2
                      ? "AI kiểm tra âm sáo rõ hay chưa"
                      : "AI phân tích cơ bản + LLM"}
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={22} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <View className="flex-row items-center gap-3 rounded-[28px] bg-[#E8EFDD] p-6">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white/70">
              <Ionicons name="book-outline" size={22} color="#687451" />
            </View>
            <Text selectable className="min-w-0 flex-1 text-sm leading-6 text-[#4A533B]">
              Đây là bài giới thiệu, chỉ cần đọc và làm quen với cây sáo — chưa có
              phần ghi âm luyện tập. Hãy chuyển sang các bài sau để bắt đầu luyện
              thổi cùng AI.
            </Text>
          </View>
        )}

        {/* --- HOÀN THÀNH & BÀI TIẾP THEO --- */}
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={isCompleted || isMarkingComplete}
          onPress={markAsCompleted}
          className={`flex-row items-center justify-center gap-3 rounded-[24px] px-6 py-5 ${
            isCompleted ? "bg-[#E2E8D3]" : "bg-[#8E9E6E]"
          }`}
        >
          {isMarkingComplete ? (
            <ActivityIndicator color={isCompleted ? "#687451" : "white"} />
          ) : (
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
              size={22}
              color={isCompleted ? "#687451" : "white"}
            />
          )}
          <Text
            className={`text-base font-bold ${
              isCompleted ? "text-[#687451]" : "text-white"
            }`}
          >
            {isCompleted ? "Đã hoàn thành" : "Đánh dấu đã hoàn thành"}
          </Text>
        </TouchableOpacity>

        {nextLesson && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={goToNextLesson}
            className="flex-row items-center justify-between rounded-[24px] border border-[#D6DDC6] bg-white px-6 py-5"
          >
            <View className="min-w-0 flex-1 pr-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
                Bài tiếp theo
              </Text>
              <Text
                numberOfLines={1}
                className="mt-1 text-base font-bold text-[#10120C]"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                {nextLesson.title}
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-[#8E9E6E]">
              <Ionicons name="arrow-forward" size={22} color="white" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
