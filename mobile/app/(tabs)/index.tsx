import { AnimatedBlock } from '@/components/AnimatedPage';
import NotificationButton from '@/components/NotificationButton';
import { canAccessLesson, getUpgradeMessage } from '@/constants/course-access';
import {
  getLessonNumberFromTitle,
  lessonHasPractice,
} from '@/constants/lessons';
import { getRandomPracticeNote } from '@/constants/practice-notes';
import { useGetCourses } from '@/hooks/course/use-get-courses';
import { useCurrentSubscription } from '@/hooks/enrollment/use-current-subscription';
import { useGetLessons } from '@/hooks/lesson/use-get-lessons';
import { useGetProgressList } from '@/hooks/progress/use-get-progress-list';
import { useCreateStreak } from '@/hooks/streak/use-create-streak';
import { useGetStreaks } from '@/hooks/streak/use-get-streaks';
import { useUpdateStreak } from '@/hooks/streak/use-update-streak';
import { useScrollToTopOnFocus } from '@/hooks/use-scroll-to-top-on-focus';
import { useAuthStore } from '@/store/authStore';
import {
  isStreakMilestone,
  StreakCelebrationModal,
  StreakDetailModal,
} from '@/components/streak/streak-modals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SafeScreen from '../../components/SafeScreen';

const greetingPrompt = 'Hôm nay bạn muốn học gì?';
const lenFolkMessage = 'LenFolk đồng hành cùng bạn trên từng nốt nhạc.';
const typewriterMessages = [greetingPrompt, lenFolkMessage];

