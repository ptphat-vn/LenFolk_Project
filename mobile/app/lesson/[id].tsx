import { Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer } from 'expo-video';
import React from 'react';
import { Alert, ScrollView } from 'react-native';
import {
  PLAYER_STATES,
  type YoutubeIframeRef,
} from 'react-native-youtube-iframe';

import SafeScreen from '@/components/SafeScreen';
import { canAccessLesson, getUpgradeMessage } from '@/constants/course-access';
import { useGetCourses } from '@/hooks/course/use-get-courses';
import { useCurrentSubscription } from '@/hooks/enrollment/use-current-subscription';
import { useGetDetailLesson } from '@/hooks/lesson/use-get-detail-lesson';
import { useGetLessons } from '@/hooks/lesson/use-get-lessons';
import { useGetPracticeSessions } from '@/hooks/practice-session/use-get-practice-sessions';
import { useCreateProgress } from '@/hooks/progress/use-create-progress';
import { useGetProgressList } from '@/hooks/progress/use-get-progress-list';
import { useUpdateProgress } from '@/hooks/progress/use-update-progress';

import { buildLessonDetail } from '@/components/lesson-detail/build-lesson-detail';
import { LessonCompletionActions } from '@/components/lesson-detail/LessonCompletionActions';
import { LessonHeader } from '@/components/lesson-detail/LessonHeader';
import { LessonPracticeSection } from '@/components/lesson-detail/LessonPracticeSection';
import {
  LessonLoadingState,
  LessonLockedState,
  LessonNotFoundState,
  LessonPrerequisiteLockedState,
} from '@/components/lesson-detail/LessonStates';
import { LessonSummaryCard } from '@/components/lesson-detail/LessonSummaryCard';
import { LessonTheoryCard } from '@/components/lesson-detail/LessonTheoryCard';
import { LessonVideoPlayer } from '@/components/lesson-detail/LessonVideoPlayer';
import { getYoutubeVideoId } from '@/components/lesson-detail/youtube';

