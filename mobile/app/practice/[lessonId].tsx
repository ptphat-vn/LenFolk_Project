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
import { getLessonById } from "@/constants/lessons";
import { useBasicAnalysis } from "@/hooks/ai-analytic/use-basic";
import type { AnalysisResult } from "@/types/ai-analysis.type";

type DisplayMetric = {
  label: string;
  value: string;
};

const preferredLabels: Record<string, string> = {
  note: "Nốt nhận diện",
  detected_note: "Nốt nhận diện",
  pitch: "Cao độ",
  frequency: "Tần số",
  confidence: "Độ tin cậy",
  score: "Điểm",
  duration: "Thời lượng",
  stability: "Độ ổn định",
  feedback: "Nhận xét",
  llm_feedback: "Gợi ý từ AI",
  message: "Kết luận",
};

const formatKey = (key: string) =>
  preferredLabels[key.toLowerCase()] ??
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatValue = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
};

const getDisplayMetrics = (result?: AnalysisResult): DisplayMetric[] => {
  if (!result) return [];

  const source =
    typeof result.result === "object" && result.result !== null
      ? (result.result as Record<string, unknown>)
      : result;

  return Object.entries(source)
    .filter(([, value]) => value !== null && value !== undefined)
    .slice(0, 10)
    .map(([key, value]) => ({
      label: formatKey(key),
      value: formatValue(value),
    }));
};

export default function NotePracticeScreen() {
  const router = useRouter();
  const { lessonId, note } = useLocalSearchParams<{
    lessonId: string;
    note?: string;
  }>();
  const lesson = getLessonById(lessonId);
  const targetNote = note || lesson?.targetNote || "A4";
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const analysis = useBasicAnalysis<AnalysisResult>();
  const [recordingUri, setRecordingUri] = useState<string>();
  const [permissionGranted, setPermissionGranted] = useState<boolean>();

  const metrics = useMemo(
    () => getDisplayMetrics(analysis.data),
    [analysis.data],
  );

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

    analysis.mutate({
      file: {
        uri: recordingUri,
        name: `note-${targetNote}-${Date.now()}.m4a`,
        type: "audio/mp4",
      },
      message: `Phân tích nốt sáo người học vừa thổi. Nốt mục tiêu là ${targetNote}. Hãy nhận xét ngắn gọn bằng tiếng Việt về cao độ, độ ổn định và cách cải thiện.`,
      maxDurationSec: 50,
      useLlm: true,
    });
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
              {analysis.error instanceof Error
                ? analysis.error.message
                : "Vui lòng kiểm tra kết nối và thử lại."}
            </Text>
          </View>
        )}

        {analysis.isSuccess && (
          <View className="gap-4 rounded-[28px] bg-white p-6">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E2E8D3]">
                <Ionicons name="sparkles" size={20} color="#687451" />
              </View>
              <View>
                <Text selectable className="text-base font-bold text-[#10120C]">
                  Kết quả phân tích
                </Text>
                <Text selectable className="text-xs text-[#777B70]">
                  Basic analytic · LLM đã bật
                </Text>
              </View>
            </View>

            {metrics.length > 0 ? (
              metrics.map((metric) => (
                <View
                  key={metric.label}
                  className="gap-1 rounded-2xl bg-[#F7F8F3] px-4 py-3"
                >
                  <Text selectable className="text-xs font-bold text-[#8E9E6E]">
                    {metric.label}
                  </Text>
                  <Text selectable className="text-sm leading-6 text-[#34372F]">
                    {metric.value}
                  </Text>
                </View>
              ))
            ) : (
              <Text selectable className="text-sm text-[#777B70]">
                AI đã xử lý bản ghi nhưng không trả về chỉ số hiển thị.
              </Text>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startRecording}
              className="flex-row items-center justify-center gap-2 rounded-full border border-[#D6DDC6] py-3"
            >
              <Ionicons name="refresh" size={18} color="#687451" />
              <Text className="font-bold text-[#687451]">Ghi lại nốt khác</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
