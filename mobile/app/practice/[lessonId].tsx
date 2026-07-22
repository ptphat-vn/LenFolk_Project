import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  AudioQuality,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  Easing,
  Image as RNImage,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";

import SafeScreen from "@/components/SafeScreen";
import { lessons as allLessons } from "@/constants/lessons";
import { canAccessLesson, getUpgradeMessage } from "@/constants/course-access";
import {
  getNoteLabel,
  getRandomPracticeNote,
  PRACTICE_NOTES,
} from "@/constants/practice-notes";
import { useGetCourses } from "@/hooks/course/use-get-courses";
import { useCurrentSubscription } from "@/hooks/enrollment/use-current-subscription";
import { useGetDetailLesson } from "@/hooks/lesson/use-get-detail-lesson";
import { useCreatePracticeSession } from "@/hooks/practice-session/use-create-practice-session";
import { useGetLessons } from "@/hooks/lesson/use-get-lessons";
import { useGetProgressList } from "@/hooks/progress/use-get-progress-list";
import { useBasicAnalysis } from "@/hooks/ai-analytic/use-basic";
import { useAdvancedAnalysis } from "@/hooks/ai-analytic/use-advanced";
import { useGetMe } from "@/hooks/user/use-get-me";
import { useAuthStore } from "@/store/authStore";
import type { AnalysisResult } from "@/types/ai-analysis.type";

import { getCompactAnalysisResult } from "@/components/practice/lesson-practice/analysis-result";
import {
  getLessonPracticeFlags,
  getPracticeTitle,
  getRecordingTarget,
  getReferencePracticeTracks,
} from "@/components/practice/lesson-practice/lesson-practice-config";
import { LessonEightBasicTunePractice } from "@/components/practice/lesson-practice/LessonEightBasicTunePractice";
import { LessonFiveFingerPractice } from "@/components/practice/lesson-practice/LessonFiveFingerPractice";
import { LessonFourBreathingPractice } from "@/components/practice/lesson-practice/LessonFourBreathingPractice";
import { LessonThreeBasicNotesPractice } from "@/components/practice/lesson-practice/LessonThreeBasicNotesPractice";
import { LessonTwoMouthPlacementPractice } from "@/components/practice/lesson-practice/LessonTwoMouthPlacementPractice";
import {
  basicNotesPracticeImage,
  mouthPlacementPracticeImages,
} from "@/components/practice/lesson-practice/practice-assets";
import type {
  RecordedAudioFile,
  ReferencePracticeTrack,
  ReferenceTrackId,
} from "@/components/practice/lesson-practice/types";

// Preset ghi âm tối ưu cho phân tích sáo: mono, 22.05kHz, 64kbps AAC (giữ .m4a).
// Nhỏ hơn ~1/2 so với HIGH_QUALITY (stereo/44.1kHz/128kbps) → upload nhanh hơn và
// AI xử lý audio nhanh hơn, vẫn đủ âm sắc + cao độ cho nhận diện và chấm điểm.
// KHÔNG dùng RecordingPresets.LOW_QUALITY vì trên Android nó rơi về AMR-NB (codec
// thoại băng hẹp 8kHz, .3gp) làm hỏng âm sắc sáo.
const FLUTE_ANALYSIS_RECORDING = {
  ...RecordingPresets.HIGH_QUALITY,
  sampleRate: 22050,
  numberOfChannels: 1,
  bitRate: 64000,
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    audioQuality: AudioQuality.MEDIUM,
  },
  web: {
    ...RecordingPresets.HIGH_QUALITY.web,
    bitsPerSecond: 64000,
  },
};

const RECORDINGS_DIRECTORY = `${FileSystem.documentDirectory}practice-recordings`;
const MIN_RECORDING_DURATION_MS = 800;
const MIN_RECORDING_FILE_BYTES = 2 * 1024;

// Tập theo vạch chạy (playhead) trong màn xem sheet phóng to.
const GUIDE_BPM_OPTIONS = [60, 80, 100];
// Bỏ qua khoá nhạc / số chỉ nhịp ở đầu mỗi khuông để vạch bám nốt sát hơn.
const SHEET_NOTE_START_FRACTION = 0.08;
const SHEET_NOTE_END_FRACTION = 0.98;
const GUIDE_CARD_PADDING = 12;

// Ước lượng số nốt trên mỗi khuông để tính thời lượng vạch chạy.
const splitNoteLines = (noteSequence: string, lineCount: number): number[] => {
  const clean = (noteSequence ?? "").trim();
  const safeLineCount = Math.max(1, lineCount);

  // Nếu noteSequence xuống dòng và khớp số khuông → mỗi dòng là 1 khuông.
  if (clean.includes("\n")) {
    const perLine = clean
      .split("\n")
      .map((line) => line.trim().split(/[\s,]+/).filter(Boolean).length);
    if (perLine.length === safeLineCount) {
      return perLine.map((count) => Math.max(1, count));
    }
  }

  // Ngược lại: chia đều tổng số nốt cho số khuông.
  const totalNotes = clean.split(/[\s,]+/).filter(Boolean).length || safeLineCount;
  const base = Math.max(1, Math.round(totalNotes / safeLineCount));
  return Array.from({ length: safeLineCount }, (_, index) =>
    index === safeLineCount - 1
      ? Math.max(1, totalNotes - base * (safeLineCount - 1))
      : base,
  );
};

