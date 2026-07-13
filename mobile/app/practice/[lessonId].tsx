import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
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
  Modal,
  PanResponder,
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

const RECORDINGS_DIRECTORY = `${FileSystem.documentDirectory}practice-recordings`;

const persistRecordedAudio = async (sourceUri: string, fileName: string) => {
  if (!FileSystem.documentDirectory) {
    throw new Error("Thiết bị không cung cấp thư mục lưu bản ghi.");
  }

  await FileSystem.makeDirectoryAsync(RECORDINGS_DIRECTORY, {
    intermediates: true,
  });
  const destinationUri = `${RECORDINGS_DIRECTORY}/${fileName}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });

  const info = await FileSystem.getInfoAsync(destinationUri);
  if (!info.exists || typeof info.size !== "number" || info.size <= 0) {
    throw new Error("Bản ghi vừa lưu bị rỗng hoặc không thể đọc lại.");
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
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
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
  const playbackStartedAtRef = useRef(0);
  const referenceStartedAtRef = useRef(0);

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
  const referenceSheetCardWidth = isCompactReferenceSheetLesson
    ? Math.max(windowWidth - 132, 230)
    : 620;
  const referenceSheetCardImageWidth = isCompactReferenceSheetLesson
    ? referenceSheetCardWidth - 24
    : referenceSheetCardWidth;
  const referenceSheetCardHeight = isCompactReferenceSheetLesson ? 56 : 88;
  const referenceSheetViewerWidth = isCompactReferenceSheetLesson
    ? Math.max(windowWidth - 36, 360)
    : Math.max(windowWidth - 36, 980);
  const referenceSheetViewerHeight = Math.max(
    isCompactReferenceSheetLesson ? 74 : 96,
    Math.min(
      isCompactReferenceSheetLesson ? 96 : 180,
      (windowHeight - 170) / selectedReferenceTrack.sheets.length,
    ),
  );

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
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }
    };

    prepareAudio().catch(() => setPermissionGranted(false));
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
      await recorder.stop();
      if (recorder.uri) {
        const createdAt = Date.now();
        const fileName = isMouthPlacementLesson
          ? `flute-sound-${createdAt}.m4a`
          : `note-${targetNote}-${createdAt}.m4a`;
        const stableUri = await persistRecordedAudio(recorder.uri, fileName);
        const recordedFile: RecordedAudioFile = {
          uri: stableUri,
          name: fileName,
          note: targetNote,
          noteLabel: isMouthPlacementLesson ? "Âm sáo" : targetNoteLabel,
          durationSeconds: Math.max(durationSeconds, 1),
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
      }
    } catch (error) {
      console.warn("Failed to stop audio recording", error);
      Alert.alert(
        "Không thể dừng ghi âm",
        "Phiên ghi âm gặp sự cố. Vui lòng thử lại.",
      );
    } finally {
      await configurePlaybackSession().catch(() => undefined);
      recorderOperationRef.current = false;
    }
  };

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

          <View className="items-center">
            <Text selectable className="text-xs font-bold uppercase tracking-[2px] text-white/60">
              {recordingTargetTitle}
            </Text>
            <Text
              selectable
              className={`mt-2 font-bold text-white ${
                isMouthPlacementLesson ? "text-3xl" : "text-4xl"
              }`}
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              {recordingTargetLabel}
            </Text>
            <Text className="mt-1 text-xs font-bold text-white/55">
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
        <View className="flex-1 bg-black">
          <View className="absolute left-5 right-5 top-12 z-10 flex-row items-center justify-between">
            <View className="rounded-full bg-white/15 px-4 py-2">
              <Text className="text-sm font-bold text-white">
                {selectedReferenceTrack.title}
              </Text>
            </View>
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
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                minHeight: "100%",
                justifyContent: "center",
                paddingHorizontal: 18,
                paddingVertical: 96,
                gap: 18,
              }}
            >
              {selectedReferenceTrack.sheets.map((sheet, sheetIndex) => (
                <ScrollView
                  key={`${selectedReferenceTrack.id}-viewer-sheet-${sheetIndex}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: referenceSheetViewerWidth,
                  }}
                >
                  <View className="items-center justify-center overflow-hidden rounded-[10px] bg-white">
                    <Image
                      source={sheet}
                      contentFit={isBasicTuneLesson ? "fill" : "contain"}
                      style={{
                        height: referenceSheetViewerHeight,
                        width: referenceSheetViewerWidth,
                      }}
                    />
                  </View>
                </ScrollView>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeScreen>
  );
}
