import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import SafeScreen from "@/components/SafeScreen";
import { lessons as allLessons } from "@/constants/lessons";
import {
  getNoteLabel,
  getRandomPracticeNote,
  PRACTICE_NOTES,
} from "@/constants/practice-notes";
import { useGetDetailLesson } from "@/hooks/lesson/use-get-detail-lesson";
import { useCreatePracticeSession } from "@/hooks/practice-session/use-create-practice-session";
import { useBasicAnalysis } from "@/hooks/ai-analytic/use-basic";
import { useAdvancedAnalysis } from "@/hooks/ai-analytic/use-advanced";
import { useGetMe } from "@/hooks/user/use-get-me";
import { useAuthStore } from "@/store/authStore";
import type { AnalysisResult } from "@/types/ai-analysis.type";

export default function NotePracticeScreen() {
  const router = useRouter();
  const { lessonId, note } = useLocalSearchParams<{
    lessonId: string;
    note?: string;
  }>();

  const { data: dbLesson } = useGetDetailLesson(lessonId || "");
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { data: freshUser } = useGetMe();
  const mockLesson = allLessons.find((l) => String(l.id) === lessonId || l.title === dbLesson?.title);

  const lesson = useMemo(() => {
    if (!dbLesson) return null;
    return {
      id: dbLesson._id,
      title: dbLesson.title,
      targetNote: mockLesson?.targetNote || dbLesson.techniques?.[0] || "C4",
    };
  }, [dbLesson, mockLesson]);

  const createSession = useCreatePracticeSession();

  const [targetNote, setTargetNote] = useState(
    note || lesson?.targetNote || mockLesson?.targetNote || "C4",
  );
  const targetNoteLabel = getNoteLabel(targetNote);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const basicAnalysis = useBasicAnalysis<AnalysisResult>();
  const advancedAnalysis = useAdvancedAnalysis<AnalysisResult>();
  const hasAdvancedAccess = freshUser?.isSubscribed ?? user?.isSubscribed ?? false;
  const analysis = hasAdvancedAccess ? advancedAnalysis : basicAnalysis;
  const [recordingUri, setRecordingUri] = useState<string>();
  const [permissionGranted, setPermissionGranted] = useState<boolean>();
  const [isPreparingRecorder, setIsPreparingRecorder] = useState(false);
  const recorderOperationRef = useRef(false);

  useEffect(() => {
    if (freshUser) {
      updateUser(freshUser);
    }
  }, [freshUser, updateUser]);

  useEffect(() => {
    setTargetNote(note || lesson?.targetNote || mockLesson?.targetNote || "C4");
  }, [lesson?.targetNote, mockLesson?.targetNote, note]);

  const parsedData = useMemo(() => {
    if (!analysis.data) return null;
    
    const rawData = analysis.data as Record<string, any>;
    
    let fileInfo: any = null;
    const fileInfoVal = rawData.file_info || rawData["File Info"] || rawData.fileInfo;
    if (fileInfoVal) {
      if (typeof fileInfoVal === "string") {
        try { fileInfo = JSON.parse(fileInfoVal); } catch { fileInfo = null; }
      } else if (typeof fileInfoVal === "object") {
        fileInfo = fileInfoVal;
      }
    }
    
    let summary: any = null;
    const summaryVal = rawData.summary || rawData["Summary"] || rawData.summaryInfo;
    if (summaryVal) {
      if (typeof summaryVal === "string") {
        try { summary = JSON.parse(summaryVal); } catch { summary = null; }
      } else if (typeof summaryVal === "object") {
        summary = summaryVal;
      }
    }
    
    if (!summary && (rawData.score !== undefined || rawData.summary !== undefined)) {
      summary = rawData;
    }
    
    return { fileInfo, summary };
  }, [analysis.data]);

  useEffect(() => {
    const prepareAudio = async () => {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      setPermissionGranted(permission.granted);

      if (permission.granted) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }
    };

    prepareAudio().catch(() => setPermissionGranted(false));
  }, []);

  const configureRecordingSession = async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });
  };

  const prepareRecorderWithRetry = async () => {
    try {
      await configureRecordingSession();
      await recorder.prepareToRecordAsync();
    } catch {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      }).catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await configureRecordingSession();
      await recorder.prepareToRecordAsync();
    }
  };

  const startRecording = async () => {
    if (recorderOperationRef.current || recorderState.isRecording) return;
    if (AppState.currentState !== "active") {
      Alert.alert(
        "Chưa thể bật micro",
        "Hãy mở lại ứng dụng rồi thử ghi âm lần nữa.",
      );
      return;
    }

    recorderOperationRef.current = true;
    setIsPreparingRecorder(true);

    try {
      let hasPermission = permissionGranted === true;
      if (!hasPermission) {
        const permission =
          await AudioModule.requestRecordingPermissionsAsync();
        hasPermission = permission.granted;
        setPermissionGranted(permission.granted);
      }

      if (!hasPermission) {
        Alert.alert(
          "Cần quyền micro",
          "Hãy cấp quyền micro để ghi âm nốt thổi.",
        );
        return;
      }

      analysis.reset();
      setRecordingUri(undefined);
      await prepareRecorderWithRetry();
      recorder.record();
    } catch (error) {
      console.warn("Failed to start audio recording", error);
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      }).catch(() => undefined);
      Alert.alert(
        "Không thể bật micro",
        "Audio đang được ứng dụng khác sử dụng hoặc phiên ghi âm chưa sẵn sàng. Hãy dừng nhạc/cuộc gọi và thử lại.",
      );
    } finally {
      recorderOperationRef.current = false;
      setIsPreparingRecorder(false);
    }
  };

  const stopRecording = async () => {
    if (recorderOperationRef.current || !recorderState.isRecording) return;
    recorderOperationRef.current = true;

    try {
      await recorder.stop();
      if (recorder.uri) {
        setRecordingUri(recorder.uri);
      }
    } catch (error) {
      console.warn("Failed to stop audio recording", error);
      Alert.alert(
        "Không thể dừng ghi âm",
        "Phiên ghi âm gặp sự cố. Vui lòng thử lại.",
      );
    } finally {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      }).catch(() => undefined);
      recorderOperationRef.current = false;
    }
  };

  const selectNote = (pitch: string) => {
    if (recorderState.isRecording || analysis.isPending) return;

    Haptics.selectionAsync().catch(() => undefined);
    analysis.reset();
    setRecordingUri(undefined);
    setTargetNote(pitch);
  };

  const practiceAnotherNote = async () => {
    const alternatives = PRACTICE_NOTES.filter(
      (practiceNote) => practiceNote.pitch !== targetNote,
    );
    const nextNote =
      alternatives[Math.floor(Math.random() * alternatives.length)] ||
      getRandomPracticeNote();

    setTargetNote(nextNote.pitch);
    await startRecording();
  };

  const analyzeRecording = () => {
    if (!recordingUri) return;

    analysis.mutate(
      {
        file: {
          uri: recordingUri,
          name: `note-${targetNote}-${Date.now()}.m4a`,
          type: "audio/mp4",
        },
        message: `Phân tích nốt sáo người học vừa thổi. Nốt mục tiêu là ${targetNote} (${targetNoteLabel}). Hãy nhận xét ngắn gọn bằng tiếng Việt về cao độ, độ ổn định và cách cải thiện.`,
        useLlm: true,
        ...(hasAdvancedAccess ? { fast: false } : {}),
      },
      {
        onSuccess: () => {
          if (lessonId) {
            createSession.mutate({
              lessonId,
              audioFileUrl: recordingUri,
              duration: durationSeconds,
            });
          }
        },
      }
    );
  };

  const durationSeconds = Math.floor((recorderState.durationMillis ?? 0) / 1000);

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <Stack.Screen options={{ title: "Luyện nốt", headerShown: false }} />
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
          <View className="items-center">
            <Text
              selectable
              className="text-lg font-bold text-[#10120C]"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Luyện cao độ
            </Text>
            <Text className="mt-0.5 text-[11px] text-[#8A8D84]">
              {lesson?.title || "Luyện tập cùng AI"}
            </Text>
          </View>
          <View className="h-11 w-11" />
        </View>

        <View className="overflow-hidden rounded-[34px] bg-[#8E9E6E] px-6 pb-7 pt-5">
          <View className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <View className="mb-7 flex-row items-center justify-between">
            <View className="rounded-full bg-white/15 px-3 py-1.5">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-white">
                {hasAdvancedAccess ? "AI nâng cao" : "AI cơ bản"}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="mic-outline" size={15} color="white" />
              <Text className="ml-1.5 text-xs font-semibold text-white/75">
                Giữ 3–6 giây
              </Text>
            </View>
          </View>

          <View className="items-center">
            <Text selectable className="text-xs font-bold uppercase tracking-[2px] text-white/60">
              Nốt mục tiêu
            </Text>
            <Text
              selectable
              className="mt-2 text-6xl font-bold text-white"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              {targetNoteLabel}
            </Text>
            <Text className="mt-1 text-xs font-bold text-white/55">
              {targetNote}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {PRACTICE_NOTES.map((practiceNote) => {
            const isSelected = practiceNote.pitch === targetNote;

            return (
              <TouchableOpacity
                key={practiceNote.pitch}
                activeOpacity={0.8}
            disabled={
              recorderState.isRecording ||
              analysis.isPending ||
              isPreparingRecorder
            }
                onPress={() => selectNote(practiceNote.pitch)}
                className={`min-w-[58px] items-center rounded-2xl border px-3 py-3 ${
                  isSelected
                    ? "border-[#8E9E6E] bg-[#8E9E6E]"
                    : "border-[#E5E7E1] bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    isSelected ? "text-white" : "text-[#687451]"
                  }`}
                >
                  {practiceNote.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="items-center rounded-[30px] bg-white px-7 pb-7 pt-6">
          <View className="mb-5 w-full flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
                Thu âm
              </Text>
              <Text className="mt-1 text-xs text-[#8A8D84]">
                Đặt điện thoại cách sáo khoảng 30 cm
              </Text>
            </View>
            <Text
              selectable
              className="text-2xl font-bold text-[#10120C]"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              00:{String(durationSeconds).padStart(2, "0")}
            </Text>
          </View>

          <View className="mb-6 h-8 flex-row items-center gap-1">
            {[16, 24, 12, 20, 10, 22, 15, 26, 13, 20, 11, 24].map(
              (height, index) => (
                <View
                  key={`${height}-${index}`}
                  className={`w-1.5 rounded-full ${
                    recorderState.isRecording ? "bg-[#D96C5F]" : "bg-[#D6DDC6]"
                  }`}
                  style={{ height }}
                />
              ),
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={analysis.isPending || isPreparingRecorder}
            onPress={recorderState.isRecording ? stopRecording : startRecording}
            className={`h-24 w-24 items-center justify-center rounded-full ${
              recorderState.isRecording ? "bg-[#D96C5F]" : "bg-[#10120C]"
            }`}
          >
            <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-white/25">
              <Ionicons
                name={
                  isPreparingRecorder
                    ? "hourglass-outline"
                    : recorderState.isRecording
                      ? "stop"
                      : "mic"
                }
                size={34}
                color="white"
              />
            </View>
          </TouchableOpacity>

          <Text selectable className="mt-5 text-sm text-[#777B70]">
            {isPreparingRecorder
              ? "Đang chuẩn bị micro..."
              : recorderState.isRecording
              ? "Chạm để dừng ghi âm"
              : recordingUri
                ? "Bản ghi đã sẵn sàng để phân tích"
                : "Chạm micro và bắt đầu thổi"}
          </Text>
        </View>

        {recordingUri && !recorderState.isRecording && (
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={analysis.isPending}
            onPress={analyzeRecording}
            className="flex-row items-center justify-center gap-3 rounded-[22px] bg-[#10120C] px-5 py-5"
          >
            {analysis.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="sparkles" size={21} color="white" />
            )}
            <Text className="font-bold text-white">
              {analysis.isPending
                ? "AI đang phân tích..."
                : hasAdvancedAccess
                  ? "Phân tích nâng cao với AI"
                  : "Phân tích cơ bản với AI"}
            </Text>
          </TouchableOpacity>
        )}

        {analysis.isError && (
          <View className="gap-2 rounded-[24px] border border-[#F0C7C2] bg-[#FFF2F0] p-5">
            <Text selectable className="font-bold text-[#A84236]">
              Không thể phân tích bản ghi
            </Text>
            <Text selectable className="text-sm leading-5 text-[#7C4B46]">
              {analysis.error?.message || "Vui lòng kiểm tra kết nối và thử lại."}
            </Text>
            {__DEV__ && (
              <Text selectable className="text-[10px] text-red-500 font-mono mt-1">
                Debug: {JSON.stringify(analysis.error)}
              </Text>
            )}
          </View>
        )}

        {analysis.isSuccess && (() => {
          const { fileInfo, summary } = parsedData || {};
          
          if (!summary) {
            return (
              <View className="gap-4 rounded-[28px] bg-white p-6">
                <Text className="text-sm font-bold text-[#10120C]">Kết quả gốc:</Text>
                <Text className="text-xs font-mono text-[#777B70]">{JSON.stringify(analysis.data)}</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={practiceAnotherNote}
                  className="flex-row items-center justify-center gap-2 rounded-full border border-[#D6DDC6] py-3 mt-4"
                >
                  <Ionicons name="refresh" size={18} color="#687451" />
                  <Text className="font-bold text-[#687451]">Ghi lại nốt khác</Text>
                </TouchableOpacity>
              </View>
            );
          }
          
          const score = summary.score ?? 0;
          const label = summary.label ?? "Đã phân tích";
          const description = summary.summary ?? "";
          const issues: string[] = summary.issues ?? [];
          const recommendations: string[] = summary.recommendations ?? [];
          
          let scoreBg = "bg-[#E2E8D3]";
          let scoreText = "text-[#687451]";
          if (score < 50) {
            scoreBg = "bg-[#FFF2F0]";
            scoreText = "text-[#A84236]";
          } else if (score < 80) {
            scoreBg = "bg-[#FFF9E6]";
            scoreText = "text-[#7C672D]";
          }

          return (
            <View className="gap-5 rounded-[30px] bg-white p-6 shadow-sm">
              <View className="flex-row items-center gap-3 border-b border-gray-100 pb-4">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E2E8D3]">
                  <Ionicons name="sparkles" size={20} color="#687451" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#10120C]">
                    Kết quả phân tích
                  </Text>
                  <Text className="text-xs text-[#777B70]">
                    {hasAdvancedAccess ? "Advanced AI Analysis" : "Basic AI Analysis"} · Đã tối ưu hiển thị
                  </Text>
                </View>
              </View>

              <View className="items-center py-4 bg-[#F7F8F3] rounded-[24px] gap-2">
                <Text className="text-xs font-bold text-[#8E9E6E] uppercase tracking-wider">ĐIỂM ĐÁNH GIÁ</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-5xl font-black text-[#10120C]">{score}</Text>
                  <Text className="text-lg font-bold text-[#777B70]">/100</Text>
                </View>
                <View className={`px-4 py-1.5 rounded-full ${scoreBg} mt-1`}>
                  <Text className={`text-sm font-bold ${scoreText}`}>{label}</Text>
                </View>
              </View>

              {description ? (
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-[#8E9E6E] uppercase tracking-wider">NHẬN XÉT CHUNG</Text>
                  <Text className="text-sm leading-6 text-[#34372F] text-justify">
                    {description}
                  </Text>
                </View>
              ) : null}

              {issues.length > 0 && (
                <View className="gap-2.5 rounded-[22px] bg-[#FFF2F0] p-5 border border-[#F0C7C2]">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="alert-circle" size={20} color="#A84236" />
                    <Text className="text-sm font-bold text-[#A84236]">Cần cải thiện</Text>
                  </View>
                  <View className="gap-2">
                    {issues.map((issue, idx) => (
                      <View key={idx} className="flex-row gap-2.5">
                        <Text className="text-xs text-[#A84236]">•</Text>
                        <Text className="flex-1 text-xs leading-5 text-[#7C4B46]">{issue}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {recommendations.length > 0 && (
                <View className="gap-2.5 rounded-[22px] bg-[#E2E8D3]/30 p-5 border border-[#C5D0B4]">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="bulb" size={20} color="#687451" />
                    <Text className="text-sm font-bold text-[#687451]">Gợi ý luyện tập</Text>
                  </View>
                  <View className="gap-2">
                    {recommendations.map((rec, idx) => (
                      <View key={idx} className="flex-row gap-2.5">
                        <Text className="text-xs text-[#687451]">•</Text>
                        <Text className="flex-1 text-xs leading-5 text-[#4A533B]">{rec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {fileInfo && (
                <View className="gap-1.5 border-t border-gray-100 pt-4">
                  <Text className="text-[10px] font-bold text-[#8E9E6E] uppercase tracking-wider">Thông tin tệp âm thanh</Text>
                  <Text className="text-[10px] text-[#777B70] leading-4">
                    Thời lượng: {fileInfo.duration?.toFixed(2)} giây · Tốc độ lấy mẫu: {fileInfo.sample_rate} Hz {"\n"}
                    Tên tệp: {fileInfo.original_filename || fileInfo.filename}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={practiceAnotherNote}
                className="flex-row items-center justify-center gap-2 rounded-full bg-[#10120C] py-4 mt-2"
              >
                <Ionicons name="refresh" size={18} color="white" />
                <Text className="font-bold text-white text-sm">Thử lại nốt khác</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
      </ScrollView>
    </SafeScreen>
  );
}
