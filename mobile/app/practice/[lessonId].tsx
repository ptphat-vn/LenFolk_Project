import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import SafeScreen from "@/components/SafeScreen";
import { lessons as allLessons } from "@/constants/lessons";
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
      targetNote: mockLesson?.targetNote || dbLesson.techniques?.[0] || "A4",
    };
  }, [dbLesson, mockLesson]);

  const createSession = useCreatePracticeSession();

  const targetNote = note || lesson?.targetNote || mockLesson?.targetNote || "A4";
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const basicAnalysis = useBasicAnalysis<AnalysisResult>();
  const advancedAnalysis = useAdvancedAnalysis<AnalysisResult>();
  const hasAdvancedAccess = freshUser?.isSubscribed ?? user?.isSubscribed ?? false;
  const analysis = hasAdvancedAccess ? advancedAnalysis : basicAnalysis;
  const [recordingUri, setRecordingUri] = useState<string>();
  const [permissionGranted, setPermissionGranted] = useState<boolean>();

  useEffect(() => {
    if (freshUser) {
      updateUser(freshUser);
    }
  }, [freshUser, updateUser]);

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

  const startRecording = async () => {
    if (!permissionGranted) {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      setPermissionGranted(permission.granted);
      if (!permission.granted) {
        Alert.alert(
          "Cần quyền micro",
          "Hãy cấp quyền micro để ghi âm nốt thổi.",
        );
        return;
      }
    }

    analysis.reset();
    setRecordingUri(undefined);
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecording = async () => {
    await recorder.stop();
    if (recorder.uri) {
      setRecordingUri(recorder.uri);
    }
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    });
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
        message: `Phân tích nốt sáo người học vừa thổi. Nốt mục tiêu là ${targetNote}. Hãy nhận xét ngắn gọn bằng tiếng Việt về cao độ, độ ổn định và cách cải thiện.`,
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
          <Text
            selectable
            className="text-lg font-bold text-[#10120C]"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            Phân tích nốt thổi
          </Text>
          <View className="h-11 w-11" />
        </View>

        <View className="items-center gap-3 rounded-[32px] bg-[#8E9E6E] px-6 py-8">
          <View className="rounded-full bg-white/20 px-3 py-1">
            <Text className="text-[11px] font-bold text-white">
              {hasAdvancedAccess ? "AI ADVANCED · GÓI NÂNG CAO" : "AI BASIC · GÓI CƠ BẢN"}
            </Text>
          </View>
          <Text selectable className="text-sm font-bold text-white/75">
            NỐT MỤC TIÊU
          </Text>
          <Text
            selectable
            className="text-6xl font-bold text-white"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            {targetNote}
          </Text>
          <Text selectable className="text-center text-sm leading-6 text-white/85">
            Giữ nốt đều từ 3 đến 6 giây, đặt điện thoại cách sáo khoảng 30 cm.
          </Text>
        </View>

        <View className="items-center gap-5 rounded-[30px] bg-white p-7">
          <View className="h-6 flex-row items-end gap-1">
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

          <Text
            selectable
            className="text-3xl font-bold text-[#10120C]"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            00:{String(durationSeconds).padStart(2, "0")}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={analysis.isPending}
            onPress={recorderState.isRecording ? stopRecording : startRecording}
            className={`h-24 w-24 items-center justify-center rounded-full ${
              recorderState.isRecording ? "bg-[#D96C5F]" : "bg-[#10120C]"
            }`}
          >
            <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-white/30">
              <Ionicons
                name={recorderState.isRecording ? "stop" : "mic"}
                size={34}
                color="white"
              />
            </View>
          </TouchableOpacity>

          <Text selectable className="text-sm text-[#777B70]">
            {recorderState.isRecording
              ? "Chạm để dừng ghi âm"
              : recordingUri
                ? "Đã ghi âm xong, có thể gửi phân tích"
                : "Chạm để bắt đầu ghi âm"}
          </Text>
        </View>

        {recordingUri && !recorderState.isRecording && (
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={analysis.isPending}
            onPress={analyzeRecording}
            className="flex-row items-center justify-center gap-3 rounded-[22px] bg-[#F4E0AC] px-5 py-5"
          >
            {analysis.isPending ? (
              <ActivityIndicator color="#4B421F" />
            ) : (
              <Ionicons name="sparkles" size={21} color="#4B421F" />
            )}
            <Text className="font-bold text-[#4B421F]">
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
                  onPress={startRecording}
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
                onPress={startRecording}
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
