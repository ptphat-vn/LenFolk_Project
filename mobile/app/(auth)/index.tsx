import { AnimatedBlock } from '@/components/AnimatedPage';
import SlideToConfirm from '@/components/SlideToConfirm';
import { getOnboardingRoute } from '@/constants/onboarding';
import {
  isAppleCancelled,
  useAppleLogin,
} from '@/hooks/auth/use-apple-login';
import {
  isGoogleCancelled,
  useGoogleLogin,
} from '@/hooks/auth/use-google-login';
import { getApiErrorMessage } from '@/lib/api-error';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Trên iPad, giới hạn bề rộng dùng để tính kích thước minh hoạ/mascot
// để hình không phóng to quá mức trên màn hình lớn.
const width = Math.min(Dimensions.get('window').width, 480);

export default function OnboardingScreen() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const googleLoginMutation = useGoogleLogin();
  const appleLoginMutation = useAppleLogin();
  const mascotY = useSharedValue(28);

  const handleAppleLogin = () => {
    appleLoginMutation.mutate(undefined, {
      onSuccess: (data) => {
        router.replace(getOnboardingRoute(data.user) || '/(tabs)');
      },
      onError: (error) => {
        if (isAppleCancelled(error)) return; // người dùng tự huỷ, không báo lỗi
        Alert.alert(
          'Đăng nhập Apple thất bại',
          getApiErrorMessage(error, 'Không thể đăng nhập bằng Apple. Vui lòng thử lại.'),
        );
      },
    });
  };

  const handleGoogleLogin = () => {
    googleLoginMutation.mutate(undefined, {
      onSuccess: (data) => {
        router.replace(getOnboardingRoute(data.user) || '/(tabs)');
      },
      onError: (error) => {
        if (isGoogleCancelled(error)) return; // người dùng tự huỷ, không báo lỗi
        Alert.alert(
          'Đăng nhập Google thất bại',
          getApiErrorMessage(error, 'Không thể đăng nhập bằng Google. Vui lòng thử lại.'),
        );
      },
    });
  };
  const mascotScale = useSharedValue(0.9);
  const mascotOpacity = useSharedValue(0);

  const mascotStyle = useAnimatedStyle(() => ({
    opacity: mascotOpacity.value,
    transform: [{ translateY: mascotY.value }, { scale: mascotScale.value }],
  }));

  useEffect(() => {
    if (slide !== 0) return;

    mascotScale.value = withTiming(1, {
      duration: 950,
      easing: Easing.out(Easing.cubic),
    });
    mascotOpacity.value = withTiming(1, {
      duration: 950,
      easing: Easing.out(Easing.cubic),
    });
    mascotY.value = withSequence(
      withTiming(0, { duration: 950, easing: Easing.out(Easing.cubic) }),
      withRepeat(
        withTiming(-14, {
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );

    return () => {
      cancelAnimation(mascotY);
      cancelAnimation(mascotScale);
      cancelAnimation(mascotOpacity);
    };
  }, [slide]);

  const nextSlide = () => {
    if (slide < 4) {
      setSlide(slide + 1);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* --- SKIP (top-right) — chỉ là chữ, không viền nút --- */}
      {slide < 4 && (
        <TouchableOpacity
          activeOpacity={0.6}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => setSlide(4)}
          className="absolute top-14 right-6 z-50"
        >
          <Text
            className="text-sm font-semibold text-charcoal/60"
            style={{ fontFamily: 'BeVietnamPro-Medium' }}
          >
            Bỏ qua
          </Text>
        </TouchableOpacity>
      )}

      {/* --- SLIDE 0: SPLASH INTRO --- */}
      {slide === 0 && (
        <AnimatedBlock
          key="slide-0"
          variant="slideRight"
          className="flex-1 justify-between bg-[#F8F9FA]"
        >
          {/* Top Graphic Area */}
          <View className="flex-1 justify-center items-center relative px-6">
            {/* Music notes decorations */}
            <View className="absolute top-[20%] right-[15%] rotate-[15deg]">
              <FontAwesome5 name="music" size={24} color="#8E9E6E" />
            </View>
            <View className="absolute top-[35%] left-[10%] rotate-[-10deg]">
              <FontAwesome5 name="music" size={18} color="#F4E0AC" />
            </View>
            <View className="absolute bottom-[20%] right-[12%] rotate-[-5deg]">
              <FontAwesome5 name="music" size={16} color="#8E9E6E" />
            </View>
            <View className="absolute bottom-[10%] left-[25%] rotate-[20deg]">
              <FontAwesome5 name="music" size={22} color="#F4E0AC" />
            </View>

            <Animated.Image
              source={require('../../assets/images/mascot_3d.png')}
              style={[
                {
                  width: width * 0.85,
                  height: width * 0.85,
                  resizeMode: 'contain',
                },
                mascotStyle,
              ]}
            />
          </View>

          {/* Bottom Card */}
          <AnimatedBlock
            variant="card"
            delay={120}
            className="rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl bg-accent"
            style={{ minHeight: '45%' }}
          >
            {/* Logo */}
            <Text
              className="text-5xl font-bold text-charcoal tracking-wide mb-5"
              style={{ fontFamily: 'BeVietnamPro-Medium' }}
            >
              LenFolk
            </Text>

            {/* Description */}
            <Text className="text-base text-charcoal/80 leading-7 mb-8">
              Nền tảng học sáo trúc thông minh cùng AI. Lenfolk giúp bạn luyện
              sáo dễ dàng với lộ trình cá nhân hóa cùng AI hỗ trợ theo dõi và
              phản hồi tức thì.
            </Text>

            {/* Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              className="w-full bg-[#8E9E6E] py-5 rounded-[24px] items-center justify-center shadow-lg shadow-black/10 active:opacity-95 mt-12"
              onPress={nextSlide}
            >
              <Text
                className="text-white text-base font-bold tracking-wider"
                style={{ fontFamily: 'BeVietnamPro-Medium' }}
              >
                KHÁM PHÁ NGAY
              </Text>
            </TouchableOpacity>
          </AnimatedBlock>
        </AnimatedBlock>
      )}

      {/* --- SLIDES 1, 2, 3: ONBOARDING PAGES --- */}
      {(slide === 1 || slide === 2 || slide === 3) && (
        <AnimatedBlock
          key={`slide-${slide}`}
          variant="slideRight"
          className="flex-1 justify-between bg-white pt-14 pb-16 px-6"
        >
          {/* Top Indicator Dots */}
          <View className="flex-row gap-2 px-2">
            <View
              className={`h-2.5 w-2.5 rounded-full ${slide === 1 ? 'bg-primary w-5' : 'bg-gray-200'}`}
            />
            <View
              className={`h-2.5 w-2.5 rounded-full ${slide === 2 ? 'bg-primary w-5' : 'bg-gray-200'}`}
            />
            <View
              className={`h-2.5 w-2.5 rounded-full ${slide === 3 ? 'bg-primary w-5' : 'bg-gray-200'}`}
            />
          </View>

          {/* Image & Decorative Background Wave */}
          <AnimatedBlock
            variant="hero"
            delay={80}
            className="flex-1 justify-center items-center relative my-4"
          >
            <View
              className="absolute w-72 h-72 rounded-full bg-accent/20 -z-10"
              style={{ top: '15%', left: '5%' }}
            />
            {slide === 1 && (
              <Image
                source={require('../../assets/images/index-1.png')}
                style={{
                  width: width * 1.3,
                  height: width * 1.3,
                  resizeMode: 'contain',
                }}
              />
            )}
            {slide === 2 && (
              <Image
                source={require('../../assets/images/index-2.png')}
                style={{
                  width: width * 1.3,
                  height: width * 1.3,
                  resizeMode: 'contain',
                }}
              />
            )}
            {slide === 3 && (
              <Image
                source={require('../../assets/images/index-3.png')}
                style={{
                  width: width * 1.3,
                  height: width * 1.3,
                  resizeMode: 'contain',
                }}
              />
            )}
          </AnimatedBlock>

          {/* Typography Text Details */}
          <AnimatedBlock
            variant="card"
            delay={150}
            className="items-center px-4 mb-8"
          >
            {slide === 1 && (
              <>
                <Text
                  className="text-3xl font-extrabold text-primary text-center leading-10 mb-4"
                  style={{ fontFamily: 'BeVietnamPro-Medium' }}
                >
                  Học online{'\n'}Mở tương lai
                </Text>
                <Text className="text-sm text-gray-500 text-center leading-6 px-2">
                  Trải nghiệm học tập linh hoạt với lớp học online và bài giảng
                  quay sẵn chất lượng.
                </Text>
              </>
            )}
            {slide === 2 && (
              <>
                <Text
                  className="text-3xl font-extrabold text-primary text-center leading-10 mb-4"
                  style={{ fontFamily: 'BeVietnamPro-Medium' }}
                >
                  Học mọi nơi{'\n'}Vươn mọi tầm
                </Text>
                <Text className="text-sm text-gray-500 text-center leading-6 px-2">
                  Dễ dàng học mọi lúc, mọi nơi với phương pháp hiện đại giúp bạn
                  phát triển toàn diện cho tương lai.
                </Text>
              </>
            )}
            {slide === 3 && (
              <>
                <Text
                  className="text-3xl font-extrabold text-primary text-center leading-10 mb-4"
                  style={{ fontFamily: 'BeVietnamPro-Medium' }}
                >
                  AI đồng hành{'\n'}Tiến bộ nhanh
                </Text>
                <Text className="text-sm text-gray-500 text-center leading-6 px-2">
                  Hệ thống phân tích thông minh giúp bạn đánh giá hiệu suất,
                  theo dõi tiến độ và tối ưu hành trình học tập hiệu quả hơn.
                </Text>
              </>
            )}
          </AnimatedBlock>

          {/* Circle Next Button */}
          <AnimatedBlock variant="button" delay={220} className="items-center">
            <TouchableOpacity
              activeOpacity={0.8}
              className="w-16 h-16 rounded-full bg-primary justify-center items-center shadow-lg shadow-primary/40"
              onPress={nextSlide}
            >
              <Ionicons
                name="arrow-forward"
                size={26}
                color="white"
                className="animate-arrow-right"
              />
            </TouchableOpacity>
          </AnimatedBlock>
        </AnimatedBlock>
      )}

      {/* --- SLIDE 4: AUTH WELCOME LANDING --- */}
      {slide === 4 && (
        <AnimatedBlock
          key="slide-4"
          variant="slideRight"
          className="flex-1 justify-between bg-accent pt-10"
        >
          {/* Mascot Top Header Popping Up */}
          <AnimatedBlock
            variant="hero"
            delay={80}
            className="flex-1 justify-center items-center relative"
          >
            <View className="w-72 h-72 rounded-full bg-white border border-white/50 absolute shadow-2xl shadow-black/5" />
            <Image
              source={require('../../assets/images/mascot_like2.png')}
              style={{
                width: width * 0.8,
                height: width * 0.8,
                resizeMode: 'contain',
                zIndex: 10,
                marginBottom: 0,
              }}
            />
          </AnimatedBlock>

          {/* White Bottom Container Card */}
          <AnimatedBlock
            variant="card"
            delay={140}
            className="bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl"
            style={{ minHeight: '55%' }}
          >
            {/* Giới hạn bề rộng form trên màn hình lớn (iPad) */}
            <View className="w-full max-w-[480px] self-center">
            {/* Title */}
            <Text
              className="text-3xl font-bold text-primary text-center mb-8"
              style={{ fontFamily: 'BeVietnamPro-Medium' }}
            >
              Chào mừng bạn đến với LenFolk!
            </Text>

            {/* Social Buttons Stack */}
            <View className="gap-4 mb-6 ">
              {/* Google Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={googleLoginMutation.isPending}
                onPress={handleGoogleLogin}
                className="w-full bg-white py-4 px-6 rounded-[35px] flex-row justify-center items-center border border-gray-200 shadow-sm"
              >
                {googleLoginMutation.isPending ? (
                  <ActivityIndicator size="small" color="#8E9E6E" />
                ) : (
                  <>
                    <Image
                      source={require('../../assets/images/logo_google.png')}
                      style={{
                        width: 22,
                        height: 22,
                        marginRight: 12,
                        resizeMode: 'contain',
                      }}
                    />
                    <Text className="text-charcoal text-base font-semibold">
                      Tiếp tục với Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Apple Button — bắt buộc trên iOS khi có đăng nhập bên thứ ba (Guideline 4.8) */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={appleLoginMutation.isPending}
                  onPress={handleAppleLogin}
                  className="w-full bg-black py-4 px-6 rounded-[35px] flex-row justify-center items-center shadow-sm"
                >
                  {appleLoginMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons
                        name="logo-apple"
                        size={24}
                        color="#FFFFFF"
                        style={{ marginRight: 12, marginTop: -2 }}
                      />
                      <Text className="text-white text-base font-semibold">
                        Tiếp tục với Apple
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Separator Or */}
            <View className="flex-row justify-center items-center mb-6">
              <View className="flex-1 h-[1px] bg-gray-100" />
              <Text className="mx-4 text-sm text-gray-400 font-medium">
                ( Hoặc )
              </Text>
              <View className="flex-1 h-[1px] bg-gray-100" />
            </View>

            {/* Email Login — trượt mũi tên để vào màn đăng nhập */}
            <View className="mb-8">
              <SlideToConfirm
                label="Trượt để đăng nhập"
                onConfirm={() => router.push('/login')}
              />
            </View>

            {/* Footer Link */}
            <View className="flex-row justify-center mt-2">
              <Text className="text-sm text-gray-500">Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text
                  className="text-sm font-bold text-primary"
                  style={{ fontFamily: 'BeVietnamPro-Medium' }}
                >
                  ĐĂNG KÝ
                </Text>
              </TouchableOpacity>
            </View>
            </View>
          </AnimatedBlock>
        </AnimatedBlock>
      )}
    </View>
  );
}