const REQUIRED_WATCH_PERCENT = 80;

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: dbLesson, isLoading: lessonLoading } = useGetDetailLesson(
    id || '',
  );
  const { data: courses, isLoading: coursesLoading } = useGetCourses();
  const { data: allLessonsData } = useGetLessons();
  const { data: progressList, isLoading: progressLoading } =
    useGetProgressList();
  const { data: practiceSessions } = useGetPracticeSessions();
  const { hasPremiumAccess, isLoading: subscriptionLoading } =
    useCurrentSubscription();
  const createProgress = useCreateProgress();
  const updateProgress = useUpdateProgress();
  const youtubePlayerRef = React.useRef<YoutubeIframeRef | null>(null);
  const videoProgressIntervalRef = React.useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const lastSavedVideoProgressRef = React.useRef(0);
  const isSavingVideoProgressRef = React.useRef(false);

  const lessonCourse = React.useMemo(
    () => courses?.find((course) => course._id === dbLesson?.courseId),
    [courses, dbLesson?.courseId],
  );
  const isLessonLocked =
    Boolean(dbLesson && courses) &&
    !canAccessLesson(dbLesson, lessonCourse, hasPremiumAccess);
  const orderedDbLessons = React.useMemo(
    () => [...(allLessonsData ?? [])].sort((a, b) => a.order - b.order),
    [allLessonsData],
  );
  const previousLesson = React.useMemo(() => {
    if (!dbLesson) return undefined;
    const currentIndex = orderedDbLessons.findIndex(
      (item) => item._id === dbLesson._id,
    );
    return currentIndex > 0 ? orderedDbLessons[currentIndex - 1] : undefined;
  }, [orderedDbLessons, dbLesson]);
  const previousProgress = React.useMemo(
    () => progressList?.find((item) => item.lessonId === previousLesson?._id),
    [previousLesson?._id, progressList],
  );
  const isPrerequisiteLocked =
    Boolean(previousLesson) && previousProgress?.status !== 'completed';

  const lesson = React.useMemo(
    () => buildLessonDetail({ dbLesson, id, lessonCourse }),
    [dbLesson, id, lessonCourse],
  );
  const nextLesson = React.useMemo(() => {
    if (!dbLesson) return undefined;
    const currentIndex = orderedDbLessons.findIndex(
      (item) => item._id === dbLesson._id,
    );
    return currentIndex >= 0 ? orderedDbLessons[currentIndex + 1] : undefined;
  }, [orderedDbLessons, dbLesson]);
  const nextLessonCourse = React.useMemo(
    () => courses?.find((course) => course._id === nextLesson?.courseId),
    [courses, nextLesson?.courseId],
  );
  const isNextLessonLocked =
    Boolean(nextLesson && courses) &&
    !canAccessLesson(nextLesson, nextLessonCourse, hasPremiumAccess);
  const currentProgress = React.useMemo(
    () => progressList?.find((item) => item.lessonId === dbLesson?._id),
    [progressList, dbLesson],
  );
  const isCompleted = currentProgress?.status === 'completed';
  const isMarkingComplete =
    updateProgress.isPending || createProgress.isPending;

  const videoWatchedPercent = Math.max(
    currentProgress?.completionPercent ?? 0,
    lastSavedVideoProgressRef.current,
  );
  const hasVideo = Boolean(lesson?.videoUrl);
  const hasWatchedEnoughVideo =
    !hasVideo || videoWatchedPercent >= REQUIRED_WATCH_PERCENT;
  const hasCompletedPractice = React.useMemo(
    () =>
      Boolean(
        dbLesson &&
        practiceSessions?.some((session) => session.lessonId === dbLesson._id),
      ),
    [dbLesson, practiceSessions],
  );
  const practiceRequirementMet = !lesson?.hasPractice || hasCompletedPractice;
  const canMarkComplete =
    isCompleted || (hasWatchedEnoughVideo && practiceRequirementMet);
  const incompleteReason = isCompleted
    ? undefined
    : !hasWatchedEnoughVideo
      ? `Hãy xem ít nhất ${REQUIRED_WATCH_PERCENT}% video bài học trước khi đánh dấu hoàn thành (bạn đã xem ${videoWatchedPercent}%).`
      : !practiceRequirementMet
        ? 'Hãy hoàn thành phần luyện tập cùng AI của bài học này trước khi đánh dấu hoàn thành.'
        : undefined;

  const goToLessons = () => {
    router.replace('/(tabs)/courses');
  };

  const goToSubscription = () => {
    router.push('/profile/subscription');
  };

  const goToPreviousLesson = () => {
    if (!previousLesson) return;
    router.replace({
      pathname: '/lesson/[id]',
      params: { id: previousLesson._id },
    } as unknown as Href);
  };

  const goToNextLesson = () => {
    if (!nextLesson) return;

    if (isNextLessonLocked) {
      Alert.alert(
        'Cần mở khóa gói Technique',
        getUpgradeMessage(nextLesson.title),
        [
          { text: 'Hủy', style: 'cancel', onPress: goToLessons },
          { text: 'Đồng ý', onPress: goToSubscription },
        ],
      );
      return;
    }

    router.replace({
      pathname: '/lesson/[id]',
      params: { id: nextLesson._id },
    } as unknown as Href);
  };

  const goToPractice = () => {
    if (!lesson) return;
    router.push({
      pathname: '/practice/[lessonId]',
      params: {
        lessonId: String(lesson.id),
        lessonNumber: lesson.lessonNumber
          ? String(lesson.lessonNumber)
          : undefined,
        note: lesson.targetNote,
      },
    } as unknown as Href);
  };

  const markAsCompleted = () => {
    if (
      !dbLesson ||
      isCompleted ||
      updateProgress.isPending ||
      createProgress.isPending
    ) {
      return;
    }

    if (!canMarkComplete) {
      Alert.alert(
        'Chưa thể hoàn thành',
        incompleteReason ??
          'Bạn cần xem hết video và hoàn thành phần luyện tập trước.',
      );
      return;
    }

    const lastAccessedAt = new Date().toISOString();
    const onSuccess = () => {
      Alert.alert('Đã hoàn thành', 'Bài học đã được đánh dấu hoàn thành.');
    };

    if (currentProgress) {
      updateProgress.mutate(
        {
          id: currentProgress._id,
          status: 'completed',
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
          status: 'completed',
          completionPercent: 100,
          lastAccessedAt,
        },
        { onSuccess },
      );
    }
  };

  const youtubeVideoId = React.useMemo(
    () => getYoutubeVideoId(lesson?.videoUrl),
    [lesson?.videoUrl],
  );

  React.useEffect(() => {
    lastSavedVideoProgressRef.current = currentProgress?.completionPercent ?? 0;
  }, [currentProgress?.completionPercent, dbLesson?._id]);

  const stopVideoProgressTracking = React.useCallback(() => {
    if (videoProgressIntervalRef.current) {
      clearInterval(videoProgressIntervalRef.current);
      videoProgressIntervalRef.current = null;
    }
  }, []);

  const persistWatchProgress = React.useCallback(
    async (currentTime: number, duration: number, force = false) => {
      if (
        !dbLesson ||
        isCompleted ||
        isLessonLocked ||
        isPrerequisiteLocked ||
        progressLoading ||
        isSavingVideoProgressRef.current
      ) {
        return;
      }

      if (!duration || duration <= 0 || currentTime < 0) return;

      isSavingVideoProgressRef.current = true;

      try {
        const watchedSeconds = Math.floor(currentTime);
        const completionPercent = Math.min(
          99,
          Math.max(1, Math.floor((currentTime / duration) * 100)),
        );
        const previousPercent = Math.max(
          lastSavedVideoProgressRef.current,
          currentProgress?.completionPercent ?? 0,
        );

        if (!force && completionPercent < previousPercent + 5) return;
        if (completionPercent <= previousPercent && !force) return;

        const payload = {
          status: 'in_progress' as const,
          watchedSeconds,
          completionPercent: Math.max(completionPercent, previousPercent),
          lastAccessedAt: new Date().toISOString(),
        };

        if (currentProgress) {
          await updateProgress.mutateAsync({
            id: currentProgress._id,
            ...payload,
          });
        } else {
          await createProgress.mutateAsync({
            courseId: dbLesson.courseId,
            lessonId: dbLesson._id,
            ...payload,
          });
        }

        lastSavedVideoProgressRef.current = payload.completionPercent;
      } finally {
        isSavingVideoProgressRef.current = false;
      }
    },
    [
      createProgress,
      currentProgress,
      dbLesson,
      isCompleted,
      isLessonLocked,
      isPrerequisiteLocked,
      progressLoading,
      updateProgress,
    ],
  );

  const saveYoutubeProgress = React.useCallback(
    async (force = false) => {
      if (!youtubeVideoId || !youtubePlayerRef.current) return;

      const [duration, currentTime] = await Promise.all([
        youtubePlayerRef.current.getDuration(),
        youtubePlayerRef.current.getCurrentTime(),
      ]);

      await persistWatchProgress(currentTime, duration, force);
    },
    [persistWatchProgress, youtubeVideoId],
  );

  const startVideoProgressTracking = React.useCallback(() => {
    if (videoProgressIntervalRef.current) return;
    saveYoutubeProgress(true).catch(() => undefined);
    videoProgressIntervalRef.current = setInterval(() => {
      saveYoutubeProgress().catch(() => undefined);
    }, 5000);
  }, [saveYoutubeProgress]);

  const handleYoutubeStateChange = React.useCallback(
    (state: PLAYER_STATES) => {
      if (state === PLAYER_STATES.PLAYING) {
        startVideoProgressTracking();
        return;
      }

      if (
        state === PLAYER_STATES.PAUSED ||
        state === PLAYER_STATES.ENDED ||
        state === PLAYER_STATES.BUFFERING
      ) {
        stopVideoProgressTracking();
        saveYoutubeProgress(true).catch(() => undefined);
      }
    },
    [
      saveYoutubeProgress,
      startVideoProgressTracking,
      stopVideoProgressTracking,
    ],
  );

  React.useEffect(() => stopVideoProgressTracking, [stopVideoProgressTracking]);

  const player = useVideoPlayer(null, (player) => {
    player.loop = false;
  });

  React.useEffect(() => {
    if (lesson?.videoUrl && !youtubeVideoId) {
      player.replaceAsync(lesson.videoUrl);
    }
  }, [lesson?.videoUrl, youtubeVideoId, player]);

  React.useEffect(() => {
    if (!lesson?.videoUrl || youtubeVideoId) return;
    if (isCompleted || isLessonLocked || isPrerequisiteLocked) return;

    const interval = setInterval(() => {
      if (!player.playing) return;
      persistWatchProgress(player.currentTime, player.duration).catch(
        () => undefined,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [
    isCompleted,
    isLessonLocked,
    isPrerequisiteLocked,
    lesson?.videoUrl,
    persistWatchProgress,
    player,
    youtubeVideoId,
  ]);

  if (lessonLoading || coursesLoading || subscriptionLoading) {
    return <LessonLoadingState />;
  }

  if (!lesson) {
    return <LessonNotFoundState onBack={goToLessons} />;
  }

  if (isLessonLocked) {
    return (
      <LessonLockedState
        message={getUpgradeMessage(lesson.title)}
        onBack={goToLessons}
        onSubscribe={goToSubscription}
      />
    );
  }

  if (isPrerequisiteLocked) {
    return (
      <LessonPrerequisiteLockedState
        onBack={goToLessons}
        onPreviousLesson={goToPreviousLesson}
        previousLessonTitle={previousLesson?.title}
      />
    );
  }

  return (
    <SafeScreen style={{ backgroundColor: '#FDF8EA' }}>
      <Stack.Screen options={{ title: lesson.title, headerShown: false }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 48, gap: 20 }}
      >
        <LessonHeader lesson={lesson} onBack={goToLessons} />
        <LessonVideoPlayer
          onYoutubeStateChange={handleYoutubeStateChange}
          player={player}
          videoUrl={lesson.videoUrl}
          youtubePlayerRef={youtubePlayerRef}
          youtubeVideoId={youtubeVideoId}
        />
        <LessonSummaryCard lesson={lesson} />
        <LessonTheoryCard theory={lesson.theory} />
        <LessonPracticeSection lesson={lesson} onPracticePress={goToPractice} />
        <LessonCompletionActions
          canComplete={canMarkComplete}
          incompleteReason={incompleteReason}
          isCompleted={isCompleted}
          isMarkingComplete={isMarkingComplete}
          nextLesson={nextLesson}
          onMarkComplete={markAsCompleted}
          onNextLesson={goToNextLesson}
        />
      </ScrollView>
    </SafeScreen>
  );
}