// recorder.stop() có thể trả về trước khi file .m4a được flush xong xuống đĩa.
// Chờ đến khi dung lượng đủ lớn và không còn thay đổi rồi mới dùng file đó.
const waitForRecordedFile = async (uri: string, timeoutMs = 2500) => {
  const startedAt = Date.now();
  let previousSize = -1;

  for (;;) {
    const info = await FileSystem.getInfoAsync(uri).catch(() => null);
    const size =
      info && info.exists && typeof info.size === "number" ? info.size : 0;
    if (
      info?.exists &&
      size >= MIN_RECORDING_FILE_BYTES &&
      size === previousSize
    ) {
      return info;
    }

    previousSize = size;
    if (Date.now() - startedAt >= timeoutMs) return info;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};

const persistRecordedAudio = async (sourceUri: string, fileName: string) => {
  // Web: recorder trả blob: URL, không có documentDirectory — dùng trực tiếp.
  if (Platform.OS === "web" || sourceUri.startsWith("blob:")) {
    return sourceUri;
  }

  if (!FileSystem.documentDirectory) {
    throw new Error("Thiết bị không cung cấp thư mục lưu bản ghi.");
  }

  const sourceInfo = await waitForRecordedFile(sourceUri);
  if (
    !sourceInfo?.exists ||
    typeof sourceInfo.size !== "number" ||
    sourceInfo.size < MIN_RECORDING_FILE_BYTES
  ) {
    throw new Error(
      "Bản ghi chưa hoàn tất hoặc quá ngắn. Hãy ghi âm rõ trong ít nhất 1 giây rồi thử lại.",
    );
  }

  await FileSystem.makeDirectoryAsync(RECORDINGS_DIRECTORY, {
    intermediates: true,
  });
  const destinationUri = `${RECORDINGS_DIRECTORY}/${fileName}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });

  const info = await FileSystem.getInfoAsync(destinationUri);
  if (
    !info.exists ||
    typeof info.size !== "number" ||
    info.size < MIN_RECORDING_FILE_BYTES
  ) {
    // Copy hụt (file nguồn đang được flush dở) — thử lại một lần.
    await FileSystem.deleteAsync(destinationUri, { idempotent: true }).catch(
      () => undefined,
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });
    const retryInfo = await FileSystem.getInfoAsync(destinationUri);
    if (
      !retryInfo.exists ||
      typeof retryInfo.size !== "number" ||
      retryInfo.size < MIN_RECORDING_FILE_BYTES
    ) {
      throw new Error("Bản ghi vừa lưu bị rỗng hoặc không thể đọc lại.");
    }
  }

  return destinationUri;
};

export default function NotePracticeScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { lessonId, lessonNumber, note, practiceMode, exercise } = useLocalSearchParams<{
    lessonId: string;
    lessonNumber?: string;
    note?: string;
    practiceMode?: "note" | "lesson";
    exercise?: ReferenceTrackId;
  }>();

  const { data: dbLesson } = useGetDetailLesson(lessonId || "");
  const { data: allLessonsData } = useGetLessons();
  const { data: progressList } = useGetProgressList();
  const { data: courses, isLoading: coursesLoading } = useGetCourses();
  const {
    hasPremiumAccess,
    isLoading: subscriptionLoading,
  } = useCurrentSubscription();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { data: freshUser } = useGetMe();
  const mockLesson = allLessons.find(
    (l) =>
      String(l.id) === lessonId ||
      l.title === dbLesson?.title ||
      dbLesson?.title?.includes(`Bài ${l.id}:`),
  );
  const lessonTitle = dbLesson?.title || mockLesson?.title || "";
  const lessonCourse = useMemo(
    () => courses?.find((course) => course._id === dbLesson?.courseId),
    [courses, dbLesson?.courseId],
  );
  const isLessonLocked =
    Boolean(dbLesson && courses) &&
    !canAccessLesson(dbLesson, lessonCourse, hasPremiumAccess);
  const previousLesson = useMemo(() => {
    if (!dbLesson) return undefined;
    const ordered = [...(allLessonsData ?? [])].sort((a, b) => a.order - b.order);
    const currentIndex = ordered.findIndex((item) => item._id === dbLesson._id);
    return currentIndex > 0 ? ordered[currentIndex - 1] : undefined;
  }, [allLessonsData, dbLesson]);
  const previousProgress = useMemo(
    () => progressList?.find((item) => item.lessonId === previousLesson?._id),
    [previousLesson?._id, progressList],
  );
  const isPrerequisiteLocked =
    Boolean(previousLesson) && previousProgress?.status !== "completed";
  const isNotePracticeMode = practiceMode === "note";
  const practiceFlags = getLessonPracticeFlags({
    isNotePracticeMode,
    lessonNumber,
    lessonTitle,
    mockLesson,
  });
  const {
    isMouthPlacementLesson,
    isBasicNotesLesson,
    isBreathingLesson,
    isFingerPracticeLesson,
    isBasicTuneLesson,
    isReferencePracticeLesson,
    isCompactReferenceSheetLesson,
  } = practiceFlags;

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
  const recorder = useAudioRecorder(FLUTE_ANALYSIS_RECORDING);
  const recorderState = useAudioRecorderState(recorder);
  const playbackPlayer = useAudioPlayer(undefined, { updateInterval: 250 });
  const playbackStatus = useAudioPlayerStatus(playbackPlayer);
  const referencePlayer = useAudioPlayer(undefined, { updateInterval: 100 });
  const referenceStatus = useAudioPlayerStatus(referencePlayer);
  const basicAnalysis = useBasicAnalysis<AnalysisResult>();
  const advancedAnalysis = useAdvancedAnalysis<AnalysisResult>();
  const hasAdvancedAccess = freshUser?.isSubscribed ?? user?.isSubscribed ?? false;
  const analysis = hasAdvancedAccess ? advancedAnalysis : basicAnalysis;
  const [recordingUri, setRecordingUri] = useState<string>();
  const [recordedFiles, setRecordedFiles] = useState<RecordedAudioFile[]>([]);
  const [playingUri, setPlayingUri] = useState<string>();
  const [pendingPlaybackUri, setPendingPlaybackUri] = useState<string>();
  const [playingReferenceTrackId, setPlayingReferenceTrackId] =
    useState<ReferenceTrackId>();
  const [pendingReferenceTrackId, setPendingReferenceTrackId] =
    useState<ReferenceTrackId>();
  const [selectedReferenceTrackId, setSelectedReferenceTrackId] =
    useState<ReferenceTrackId>(
      exercise === "4.2" ||
        exercise === "5.1" ||
        exercise === "5.2" ||
        exercise === "8"
        ? exercise
        : "4.1",
    );
  const [permissionGranted, setPermissionGranted] = useState<boolean>();
  const [isPreparingRecorder, setIsPreparingRecorder] = useState(false);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [selectedPracticeImageIndex, setSelectedPracticeImageIndex] =
    useState<number | null>(null);
  const [isBasicNotesImageVisible, setIsBasicNotesImageVisible] =
    useState(false);
  const [isReferenceSheetViewerVisible, setIsReferenceSheetViewerVisible] =
    useState(false);
  const imageViewerTranslateY = useRef(new Animated.Value(0)).current;
  const recorderOperationRef = useRef(false);
  const recordingStartedAtRef = useRef<number | undefined>(undefined);
  const playbackStartedAtRef = useRef(0);
  const referenceStartedAtRef = useRef(0);

  // --- Tập theo vạch chạy (playhead) ---
  const [guideBpm, setGuideBpm] = useState(80);
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [guideCountdown, setGuideCountdown] = useState<number | null>(null);
  const [guideLineIndex, setGuideLineIndex] = useState(0);
  const guidePlayhead = useRef(new Animated.Value(0)).current;
  const guideScrollRef = useRef<ScrollView | null>(null);
  const guideTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const guideListenerRef = useRef<string | null>(null);

  const practiceTitle = getPracticeTitle(practiceFlags);
  const {
    title: recordingTargetTitle,
    label: recordingTargetLabel,
    detail: recordingTargetDetail,
  } = getRecordingTarget(practiceFlags, targetNote, targetNoteLabel);
  const referencePracticeTracks = getReferencePracticeTracks(practiceFlags);
  const selectedReferenceTrack = useMemo(
    () =>
      referencePracticeTracks.find(
        (track) => track.id === selectedReferenceTrackId,
      ) || referencePracticeTracks[0],
    [referencePracticeTracks, selectedReferenceTrackId],
  );
  const selectedReferenceTrackIsPlaying =
    playingReferenceTrackId === selectedReferenceTrack.id &&
    referenceStatus.playing;
  // Trên iPad, nội dung bị giới hạn 700px nên bề rộng card sheet cũng clamp theo.
  const contentWidth = Math.min(windowWidth, 700);
  const referenceSheetCardWidth = isCompactReferenceSheetLesson
    ? Math.max(contentWidth - 132, 230)
    : 620;
  const referenceSheetCardImageWidth = isCompactReferenceSheetLesson
    ? referenceSheetCardWidth - 24
    : referenceSheetCardWidth;
  const referenceSheetCardHeight = isCompactReferenceSheetLesson ? 56 : 88;
  // Tỉ lệ khung hình thật của từng khuông nhạc để phóng to không bị méo/viền thừa.
  const sheetAspectRatios = useMemo(
    () =>
      selectedReferenceTrack.sheets.map((sheet) => {
        const source = RNImage.resolveAssetSource(sheet);
        return source?.width && source?.height
          ? source.width / source.height
          : 5;
      }),
    [selectedReferenceTrack],
  );
  // Khuông cao hơn hẳn để nốt to, dễ đọc; phần dư theo chiều ngang sẽ cuộn được.
  const referenceSheetViewerHeight = Math.min(
    isCompactReferenceSheetLesson ? 170 : 220,
    Math.max(
      isCompactReferenceSheetLesson ? 120 : 150,
      (windowHeight - 260) / selectedReferenceTrack.sheets.length,
    ),
  );
  // Số nốt ước lượng trên mỗi khuông để tính thời lượng vạch chạy theo BPM.
  const guideNotesPerLine = useMemo(
    () =>
      splitNoteLines(
        selectedReferenceTrack.noteSequence,
        selectedReferenceTrack.sheets.length,
      ),
    [selectedReferenceTrack],
  );
  // Chiều rộng thực (px) của khuông đang chạy để đặt vạch và tự cuộn.
  const guideLineWidth =
    referenceSheetViewerHeight * (sheetAspectRatios[guideLineIndex] ?? 5);

  useEffect(() => {
    if (freshUser) {
      updateUser(freshUser);
    }
  }, [freshUser, updateUser]);

  useEffect(() => {
    if (
      exercise === "4.1" ||
      exercise === "4.2" ||
      exercise === "5.1" ||
      exercise === "5.2" ||
      exercise === "8"
    ) {
      setSelectedReferenceTrackId(exercise);
    }
  }, [exercise]);

  useEffect(() => {
    if (
      isReferencePracticeLesson &&
      !referencePracticeTracks.some((track) => track.id === selectedReferenceTrackId)
    ) {
      setSelectedReferenceTrackId(referencePracticeTracks[0].id);
    }
  }, [
    isReferencePracticeLesson,
    referencePracticeTracks,
    selectedReferenceTrackId,
  ]);

  useEffect(() => {
    setTargetNote(note || lesson?.targetNote || mockLesson?.targetNote || "C4");
  }, [lesson?.targetNote, mockLesson?.targetNote, note]);

  const compactResult = useMemo(
    () => getCompactAnalysisResult(analysis.data),
    [analysis.data],
  );

  // Backend trả code NON_FLUTE_AUDIO khi bản ghi không phải tiếng sáo
  // (giọng nói, tạp âm, im lặng...) để hiển thị thông báo phù hợp thay vì lỗi hệ thống.
  const isNonFluteError =
    (analysis.error as (Error & { code?: string }) | null)?.code ===
    "NON_FLUTE_AUDIO";

  useEffect(() => {
    if (analysis.isSuccess) {
      setIsResultModalVisible(true);
    }
  }, [analysis.isSuccess]);

  const closePracticeImageViewer = useCallback(() => {
    imageViewerTranslateY.setValue(0);
    setSelectedPracticeImageIndex(null);
    setIsBasicNotesImageVisible(false);
    setIsReferenceSheetViewerVisible(false);
  }, [imageViewerTranslateY]);

  const imageViewerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 12 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          imageViewerTranslateY.setValue(Math.max(gestureState.dy, 0));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 90 || gestureState.vy > 1.1) {
            closePracticeImageViewer();
            return;
          }

          Animated.spring(imageViewerTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [closePracticeImageViewer, imageViewerTranslateY],
  );

  useEffect(() => {
    if (
      playingUri &&
      playbackStatus.didJustFinish &&
      Date.now() - playbackStartedAtRef.current > 600
    ) {
      setPlayingUri(undefined);
    }
  }, [playbackStatus.didJustFinish, playingUri]);

  useEffect(() => {
    if (
      playingReferenceTrackId &&
      referenceStatus.didJustFinish &&
      Date.now() - referenceStartedAtRef.current > 600
    ) {
      setPlayingReferenceTrackId(undefined);
      setPendingReferenceTrackId(undefined);
    }
  }, [playingReferenceTrackId, referenceStatus.didJustFinish]);

  useEffect(() => {
    if (!pendingPlaybackUri || pendingPlaybackUri !== playingUri) return;
    if (!playbackStatus.isLoaded || playbackStatus.isBuffering) return;

    playbackPlayer.play();
    setPendingPlaybackUri(undefined);
  }, [
    pendingPlaybackUri,
    playbackPlayer,
    playbackStatus.isBuffering,
    playbackStatus.isLoaded,
    playingUri,
  ]);

  useEffect(() => {
    if (
      !pendingReferenceTrackId ||
      pendingReferenceTrackId !== playingReferenceTrackId
    ) {
      return;
    }
    if (!referenceStatus.isLoaded || referenceStatus.isBuffering) return;

    referencePlayer.seekTo(0).catch(() => undefined);
    referencePlayer.play();
    setPendingReferenceTrackId(undefined);
  }, [
    pendingReferenceTrackId,
    playingReferenceTrackId,
    referencePlayer,
    referenceStatus.isBuffering,
    referenceStatus.isLoaded,
  ]);

  const selectedRecordedFile = useMemo(
    () => recordedFiles.find((file) => file.uri === recordingUri),
    [recordedFiles, recordingUri],
  );

  useEffect(() => {
    if (isLessonLocked || isPrerequisiteLocked) return;

    const prepareAudio = async () => {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      setPermissionGranted(permission.granted);

      if (permission.granted) {
        // Do not keep the iOS microphone session open just because this screen
        // is visible. Besides the orange privacy indicator, a stale
        // play-and-record session can prevent the next recorder preparation in
        // a standalone/TestFlight build.
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
          shouldRouteThroughEarpiece: false,
        });
      }
    };

    prepareAudio().catch(() => setPermissionGranted(false));

    return () => {
      // `allowsRecording: false` releases the AVAudioSession input. This makes
      // the iOS orange microphone indicator disappear after leaving practice
      // and prevents this screen from retaining the mic across navigation.
      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
        shouldRouteThroughEarpiece: false,
      }).catch(() => undefined);
    };
  }, [isLessonLocked, isPrerequisiteLocked]);

  const configureRecordingSession = async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });
  };

  const configurePlaybackSession = async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
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

  const stopPlayback = async () => {
    playbackPlayer.pause();
    await playbackPlayer.seekTo(0).catch(() => undefined);
    setPendingPlaybackUri(undefined);
    setPlayingUri(undefined);
  };

  const stopReferencePlayback = async () => {
    referencePlayer.pause();
    await referencePlayer.seekTo(0).catch(() => undefined);
    setPendingReferenceTrackId(undefined);
    setPlayingReferenceTrackId(undefined);
  };

  const selectReferenceTrackPage = async (
    trackId: ReferenceTrackId,
  ) => {
    if (trackId === selectedReferenceTrackId) return;
    if (recorderState.isRecording || analysis.isPending) return;

    Haptics.selectionAsync().catch(() => undefined);
    await stopPlayback();
    await stopReferencePlayback();
    analysis.reset();
    setIsResultModalVisible(false);
    setRecordingUri(undefined);
    setRecordedFiles([]);
    setSelectedReferenceTrackId(trackId);
  };

  const startRecording = async () => {
    if (isPrerequisiteLocked) {
      Alert.alert(
        "Chưa thể luyện bài này",
        `Bạn cần đánh dấu hoàn thành "${previousLesson?.title}" trước khi tiếp tục.`,
      );
      return;
    }

    if (isLessonLocked) {
      Alert.alert("Cần mở gói Technique", getUpgradeMessage(lessonTitle), [
        { text: "Để sau", style: "cancel" },
        {
          text: "Mở gói",
          onPress: () => router.push("/profile/subscription"),
        },
      ]);
      return;
    }

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

      await stopPlayback();
      await stopReferencePlayback();
      analysis.reset();
      setIsResultModalVisible(false);
      setRecordingUri(undefined);
      await prepareRecorderWithRetry();
      recorder.record();
      recordingStartedAtRef.current = Date.now();
    } catch (error) {
      console.warn("Failed to start audio recording", error);
      await configurePlaybackSession().catch(() => undefined);
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
      const durationBeforeStoppingMs = Math.max(
        recorder.getStatus().durationMillis,
        Date.now() - (recordingStartedAtRef.current ?? Date.now()),
      );
      if (durationBeforeStoppingMs < MIN_RECORDING_DURATION_MS) {
        throw new Error("Bản ghi quá ngắn để tạo file âm thanh hợp lệ.");
      }

      await recorder.stop();
      const sourceUri = recorder.uri ?? recorder.getStatus().url;
      if (sourceUri) {
        const createdAt = Date.now();
        const fileName = isMouthPlacementLesson
          ? `flute-sound-${createdAt}.m4a`
          : `note-${targetNote}-${createdAt}.m4a`;
        const stableUri = await persistRecordedAudio(sourceUri, fileName);
        const recordedFile: RecordedAudioFile = {
          uri: stableUri,
          name: fileName,
          note: targetNote,
          noteLabel: isMouthPlacementLesson ? "Âm sáo" : targetNoteLabel,
          durationSeconds: Math.max(Math.floor(durationBeforeStoppingMs / 1000), 1),
          createdAt,
        };

        await Promise.all(
          recordedFiles
            .filter((file) => file.uri !== stableUri)
            .map((file) =>
              FileSystem.deleteAsync(file.uri, { idempotent: true }).catch(
                () => undefined,
              ),
            ),
        );
        setRecordedFiles([recordedFile]);
        setRecordingUri(stableUri);
      } else {
        throw new Error("Không lấy được file sau khi dừng ghi âm.");
      }
    } catch (error) {
      console.warn("Failed to stop audio recording", error);
      Alert.alert(
        "Bản ghi chưa dùng được",
        error instanceof Error
          ? error.message
          : "Phiên ghi âm gặp sự cố. Vui lòng thử lại.",
      );
    } finally {
      recordingStartedAtRef.current = undefined;
      await configurePlaybackSession().catch(() => undefined);
      recorderOperationRef.current = false;
    }
  };

  const clearGuideTimers = useCallback(() => {
    guideTimersRef.current.forEach((timer) => clearTimeout(timer));
    guideTimersRef.current = [];
  }, []);

  const removeGuideListener = useCallback(() => {
    if (guideListenerRef.current) {
      guidePlayhead.removeListener(guideListenerRef.current);
      guideListenerRef.current = null;
    }
  }, [guidePlayhead]);

  const resetGuide = useCallback(() => {
    clearGuideTimers();
    removeGuideListener();
    guidePlayhead.stopAnimation();
    guidePlayhead.setValue(0);
    setIsGuideActive(false);
    setGuideCountdown(null);
    setGuideLineIndex(0);
  }, [clearGuideTimers, removeGuideListener, guidePlayhead]);

  // Hết bài: dừng thu, đóng viewer để hiện nút phân tích ở màn chính.
  const finishGuide = useCallback(async () => {
    resetGuide();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
    if (recorderState.isRecording) {
      await stopRecording();
    }
    closePracticeImageViewer();
  }, [
    resetGuide,
    recorderState.isRecording,
    stopRecording,
    closePracticeImageViewer,
  ]);

  const finishGuideRef = useRef(finishGuide);
  useEffect(() => {
    finishGuideRef.current = finishGuide;
  }, [finishGuide]);

  // Dừng giữa chừng.
  const stopGuide = useCallback(async () => {
    resetGuide();
    if (recorderState.isRecording) {
      await stopRecording();
    }
  }, [resetGuide, recorderState.isRecording, stopRecording]);

  // Bắt đầu: đếm ngược 3-2-1 (theo BPM) rồi tự thu âm + chạy vạch.
  const startGuide = useCallback(() => {
    if (isGuideActive || guideCountdown !== null || recorderState.isRecording) {
      return;
    }
    clearGuideTimers();
    removeGuideListener();
    guidePlayhead.setValue(0);
    setGuideLineIndex(0);
    setGuideCountdown(3);
    Haptics.selectionAsync().catch(() => undefined);

    const beatMs = (60 / guideBpm) * 1000;
    [2, 1].forEach((value, index) => {
      const timer = setTimeout(
        () => {
          setGuideCountdown(value);
          Haptics.selectionAsync().catch(() => undefined);
        },
        beatMs * (index + 1),
      );
      guideTimersRef.current.push(timer);
    });
    const startTimer = setTimeout(() => {
      setGuideCountdown(null);
      setIsGuideActive(true);
      startRecording().catch(() => undefined);
    }, beatMs * 3);
    guideTimersRef.current.push(startTimer);
  }, [
    isGuideActive,
    guideCountdown,
    recorderState.isRecording,
    clearGuideTimers,
    removeGuideListener,
    guidePlayhead,
    guideBpm,
    startRecording,
  ]);

  // Chạy vạch cho khuông hiện tại + tự cuộn ngang để vạch luôn trong tầm nhìn.
  useEffect(() => {
    if (!isGuideActive || guideCountdown !== null) return;
    const lineCount = selectedReferenceTrack.sheets.length;
    if (guideLineIndex >= lineCount) return;

    const beatSec = 60 / guideBpm;
    const notes = guideNotesPerLine[guideLineIndex] ?? 8;
    const durationMs = Math.max(1200, notes * beatSec * 1000);

    const startX = GUIDE_CARD_PADDING + guideLineWidth * SHEET_NOTE_START_FRACTION;
    const endX = GUIDE_CARD_PADDING + guideLineWidth * SHEET_NOTE_END_FRACTION;

    removeGuideListener();
    guidePlayhead.setValue(0);
    guideListenerRef.current = guidePlayhead.addListener(({ value }) => {
      const x = startX + (endX - startX) * value;
      guideScrollRef.current?.scrollTo({
        x: Math.max(0, x - windowWidth / 2),
        animated: false,
      });
    });

    const animation = Animated.timing(guidePlayhead, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (!finished) return;
      if (guideLineIndex + 1 < lineCount) {
        setGuideLineIndex((index) => index + 1);
      } else {
        finishGuideRef.current?.();
      }
    });

    return () => {
      animation.stop();
      removeGuideListener();
    };
  }, [
    isGuideActive,
    guideCountdown,
    guideLineIndex,
    guideBpm,
    guideNotesPerLine,
    guideLineWidth,
    selectedReferenceTrack,
    guidePlayhead,
    removeGuideListener,
    windowWidth,
  ]);

  // Đóng viewer khi đang tập → huỷ vạch + dừng thu.
  useEffect(() => {
    if (isReferenceSheetViewerVisible) return;
    if (isGuideActive || guideCountdown !== null) {
      resetGuide();
      if (recorderState.isRecording) {
        stopRecording();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReferenceSheetViewerVisible]);

  // Dọn timer/listener khi unmount.
  useEffect(() => resetGuide, [resetGuide]);

  const selectNote = (pitch: string) => {
    if (recorderState.isRecording || analysis.isPending) return;

    Haptics.selectionAsync().catch(() => undefined);
    analysis.reset();
    setIsResultModalVisible(false);
    setRecordingUri(undefined);
    setTargetNote(pitch);
  };

  const resetCurrentRecording = async () => {
    await stopPlayback();
    analysis.reset();
    setIsResultModalVisible(false);
    setRecordingUri(undefined);
    setRecordedFiles([]);
    await configureRecordingSession().catch(() => undefined);
  };

  const practiceAnotherNote = async () => {
    if (isMouthPlacementLesson) {
      await resetCurrentRecording();
      return;
    }

    const alternatives = PRACTICE_NOTES.filter(
      (practiceNote) => practiceNote.pitch !== targetNote,
    );
    const nextNote =
      alternatives[Math.floor(Math.random() * alternatives.length)] ||
      getRandomPracticeNote();

    setTargetNote(nextNote.pitch);
    await startRecording();
  };

  const playRecordedFile = async (file: RecordedAudioFile) => {
    if (recorderState.isRecording || analysis.isPending) return;

    Haptics.selectionAsync().catch(() => undefined);
    analysis.reset();
    setIsResultModalVisible(false);
    setTargetNote(file.note);
    setRecordingUri(file.uri);

    if (playingUri === file.uri && playbackStatus.playing) {
      await stopPlayback();
      return;
    }

    await configurePlaybackSession().catch(() => undefined);
    await stopReferencePlayback();
    playbackPlayer.pause();
    setPendingPlaybackUri(file.uri);
    playbackPlayer.replace({ uri: file.uri });
    playbackStartedAtRef.current = Date.now();
    setPlayingUri(file.uri);
  };

  const playReferenceTrack = async (track: ReferencePracticeTrack) => {
    if (!track.audio) return;
    if (recorderState.isRecording || analysis.isPending) return;

    Haptics.selectionAsync().catch(() => undefined);

    if (playingReferenceTrackId === track.id && referenceStatus.playing) {
      await stopReferencePlayback();
      return;
    }

    await configurePlaybackSession().catch(() => undefined);
    await stopPlayback();
    referencePlayer.pause();
    setPendingReferenceTrackId(track.id);
    referencePlayer.replace(track.audio);
    referenceStartedAtRef.current = Date.now();
    setPlayingReferenceTrackId(track.id);
  };

  const analyzeRecording = () => {
    if (!recordingUri) return;

    const fileName =
      selectedRecordedFile?.name ||
      (isMouthPlacementLesson
        ? `flute-sound-${Date.now()}.m4a`
        : isReferencePracticeLesson
        ? `practice-${selectedReferenceTrack.id}-${Date.now()}.m4a`
        : `note-${targetNote}-${Date.now()}.m4a`);
    const analysisMessage = isMouthPlacementLesson
      ? "Phân tích bản ghi người học thổi sáo. Chỉ cần đánh giá người học đã tạo được âm thanh sáo rõ hay chưa, âm có bị toàn tiếng gió hoặc quá yếu không. Nhận xét ngắn gọn bằng tiếng Việt và đưa 1-2 gợi ý về khẩu hình, hướng hơi nếu cần."
      : isReferencePracticeLesson
      ? `Phân tích bản ghi người học thổi sáo theo sheet "${selectedReferenceTrack.title}". Chuỗi nốt mẫu là:\n${selectedReferenceTrack.noteSequence}\nHãy so sánh bản ghi với chuỗi nốt mẫu về đúng/sai cao độ, thứ tự nốt, độ đều hơi và độ liền mạch khi chuyển nốt. Nhận xét ngắn gọn bằng tiếng Việt, nêu 1-2 lỗi chính và 1-2 gợi ý luyện lại. Khi nhắc tên nốt, dùng đúng ký hiệu trong chuỗi mẫu như C, D, E, F, G, A, B, C2, D2, E2.`
      : `Phân tích nốt sáo người học vừa thổi. Nốt mục tiêu là "${targetNoteLabel}". Hãy nhận xét ngắn gọn bằng tiếng Việt về cao độ, độ ổn định và cách cải thiện. Khi nhắc tên nốt trong phần nhận xét, BẮT BUỘC dùng tên tiếng Việt (Đô, Rê, Mi, Pha, Sol, La, Si), tuyệt đối không dùng ký hiệu nhạc lý như C5, D5, E5.`;

    analysis.mutate(
      {
        file: {
          uri: recordingUri,
          name: fileName,
          type: "audio/mp4",
        },
        message: analysisMessage,
        useLlm: true,
        ...(hasAdvancedAccess ? { fast: true } : {}),
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

  if (coursesLoading || subscriptionLoading) {
    return (
      <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
        <Stack.Screen options={{ title: "Luyện nốt", headerShown: false }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8E9E6E" />
        </View>
      </SafeScreen>
    );
  }

  if (isLessonLocked) {
    return (
      <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
        <Stack.Screen options={{ title: "Mở gói Technique", headerShown: false }} />
        <View className="flex-1 justify-center gap-5 px-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="absolute left-6 top-6 h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>

          <View className="items-center gap-4 rounded-[30px] bg-white p-7">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E2E8D3]">
              <Ionicons name="lock-closed" size={30} color="#687451" />
            </View>
            <Text
              selectable
              className="text-center text-xl font-bold text-[#10120C]"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Luyện tập thuộc gói Technique
            </Text>
            <Text selectable className="text-center text-sm leading-6 text-[#55594F]">
              {getUpgradeMessage(lessonTitle)}
            </Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/profile/subscription")}
              className="mt-2 w-full flex-row items-center justify-center gap-2 rounded-[22px] bg-[#10120C] px-5 py-4"
            >
              <Ionicons name="card-outline" size={20} color="white" />
              <Text className="font-bold text-white">Mở gói Technique</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeScreen>
    );
  }

  if (isPrerequisiteLocked) {
    return (
      <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
        <Stack.Screen options={{ title: "Chưa mở bài", headerShown: false }} />
        <View className="flex-1 justify-center gap-5 px-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="absolute left-6 top-6 h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>

          <View className="items-center gap-4 rounded-[30px] bg-white p-7">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E2E8D3]">
              <Ionicons name="lock-closed" size={30} color="#687451" />
            </View>
            <Text
              selectable
              className="text-center text-xl font-bold text-[#10120C]"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Chưa thể luyện bài này
            </Text>
            <Text selectable className="text-center text-sm leading-6 text-[#55594F]">
              {`Bạn cần đánh dấu hoàn thành "${previousLesson?.title}" trước khi tiếp tục.`}
            </Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (!previousLesson) return;
                router.replace({
                  pathname: "/lesson/[id]",
                  params: { id: previousLesson._id },
                } as unknown as Href);
              }}
              className="mt-2 w-full flex-row items-center justify-center gap-2 rounded-[22px] bg-[#10120C] px-5 py-4"
            >
              <Ionicons name="book-outline" size={20} color="white" />
              <Text className="font-bold text-white">Quay lại bài trước</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <Stack.Screen options={{ title: "Luyện nốt", headerShown: false }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        // maxWidth: giới hạn bề rộng nội dung trên màn hình lớn (iPad)
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 48,
          gap: 20,
          width: "100%",
          maxWidth: 700,
          alignSelf: "center",
        }}
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
              {practiceTitle}
            </Text>
            <Text className="mt-0.5 text-[11px] text-[#8A8D84]">
              {lesson?.title || "Luyện tập cùng AI"}
            </Text>
          </View>
          <View className="h-11 w-11" />
        </View>

        {isMouthPlacementLesson && (
          <LessonTwoMouthPlacementPractice
            onOpenImage={setSelectedPracticeImageIndex}
          />
        )}

        {isBasicNotesLesson && (
          <LessonThreeBasicNotesPractice
            targetNote={targetNote}
            targetNoteLabel={targetNoteLabel}
            onOpenImage={() => setIsBasicNotesImageVisible(true)}
          />
        )}

        {isBreathingLesson && (
          <LessonFourBreathingPractice
            analysisPending={analysis.isPending}
            isPreparingRecorder={isPreparingRecorder}
            isRecording={recorderState.isRecording}
            referencePracticeTracks={referencePracticeTracks}
            referenceSheetCardHeight={referenceSheetCardHeight}
            referenceSheetCardImageWidth={referenceSheetCardImageWidth}
            referenceSheetCardWidth={referenceSheetCardWidth}
            selectedReferenceTrack={selectedReferenceTrack}
            selectedReferenceTrackId={selectedReferenceTrackId}
            selectedReferenceTrackIsPlaying={selectedReferenceTrackIsPlaying}
            onOpenSheetViewer={() => setIsReferenceSheetViewerVisible(true)}
            onPlayReferenceTrack={playReferenceTrack}
            onSelectReferenceTrackPage={selectReferenceTrackPage}
          />
        )}

        {isFingerPracticeLesson && (
          <LessonFiveFingerPractice
            analysisPending={analysis.isPending}
            isPreparingRecorder={isPreparingRecorder}
            isRecording={recorderState.isRecording}
            referencePracticeTracks={referencePracticeTracks}
            referenceSheetCardHeight={referenceSheetCardHeight}
            referenceSheetCardImageWidth={referenceSheetCardImageWidth}
            referenceSheetCardWidth={referenceSheetCardWidth}
            selectedReferenceTrack={selectedReferenceTrack}
            selectedReferenceTrackId={selectedReferenceTrackId}
            selectedReferenceTrackIsPlaying={selectedReferenceTrackIsPlaying}
            onOpenSheetViewer={() => setIsReferenceSheetViewerVisible(true)}
            onPlayReferenceTrack={playReferenceTrack}
            onSelectReferenceTrackPage={selectReferenceTrackPage}
          />
        )}

        {isBasicTuneLesson && (
          <LessonEightBasicTunePractice
            analysisPending={analysis.isPending}
            isPreparingRecorder={isPreparingRecorder}
            isRecording={recorderState.isRecording}
            referencePracticeTracks={referencePracticeTracks}
            referenceSheetCardHeight={referenceSheetCardHeight}
            referenceSheetCardImageWidth={referenceSheetCardImageWidth}
            referenceSheetCardWidth={referenceSheetCardWidth}
            selectedReferenceTrack={selectedReferenceTrack}
            selectedReferenceTrackId={selectedReferenceTrackId}
            selectedReferenceTrackIsPlaying={selectedReferenceTrackIsPlaying}
            onOpenSheetViewer={() => setIsReferenceSheetViewerVisible(true)}
            onPlayReferenceTrack={playReferenceTrack}
            onSelectReferenceTrackPage={selectReferenceTrackPage}
          />
        )}

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

          <View className="w-full items-center px-2">
            <Text
              selectable
              allowFontScaling={false}
              className="text-[11px] font-bold uppercase tracking-[3px] text-white/60"
            >
              {recordingTargetTitle}
            </Text>
            <Text
              selectable
              numberOfLines={1}
              adjustsFontSizeToFit
              maxFontSizeMultiplier={1.2}
              className={`mt-2 text-center font-bold text-white ${
                isMouthPlacementLesson ? "text-3xl" : "text-4xl"
              }`}
              style={{
                fontFamily: "BeVietnamPro-Medium",
                letterSpacing: 0.3,
              }}
            >
              {recordingTargetLabel}
            </Text>
            <Text
              numberOfLines={2}
              maxFontSizeMultiplier={1.2}
              className="mt-1.5 text-center text-xs font-bold leading-5 text-white/60"
            >
              {recordingTargetDetail}
            </Text>
          </View>
        </View>

        {!isMouthPlacementLesson && !isReferencePracticeLesson && (
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
        )}

        <View className="items-center rounded-[30px] bg-white px-7 pb-7 pt-6">
          <View className="mb-5 w-full flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
                Thu âm
              </Text>
              <Text className="mt-1 text-xs text-[#8A8D84]">
                Đặt điện thoại cách sáo khoảng 30 cm
              </Text>
            </View>
            <Text
              selectable
              allowFontScaling={false}
              numberOfLines={1}
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
                  : isMouthPlacementLesson
                    ? "Chạm micro và thổi ra âm sáo rõ"
                    : "Chạm micro và bắt đầu thổi"}
          </Text>
        </View>

        {recordedFiles.length > 0 && (
          <View className="gap-3 rounded-[26px] bg-white p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
                File đã ghi âm
              </Text>
              <Text className="text-xs font-semibold text-[#8A8D84]">
                {recordedFiles.length} file
              </Text>
            </View>

            {recordedFiles.map((file) => {
              const isSelected = file.uri === recordingUri;
              const isPlaying = file.uri === playingUri && playbackStatus.playing;

              return (
                <TouchableOpacity
                  key={file.uri}
                  activeOpacity={0.85}
                  disabled={recorderState.isRecording || analysis.isPending}
                  onPress={() => playRecordedFile(file)}
                  className={`flex-row items-center gap-3 rounded-[18px] border px-4 py-3 ${
                    isSelected
                      ? "border-[#8E9E6E] bg-[#F7F8F3]"
                      : "border-[#E5E7E1] bg-white"
                  }`}
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      isSelected ? "bg-[#8E9E6E]" : "bg-[#F1F2EC]"
                    }`}
                  >
                    <Ionicons
                      name={
                        isPlaying
                          ? "pause"
                          : isSelected
                            ? "play"
                            : "musical-notes-outline"
                      }
                      size={18}
                      color={isSelected ? "white" : "#687451"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text selectable className="text-sm font-bold text-[#10120C]">
                      {file.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-[#777B70]">
                      {isPlaying ? "Đang phát" : file.noteLabel} · {file.durationSeconds}s ·{" "}
                      {new Date(file.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
                : isMouthPlacementLesson
                  ? "Kiểm tra âm sáo với AI"
                : hasAdvancedAccess
                  ? "Phân tích nâng cao với AI"
                  : "Phân tích cơ bản với AI"}
            </Text>
          </TouchableOpacity>
        )}

        {analysis.isError && (
          <View className="gap-2 rounded-[24px] border border-[#F0C7C2] bg-[#FFF2F0] p-5">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name={isNonFluteError ? "musical-note-outline" : "cloud-offline-outline"}
                size={18}
                color="#A84236"
              />
              <Text selectable className="font-bold text-[#A84236]">
                {isNonFluteError
                  ? "Bản ghi chưa phải tiếng sáo"
                  : "Không thể phân tích bản ghi"}
              </Text>
            </View>
            <Text selectable className="text-sm leading-5 text-[#7C4B46]">
              {analysis.error?.message ||
                (isNonFluteError
                  ? "Hãy ghi lại ở nơi yên tĩnh và chỉ thổi sáo, không nói chuyện."
                  : "Vui lòng kiểm tra kết nối và thử lại.")}
            </Text>
            {__DEV__ && (
              <Text selectable className="text-[10px] text-red-500 font-mono mt-1">
                Debug: {JSON.stringify(analysis.error)}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isResultModalVisible && !!compactResult}
        onRequestClose={() => setIsResultModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/45 px-6">
          <View className="gap-4 rounded-[28px] bg-white p-6">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
                  Kết quả phân tích
                </Text>
                <Text className="mt-1 text-lg font-bold text-[#10120C]">
                  {compactResult?.label}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsResultModalVisible(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-[#F1F2EC]"
              >
                <Ionicons name="close" size={20} color="#10120C" />
              </TouchableOpacity>
            </View>

            {compactResult?.score != null && (
              <View className="items-center rounded-[22px] bg-[#F7F8F3] py-4">
                <Text className="text-5xl font-black text-[#10120C]">
                  {compactResult?.score}
                  <Text className="text-lg text-[#777B70]">/100</Text>
                </Text>
              </View>
            )}

            {!!compactResult?.description && (
              <Text selectable className="text-sm leading-6 text-[#34372F]">
                {compactResult.description}
              </Text>
            )}

            {compactResult?.issues.map((issue, index) => (
              <View key={`issue-${index}`} className="flex-row gap-2">
                <Ionicons name="alert-circle" size={16} color="#A84236" />
                <Text selectable className="flex-1 text-sm leading-5 text-[#7C4B46]">
                  {issue}
                </Text>
              </View>
            ))}

            {compactResult?.recommendations.map((recommendation, index) => (
              <View key={`recommendation-${index}`} className="flex-row gap-2">
                <Ionicons name="bulb" size={16} color="#687451" />
                <Text selectable className="flex-1 text-sm leading-5 text-[#4A533B]">
                  {recommendation}
                </Text>
              </View>
            ))}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setIsResultModalVisible(false);
                practiceAnotherNote();
              }}
              className="mt-1 flex-row items-center justify-center gap-2 rounded-full bg-[#10120C] py-4"
            >
              <Ionicons name="refresh" size={18} color="white" />
              <Text className="font-bold text-white">
                {isMouthPlacementLesson ? "Thử lại" : "Thử nốt khác"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={selectedPracticeImageIndex !== null}
        supportedOrientations={[
          "portrait",
          "portrait-upside-down",
          "landscape",
          "landscape-left",
          "landscape-right",
        ]}
        onRequestClose={closePracticeImageViewer}
      >
        <View className="flex-1 bg-black">
          <View className="absolute right-5 top-12 z-10">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={closePracticeImageViewer}
              className="h-11 w-11 items-center justify-center rounded-full bg-white/15"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {selectedPracticeImageIndex !== null && (
            <Animated.View
              className="flex-1"
              style={{ transform: [{ translateY: imageViewerTranslateY }] }}
              {...imageViewerPanResponder.panHandlers}
            >
              <Image
                source={mouthPlacementPracticeImages[selectedPracticeImageIndex]}
                contentFit="contain"
                style={{ flex: 1, width: "100%" }}
              />
            </Animated.View>
          )}
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={isBasicNotesImageVisible}
        supportedOrientations={[
          "portrait",
          "portrait-upside-down",
          "landscape",
          "landscape-left",
          "landscape-right",
        ]}
        onRequestClose={closePracticeImageViewer}
      >
        <View className="flex-1 bg-black">
          <View className="absolute right-5 top-12 z-10">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={closePracticeImageViewer}
              className="h-11 w-11 items-center justify-center rounded-full bg-white/15"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <Animated.View
            className="flex-1"
            style={{ transform: [{ translateY: imageViewerTranslateY }] }}
            {...imageViewerPanResponder.panHandlers}
          >
            <Image
              source={basicNotesPracticeImage}
              contentFit="contain"
              style={{ flex: 1, width: "100%" }}
            />
          </Animated.View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={isReferenceSheetViewerVisible}
        supportedOrientations={[
          "portrait",
          "portrait-upside-down",
          "landscape",
          "landscape-left",
          "landscape-right",
        ]}
        onRequestClose={closePracticeImageViewer}
      >
        <View className="flex-1 bg-[#0B0B0C]">
          <View className="absolute left-5 right-5 top-14 z-10 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 rounded-full bg-white/12 px-4 py-2">
              <Ionicons name="musical-notes" size={15} color="white" />
              <Text className="text-sm font-bold text-white">
                {selectedReferenceTrack.title}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={closePracticeImageViewer}
              className="h-11 w-11 items-center justify-center rounded-full bg-white/12"
            >
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <Animated.View
            className="flex-1"
            style={{ transform: [{ translateY: imageViewerTranslateY }] }}
            {...(isGuideActive || guideCountdown !== null
              ? {}
              : imageViewerPanResponder.panHandlers)}
          >
            {isGuideActive || guideCountdown !== null ? (
              // --- Chế độ tập theo vạch chạy: 1 khuông lớn + vạch + đếm ngược ---
              <View
                className="flex-1 items-center justify-center px-4"
                style={{ paddingTop: 96, paddingBottom: 150 }}
              >
                <Text className="mb-4 text-sm font-semibold text-white/70">
                  Khuông{" "}
                  {Math.min(
                    guideLineIndex + 1,
                    selectedReferenceTrack.sheets.length,
                  )}
                  /{selectedReferenceTrack.sheets.length}
                </Text>
                <ScrollView
                  ref={guideScrollRef}
                  horizontal
                  scrollEnabled={!isGuideActive}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    minWidth: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    className="overflow-hidden rounded-2xl bg-white"
                    style={{
                      padding: GUIDE_CARD_PADDING,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.35,
                      shadowRadius: 16,
                      elevation: 6,
                    }}
                  >
                    <View
                      style={{
                        height: referenceSheetViewerHeight,
                        width: guideLineWidth,
                      }}
                    >
                      <Image
                        source={selectedReferenceTrack.sheets[guideLineIndex]}
                        contentFit="contain"
                        style={{ height: "100%", width: "100%" }}
                      />
                      <Animated.View
                        pointerEvents="none"
                        style={{
                          position: "absolute",
                          top: -8,
                          bottom: -8,
                          width: 3,
                          borderRadius: 2,
                          backgroundColor: "#D96C5F",
                          transform: [
                            {
                              translateX: guidePlayhead.interpolate({
                                inputRange: [0, 1],
                                outputRange: [
                                  guideLineWidth * SHEET_NOTE_START_FRACTION,
                                  guideLineWidth * SHEET_NOTE_END_FRACTION,
                                ],
                              }),
                            },
                          ],
                        }}
                      />
                    </View>
                  </View>
                </ScrollView>

                {guideCountdown !== null && (
                  <View
                    className="absolute inset-0 items-center justify-center"
                    style={{ backgroundColor: "rgba(11,11,12,0.55)" }}
                  >
                    <Text
                      className="font-bold text-white"
                      style={{ fontSize: 96 }}
                    >
                      {guideCountdown}
                    </Text>
                    <Text className="mt-2 text-sm text-white/70">
                      Chuẩn bị thổi…
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              // --- Chế độ xem: cuộn dọc qua các khuông, cuộn ngang từng khuông ---
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  minHeight: "100%",
                  justifyContent: "center",
                  paddingHorizontal: 16,
                  paddingTop: 112,
                  paddingBottom: 168,
                  gap: 16,
                }}
              >
                {selectedReferenceTrack.sheets.map((sheet, sheetIndex) => (
                  <View
                    key={`${selectedReferenceTrack.id}-viewer-sheet-${sheetIndex}`}
                    className="gap-2"
                  >
                    <Text className="px-1.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-white/40">
                      Khuông {sheetIndex + 1}
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        minWidth: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <View
                        className="overflow-hidden rounded-2xl bg-white p-3"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.35,
                          shadowRadius: 16,
                          elevation: 6,
                        }}
                      >
                        <Image
                          source={sheet}
                          contentFit="contain"
                          style={{
                            height: referenceSheetViewerHeight,
                            width:
                              referenceSheetViewerHeight *
                              sheetAspectRatios[sheetIndex],
                          }}
                        />
                      </View>
                    </ScrollView>
                  </View>
                ))}

                <View className="mt-3 flex-row items-center justify-center gap-1.5">
                  <Ionicons
                    name="swap-horizontal"
                    size={14}
                    color="rgba(255,255,255,0.4)"
                  />
                  <Text className="text-xs text-white/40">
                    Vuốt ngang để xem hết · vuốt xuống để đóng
                  </Text>
                </View>
              </ScrollView>
            )}
          </Animated.View>

          {/* --- Thanh điều khiển tập theo vạch --- */}
          <View
            className="absolute inset-x-0 bottom-0 px-5 pb-9 pt-4"
            style={{ backgroundColor: "rgba(11,11,12,0.9)" }}
          >
            {isGuideActive || guideCountdown !== null ? (
              <View className="flex-row items-center justify-between gap-4">
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <View className="h-3 w-3 rounded-full bg-[#D96C5F]" />
                  <Text
                    numberOfLines={1}
                    className="text-sm font-bold text-white"
                  >
                    {guideCountdown !== null
                      ? `Bắt đầu sau ${guideCountdown}…`
                      : `Đang thu · 00:${String(durationSeconds).padStart(2, "0")}`}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={stopGuide}
                  className="flex-row items-center gap-2 rounded-full bg-white px-6 py-3"
                >
                  <Ionicons name="stop" size={18} color="#10120C" />
                  <Text className="font-bold text-[#10120C]">Dừng</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-3">
                <View className="flex-row items-center justify-center gap-2">
                  <Text className="text-xs font-semibold text-white/50">
                    Nhịp độ
                  </Text>
                  {GUIDE_BPM_OPTIONS.map((bpm) => {
                    const isSelected = guideBpm === bpm;
                    return (
                      <TouchableOpacity
                        key={bpm}
                        activeOpacity={0.85}
                        onPress={() => setGuideBpm(bpm)}
                        className={`rounded-full px-4 py-2 ${
                          isSelected ? "bg-white" : "bg-white/12"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? "text-[#10120C]" : "text-white/80"
                          }`}
                        >
                          {bpm}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <Text className="text-xs text-white/40">BPM</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={startGuide}
                  className="flex-row items-center justify-center gap-2 rounded-full bg-[#8E9E6E] py-4"
                >
                  <Ionicons name="play" size={20} color="white" />
                  <Text className="font-bold text-white">
                    Thổi theo vạch (tự thu âm)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}