const getCalendarDay = (date: Date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const scrollRef = useScrollToTopOnFocus();
  const [typedGreeting, setTypedGreeting] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const user = useAuthStore((state) => state.user);
  const {
    label: subscriptionLabel,
    hasPremiumAccess,
    isLoading: subscriptionLoading,
  } = useCurrentSubscription();
  const { data: lessons } = useGetLessons();
  const { data: courses } = useGetCourses();
  const { data: progressList } = useGetProgressList();
  const { data: streaks, isSuccess: streaksLoaded } = useGetStreaks();
  const createStreak = useCreateStreak();
  const updateStreak = useUpdateStreak();
  const trackedStreakDateRef = React.useRef<string | null>(null);
  const displayName = user?.name?.trim() || 'Bạn';
  const firstName = displayName.split(' ').filter(Boolean).pop() || displayName;
  const avatarSource = user?.avatar
    ? { uri: user.avatar }
    : require('../../assets/images/Profile.png');
  const orderedLessons = React.useMemo(
    () => [...(lessons ?? [])].sort((a, b) => a.order - b.order),
    [lessons],
  );
  const visibleLessons = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orderedLessons;
    return orderedLessons.filter((lesson) =>
      `${lesson.title} ${lesson.description ?? ''}`
        .toLowerCase()
        .includes(query),
    );
  }, [orderedLessons, searchQuery]);
  const canOpenLesson = React.useCallback(
    (lesson?: (typeof orderedLessons)[number]) => {
      if (!lesson) return false;
      const lessonIndex = orderedLessons.findIndex(
        (item) => item._id === lesson._id,
      );
      const previousLesson =
        lessonIndex > 0 ? orderedLessons[lessonIndex - 1] : undefined;
      const previousProgress = progressList?.find(
        (item) => item.lessonId === previousLesson?._id,
      );

      if (previousLesson && previousProgress?.status !== 'completed') {
        return false;
      }

      const course = courses?.find((item) => item._id === lesson.courseId);
      return canAccessLesson(lesson, course, hasPremiumAccess);
    },
    [courses, hasPremiumAccess, orderedLessons, progressList],
  );
  const accessibleLessons = React.useMemo(
    () => orderedLessons.filter((lesson) => canOpenLesson(lesson)),
    [canOpenLesson, orderedLessons],
  );
  const continueProgress =
    progressList?.find((item) => item.status === 'in_progress') ??
    progressList?.find((item) => item.status === 'not_started');
  const continueLesson =
    accessibleLessons.find(
      (lesson) => lesson._id === continueProgress?.lessonId,
    ) ??
    accessibleLessons[0] ??
    orderedLessons[0];
  const currentStreak = streaks?.[0]?.currentStreak ?? 0;
  const longestStreak = streaks?.[0]?.longestStreak ?? 0;
  const totalActiveDays = streaks?.[0]?.totalActiveDays ?? 0;
  const [celebrationStreak, setCelebrationStreak] = React.useState<
    number | null
  >(null);
  const [showStreakDetail, setShowStreakDetail] = React.useState(false);
  const todayLessons = visibleLessons.slice(0, 2);
  // Chỉ những bài có luyện tập mới được dùng cho ôn tập / luyện tự do.
  const practiceableLessons = React.useMemo(
    () =>
      orderedLessons.filter(
        (lesson) =>
          lessonHasPractice(
            getLessonNumberFromTitle(lesson.title) ?? lesson.order,
          ) && canOpenLesson(lesson),
      ),
    [canOpenLesson, orderedLessons],
  );
  const reviewLessons = practiceableLessons.slice(0, 6);
  // Hiển thị 3 mục ôn tập trên màn hình, phần còn lại cuộn ngang.
  // Container cha có px-6 (24px mỗi bên) và khoảng cách 12px giữa các mục.
  const reviewItemWidth =
    (Dimensions.get('window').width - 48 - 24) / 3;
  const freePracticeLesson =
    practiceableLessons.find((lesson) => lesson._id === continueLesson?._id) ??
    practiceableLessons[0];

  React.useEffect(() => {
    if (!isFocused || !user?._id || !streaksLoaded) return;

    const now = new Date();
    const todayKey = `${user._id}:${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    if (trackedStreakDateRef.current === todayKey) return;

    trackedStreakDateRef.current = todayKey;
    const streak = streaks?.[0];

    const trackDailyStreak = async () => {
      try {
        if (!streak) {
          await createStreak.mutateAsync({
            currentStreak: 1,
            longestStreak: 1,
            totalActiveDays: 1,
            lastActiveDate: now.toISOString(),
          });
          return;
        }

        const lastActiveDate = streak.lastActiveDate
          ? new Date(streak.lastActiveDate)
          : null;
        const lastActiveDay =
          lastActiveDate && !Number.isNaN(lastActiveDate.getTime())
            ? getCalendarDay(lastActiveDate)
            : null;
        const today = getCalendarDay(now);
        const daysSinceLastActive =
          lastActiveDay === null
            ? null
            : Math.round((today - lastActiveDay) / 86_400_000);

        if (daysSinceLastActive === 0) return;

        const nextCurrentStreak =
          daysSinceLastActive === 1 ? streak.currentStreak + 1 : 1;

        await updateStreak.mutateAsync({
          id: streak._id,
          currentStreak: nextCurrentStreak,
          longestStreak: Math.max(streak.longestStreak, nextCurrentStreak),
          totalActiveDays: streak.totalActiveDays + 1,
          lastActiveDate: now.toISOString(),
        });
      } catch (error) {
        trackedStreakDateRef.current = null;
        console.log('Error updating daily streak', error);
      }
    };

    trackDailyStreak();
  }, [
    createStreak,
    isFocused,
    streaks,
    streaksLoaded,
    updateStreak,
    user?._id,
  ]);

  // Chúc mừng khi đạt mốc chuỗi (5, 10, 20, 30, ...) — chỉ hiện 1 lần / mốc.
  React.useEffect(() => {
    if (!user?._id || !streaksLoaded) return;
    if (!isStreakMilestone(currentStreak)) return;

    const key = `celebratedStreak:${user._id}`;
    let cancelled = false;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (cancelled) return;
        const lastCelebrated = stored ? Number(stored) : 0;
        if (currentStreak !== lastCelebrated) {
          setCelebrationStreak(currentStreak);
          await AsyncStorage.setItem(key, String(currentStreak));
        }
      } catch {
        // Bỏ qua lỗi đọc/ghi lưu trữ cục bộ.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentStreak, streaksLoaded, user?._id]);

  const openUpgrade = (title?: string) => {
    Alert.alert('Cần mở gói Technique', getUpgradeMessage(title), [
      { text: 'Để sau', style: 'cancel' },
      {
        text: 'Mở gói',
        onPress: () => router.push('/profile/subscription'),
      },
    ]);
  };

  const openLesson = (lessonId?: string) => {
    if (!lessonId) return;
    const lesson = orderedLessons.find((item) => item._id === lessonId);
    if (lesson && !canOpenLesson(lesson)) {
      const lessonIndex = orderedLessons.findIndex(
        (item) => item._id === lessonId,
      );
      const previousLesson =
        lessonIndex > 0 ? orderedLessons[lessonIndex - 1] : undefined;
      const previousProgress = progressList?.find(
        (item) => item.lessonId === previousLesson?._id,
      );

      if (previousLesson && previousProgress?.status !== 'completed') {
        Alert.alert(
          'Chưa thể mở bài',
          `Bạn cần đánh dấu hoàn thành "${previousLesson.title}" trước khi học bài này.`,
        );
      } else {
        openUpgrade(lesson.title);
      }
      return;
    }

    router.push({
      pathname: '/lesson/[id]',
      params: { id: lessonId },
    });
  };

  const openPractice = (lessonId?: string, note?: string) => {
    if (!lessonId) return;
    const lesson = orderedLessons.find((item) => item._id === lessonId);
    if (lesson && !canOpenLesson(lesson)) {
      const lessonIndex = orderedLessons.findIndex(
        (item) => item._id === lessonId,
      );
      const previousLesson =
        lessonIndex > 0 ? orderedLessons[lessonIndex - 1] : undefined;
      const previousProgress = progressList?.find(
        (item) => item.lessonId === previousLesson?._id,
      );

      if (previousLesson && previousProgress?.status !== 'completed') {
        Alert.alert(
          'Chưa thể luyện bài này',
          `Bạn cần đánh dấu hoàn thành "${previousLesson.title}" trước khi tiếp tục.`,
        );
      } else {
        openUpgrade(lesson.title);
      }
      return;
    }

    router.push({
      pathname: '/practice/[lessonId]',
      params: { lessonId, note: note || getRandomPracticeNote().pitch },
    } as any);
  };

  React.useEffect(() => {
    if (!isFocused) {
      setTypedGreeting('');
      return;
    }

    let messageIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const updateTypewriter = () => {
      const currentMessage = typewriterMessages[messageIndex];

      if (isDeleting) {
        characterIndex -= 1;
      } else {
        characterIndex += 1;
      }

      setTypedGreeting(currentMessage.slice(0, characterIndex));

      if (!isDeleting && characterIndex === currentMessage.length) {
        isDeleting = true;
        timeout = setTimeout(updateTypewriter, 1200);
        return;
      }

      if (isDeleting && characterIndex === 0) {
        isDeleting = false;
        messageIndex = (messageIndex + 1) % typewriterMessages.length;
        timeout = setTimeout(updateTypewriter, 350);
        return;
      }

      timeout = setTimeout(updateTypewriter, isDeleting ? 24 : 42);
    };

    timeout = setTimeout(updateTypewriter, 350);
    return () => clearTimeout(timeout);
  }, [isFocused]);

  return (
    <SafeScreen style={{ backgroundColor: '#FDF8EA' }}>
      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-[#FDF8EA]" // Cream/yellow soft base background matching headers
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: '#FDF8EA',
          paddingBottom: 120,
        }}
      >
        <StatusBar style="dark" />

        {/* --- TOP CONTAINER (SOFT CREAM HEADER CARD) --- */}
        <AnimatedBlock
          variant="header"
          className="bg-[#FDF8EA] px-6 pt-2 pb-8 shadow-sm"
        >
          {/* Welcome row */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="relative mr-3">
                <Image
                  source={avatarSource}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: 'white',
                  }}
                  className="shadow"
                />
                {hasPremiumAccess && (
                  <View className="absolute -top-3.5 -left-1.5 rotate-[-36deg] z-10">
                    <MaterialCommunityIcons
                      name="crown"
                      size={20}
                      color="#FFB800"
                    />
                  </View>
                )}
              </View>
              <View className="flex-1 min-w-0">
                <Text
                  className="text-[#525C3D] text-base font-bold"
                  style={{ fontFamily: 'BeVietnamPro-Medium' }}
                >
                  Xin chào, {firstName}
                </Text>
                <Text
                  className="text-gray-500 text-xs mt-0.5"
                  style={{ height: 38 }}
                >
                  {typedGreeting}
                  {' |'}
                </Text>
              </View>
            </View>

            {/* Bell Notifications */}
            <NotificationButton />
          </View>

          {/* Search Input Bar */}
          <View className="w-full flex-row items-center bg-white rounded-full px-5 py-3 shadow-sm border border-gray-100">
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-charcoal text-sm ml-3"
              placeholder="Tìm kiếm"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              className="pl-3 border-l border-gray-150"
              onPress={() => router.push('/(tabs)/courses')}
            >
              <Ionicons name="options-outline" size={20} color="#8E9E6E" />
            </TouchableOpacity>
          </View>
        </AnimatedBlock>

        {/* --- BODY SCRoll AREA (WHITE WRAPPER CONTAINER) --- */}
        <AnimatedBlock
          variant="panel"
          delay={90}
          className="bg-white rounded-[30px] px-6 pt-8 pb-12 -mt-6 flex-1"
        >
          {/* Streak & Goals Block Row */}
          <AnimatedBlock
            variant="card"
            delay={140}
            className="flex-row justify-between gap-4 mb-6"
          >
            {/* Study streak points — chạm để xem chi tiết chuỗi học */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowStreakDetail(true)}
              className="flex-1 bg-[#F3F4F6]/50 rounded-3xl p-4 flex-row items-center"
            >
              <View className="w-10 h-10 justify-center items-center mr-3">
                <LottieView
                  source={require('../../assets/images/flame.json')}
                  autoPlay
                  loop
                  style={{ width: 40, height: 40 }}
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text
                  numberOfLines={1}
                  className="text-charcoal text-xs font-bold"
                  style={{ fontFamily: 'BeVietnamPro-Medium' }}
                >
                  {currentStreak} ngày
                </Text>
                <Text className="text-[12px] text-gray-400 font-bold">
                  Chuỗi học
                </Text>
              </View>
            </TouchableOpacity>

            {/* Goals status */}
            <View className="flex-1 bg-[#8E9E6E]/10 rounded-3xl p-4 flex-row items-center justify-between">
              <View className="min-w-0 flex-1 pr-2">
                <Text
                  numberOfLines={1}
                  className="text-primary text-sm font-extrabold"
                  style={{ fontFamily: 'BeVietnamPro-Medium' }}
                >
                  Hồ sơ
                </Text>

                <View className="flex-row items-center mt-0.5">
                  <MaterialCommunityIcons
                    name="weight-lifter"
                    size={12}
                    color="#8E9E6E"
                  />
                  <Text
                    numberOfLines={1}
                    className="min-w-0 flex-1 text-[12px] text-gray-500 font-bold ml-1"
                  >
                    {subscriptionLoading ? 'Đang tải...' : subscriptionLabel}
                  </Text>
                </View>
              </View>
              <View className="w-10 h-10 rounded-full bg-[#8E9E6E]/20 items-center justify-center">
                <Ionicons name="checkmark-circle" size={22} color="#8E9E6E" />
              </View>
            </View>
          </AnimatedBlock>

          {/* Continue lesson green banner button */}
          <AnimatedBlock variant="button" delay={190}>
            <TouchableOpacity
              activeOpacity={0.95}
              disabled={!continueLesson}
              onPress={() => openLesson(continueLesson?._id)}
              className="w-full bg-[#D6DDC6]/50 py-4.5 px-5 rounded-[24px] flex-row justify-between items-center border border-[#8E9E6E]/20 mb-6"
            >
              <View className="min-w-0 flex-1 flex-row items-center py-2 pr-3">
                <View className="w-12 h-12 rounded-2xl bg-white border border-gray-100 justify-center items-center shadow-sm">
                  <Ionicons name="book" size={22} color="#8E9E6E" />
                </View>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  className="min-w-0 flex-1 text-charcoal text-base font-bold ml-4"
                  style={{ fontFamily: 'BeVietnamPro-Medium' }}
                >
                  {continueLesson?.title || 'Chưa có bài học khả dụng'}
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={22}
                color="#8E9E6E"
                className="animate-arrow-right"
              />
            </TouchableOpacity>
          </AnimatedBlock>

          <AnimatedBlock variant="button" delay={220}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => router.push('/(tabs)/performances')}
              className="w-full bg-[#EAF1DE] py-4.5 px-5 rounded-[24px] flex-row justify-between items-center border border-[#8E9E6E]/25 mb-8"
            >
              <View className="min-w-0 flex-1 flex-row items-center py-2 pr-3">
                <View className="w-12 h-12 rounded-2xl bg-white border border-gray-100 justify-center items-center shadow-sm">
                  <Ionicons name="albums" size={22} color="#8E9E6E" />
                </View>
                <View className="min-w-0 flex-1 ml-4">
                  <Text
                    numberOfLines={1}
                    className="text-charcoal text-base font-bold"
                    style={{ fontFamily: 'BeVietnamPro-Medium' }}
                  >
                    Tác phẩm biểu diễn
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="text-[12px] text-[#687451] mt-0.5"
                  >
                    Xem, mua và luyện theo các tác phẩm đã xuất bản
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={22} color="#8E9E6E" />
            </TouchableOpacity>
          </AnimatedBlock>

          {/* Free Practice with AI Banner */}
          <AnimatedBlock variant="button" delay={210}>
            <TouchableOpacity
              activeOpacity={0.95}
              disabled={!freePracticeLesson}
              onPress={() => openPractice(freePracticeLesson?._id)}
              className="w-full bg-[#FFF9E6] py-4.5 px-5 rounded-[24px] flex-row justify-between items-center border border-[#F4E0AC] mb-8"
            >
              <View className="min-w-0 flex-1 flex-row items-center py-2 pr-3">
                <View className="w-12 h-12 rounded-2xl bg-[#F4E0AC]/40 justify-center items-center shadow-sm">
                  <Ionicons name="sparkles" size={22} color="#7C672D" />
                </View>
                <View className="min-w-0 flex-1 ml-4">
                  <Text
                    numberOfLines={1}
                    className="text-[#4B421F] text-base font-bold"
                    style={{ fontFamily: 'BeVietnamPro-Medium' }}
                  >
                    Luyện tập tự do với AI
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="text-[12px] text-[#7C672D] mt-0.5"
                  >
                    Thổi sáo và nhận đánh giá từ AI ngay lập tức
                  </Text>
                </View>
              </View>
              <Ionicons
                name="arrow-forward"
                size={22}
                color="#7C672D"
                className="animate-arrow-right"
              />
            </TouchableOpacity>
          </AnimatedBlock>

          {/* Ôn tập hôm nay Section */}
          <AnimatedBlock variant="chip" delay={240} className="mb-8">
            <Text
              className="text-lg font-bold text-charcoal mb-4"
              style={{ fontFamily: 'BeVietnamPro-Medium' }}
            >
              Ôn tập hôm nay
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {reviewLessons.map((lesson, index) => (
                <View
                  key={lesson._id}
                  className="items-center"
                  style={{ width: reviewItemWidth }}
                >
                  <TouchableOpacity
                    onPress={() => openPractice(lesson._id)}
                    className="w-14 h-14 rounded-full bg-[#8E9E6E]/15 border border-[#8E9E6E]/20 justify-center items-center mb-2"
                  >
                    {index < 2 ? (
                      <MaterialCommunityIcons
                        name="timer-music-outline"
                        size={24}
                        color="#8E9E6E"
                      />
                    ) : (
                      <Ionicons
                        name="musical-notes-outline"
                        size={22}
                        color="#8E9E6E"
                      />
                    )}
                  </TouchableOpacity>
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    className="text-[12px] text-charcoal font-bold text-center"
                  >
                    {lesson.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </AnimatedBlock>

          {/* Bài học hôm nay Section */}
          <AnimatedBlock variant="hero" delay={290} className="mb-8">
            <Text
              className="text-lg font-bold text-charcoal mb-4"
              style={{ fontFamily: 'BeVietnamPro-Medium' }}
            >
              Bài học hôm nay
            </Text>

            {/* Mascot lesson board card */}
            <View className="w-full bg-[#8E9E6E]/70 rounded-[32px] p-6 relative overflow-visible shadow-sm">
              {/* Peaking mascot in the top right */}
              <Image
                source={require('../../assets/images/mascot_like2.png')}
                style={{
                  width: 110,
                  height: 110,
                  resizeMode: 'contain',
                  position: 'absolute',
                  right: 10,
                  top: -45,
                  zIndex: 10,
                }}
              />

              <View className="flex-row justify-between gap-4 mt-2">
                {todayLessons.map((lesson, index) => (
                  <TouchableOpacity
                    key={lesson._id}
                    activeOpacity={0.9}
                    onPress={() => openLesson(lesson._id)}
                    className="flex-1 bg-[#F8F9FA] rounded-2xl p-4 shadow-sm"
                  >
                    <Text className="text-xs text-gray-400 font-bold mb-1">
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      className="text-charcoal text-sm font-bold leading-5 mb-3"
                      style={{ fontFamily: 'BeVietnamPro-Medium' }}
                    >
                      {lesson.title}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={12} color="gray" />
                      <Text
                        numberOfLines={1}
                        className="min-w-0 flex-1 text-[12px] text-gray-400 ml-1 font-bold"
                      >
                        {Math.max(1, Math.ceil(lesson.duration / 60))} phút
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </AnimatedBlock>

          {/* Lộ trình học tập Grid Section */}
          <AnimatedBlock variant="card" delay={340} className="mb-20">
            <Text
              className="text-lg font-bold text-charcoal mb-4"
              style={{ fontFamily: 'BeVietnamPro-Medium' }}
            >
              Lộ trình học tập
            </Text>

            <View className="gap-4">
              {/* First Row */}
              <View className="flex-row gap-4">
                {/* Nhập môn */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push('/(tabs)/courses')}
                  className="flex-1 bg-[#D6DDC6]/50 p-5 rounded-3xl border border-[#8E9E6E]/20 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <Ionicons
                      name="document-text-outline"
                      size={28}
                      color="#8E9E6E"
                    />
                    <Ionicons name="open-outline" size={18} color="#8E9E6E" />
                  </View>
                  <Text
                    className="text-charcoal text-base font-bold"
                    style={{ fontFamily: 'BeVietnamPro-Medium' }}
                  >
                    Nhập môn
                  </Text>
                </TouchableOpacity>

                {/* Cơ bản */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push('/(tabs)/courses')}
                  className="flex-1 bg-[#D6DDC6]/50 p-5 rounded-3xl border border-[#8E9E6E]/20 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <MaterialCommunityIcons
                      name="book-open-page-variant"
                      size={28}
                      color="#8E9E6E"
                    />
                    <Ionicons name="open-outline" size={18} color="#8E9E6E" />
                  </View>
                  <Text
                    className="text-charcoal text-base font-bold"
                    style={{ fontFamily: 'BeVietnamPro-Medium' }}
                  >
                    Cơ bản
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Second Row (Locked) */}
              <View className="flex-row gap-4">
                {/* Trung cấp (Locked) */}
                <View className="flex-1 bg-[#8E9E6E]/20 p-5 rounded-3xl opacity-80 border border-gray-100 shadow-sm">
                  <View className="flex-row justify-between items-start mb-4">
                    <Ionicons
                      name="musical-note-outline"
                      size={28}
                      color="#8E9E6E"
                    />
                    <Ionicons name="lock-closed" size={18} color="#8E9E6E" />
                  </View>
                  <Text
                    className="text-charcoal text-base font-bold opacity-60"
                    style={{ fontFamily: 'BeVietnamPro-Medium' }}
                  >
                    Trung cấp
                  </Text>
                </View>

                {/* Nâng cao (Locked) */}
                <View className="flex-1 bg-[#8E9E6E]/20 p-5 rounded-3xl opacity-80 border border-gray-100 shadow-sm">
                  <View className="flex-row justify-between items-start mb-4">
                    <Ionicons name="school-outline" size={28} color="#8E9E6E" />
                    <Ionicons name="lock-closed" size={18} color="#8E9E6E" />
                  </View>
                  <Text
                    className="text-charcoal text-base font-bold opacity-60"
                    style={{ fontFamily: 'BeVietnamPro-Medium' }}
                  >
                    Nâng cao
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedBlock>
        </AnimatedBlock>
      </ScrollView>

      <StreakCelebrationModal
        visible={celebrationStreak !== null}
        streak={celebrationStreak ?? currentStreak}
        onClose={() => setCelebrationStreak(null)}
      />
      <StreakDetailModal
        visible={showStreakDetail}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        totalActiveDays={totalActiveDays}
        onClose={() => setShowStreakDetail(false)}
      />
    </SafeScreen>
  );
}
