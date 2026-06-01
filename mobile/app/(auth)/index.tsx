import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import gsap from "gsap";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const splashMotion = useRef({ y: 28, scale: 0.9, opacity: 0 });
  const [mascotStyle, setMascotStyle] = useState({
    transform: [{ translateY: 28 }, { scale: 0.9 }],
    opacity: 0,
  });

  useEffect(() => {
    if (slide !== 0) return;

    const syncStyle = () => {
      setMascotStyle({
        transform: [
          { translateY: splashMotion.current.y },
          { scale: splashMotion.current.scale },
        ],
        opacity: splashMotion.current.opacity,
      });
    };

    const timeline = gsap.timeline();

    timeline.to(splashMotion.current, {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.95,
      ease: "power3.out",
      onUpdate: syncStyle,
    });

    timeline.to(splashMotion.current, {
      y: -14,
      duration: 1.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      onUpdate: syncStyle,
    });

    return () => {
      timeline.kill();
      gsap.killTweensOf(splashMotion.current);
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

      {/* --- SLIDE 0: SPLASH INTRO --- */}
      {slide === 0 && (
        <View className="flex-1 justify-between bg-[#F8F9FA]">
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

            <Image
              source={require("../../assets/images/mascot 3d.png")}
              style={[
                { width: width * 0.85, height: width * 0.85, resizeMode: "contain" },
                mascotStyle,
              ]}
            />
          </View>

          {/* Bottom Card */}
          <View
            className="rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl bg-accent"
            style={{ minHeight: "45%" }}
          >
            {/* Logo */}
            <Text
              className="text-5xl font-bold text-charcoal tracking-wide mb-5"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              LenFolk
            </Text>

            {/* Description */}
            <Text className="text-base text-charcoal/80 leading-7 mb-8">
              Nền tảng học sáo trúc thông minh cùng AI. Lenfolk giúp bạn luyện sáo dễ dàng với lộ trình cá nhân hóa cùng AI hỗ trợ theo dõi và phản hồi tức thì.
            </Text>

            {/* Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              className="w-full bg-[#8E9E6E] py-5 rounded-[24px] items-center justify-center shadow-lg shadow-black/10 active:opacity-95 mt-12"
              onPress={nextSlide}
            >
              <Text
                className="text-white text-base font-bold tracking-wider"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                KHÁM PHÁ NGAY
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* --- SLIDES 1, 2, 3: ONBOARDING PAGES --- */}
      {(slide === 1 || slide === 2 || slide === 3) && (
        <View className="flex-1 justify-between bg-white pt-14 pb-16 px-6">
          {/* Top Indicator Dots */}
          <View className="flex-row gap-2 px-2">
            <View className={`h-2.5 w-2.5 rounded-full ${slide === 1 ? "bg-primary w-5" : "bg-gray-200"}`} />
            <View className={`h-2.5 w-2.5 rounded-full ${slide === 2 ? "bg-primary w-5" : "bg-gray-200"}`} />
            <View className={`h-2.5 w-2.5 rounded-full ${slide === 3 ? "bg-primary w-5" : "bg-gray-200"}`} />
          </View>

          {/* Image & Decorative Background Wave */}
          <View className="flex-1 justify-center items-center relative my-4">
            <View
              className="absolute w-72 h-72 rounded-full bg-accent/20 -z-10"
              style={{ top: "15%", left: "5%" }}
            />
            {slide === 1 && (
              <Image
                source={require("../../assets/images/index-1.png")}
                style={{ width: width * 1.3, height: width * 1.3, resizeMode: "contain" }}
              />
            )}
            {slide === 2 && (
              <Image
                source={require("../../assets/images/index-2.png")}
                style={{ width: width * 1.3, height: width * 1.3, resizeMode: "contain" }}
              />
            )}
            {slide === 3 && (
              <Image
                source={require("../../assets/images/index-3.png")}
                style={{ width: width * 1.3, height: width * 1.3, resizeMode: "contain" }}
              />
            )}
          </View>

          {/* Typography Text Details */}
          <View className="items-center px-4 mb-8">
            {slide === 1 && (
              <>
                <Text
                  className="text-3xl font-extrabold text-primary text-center leading-10 mb-4"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Học online{"\n"}Mở tương lai
                </Text>
                <Text className="text-sm text-gray-500 text-center leading-6 px-2">
                  Trải nghiệm học tập linh hoạt với lớp học online và bài giảng quay sẵn chất lượng.
                </Text>
              </>
            )}
            {slide === 2 && (
              <>
                <Text
                  className="text-3xl font-extrabold text-primary text-center leading-10 mb-4"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  Học mọi nơi{"\n"}Vươn mọi tầm
                </Text>
                <Text className="text-sm text-gray-500 text-center leading-6 px-2">
                  Dễ dàng học mọi lúc, mọi nơi với phương pháp hiện đại giúp bạn phát triển toàn diện cho tương lai.
                </Text>
              </>
            )}
            {slide === 3 && (
              <>
                <Text
                  className="text-3xl font-extrabold text-primary text-center leading-10 mb-4"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  AI đồng hành{"\n"}Tiến bộ nhanh
                </Text>
                <Text className="text-sm text-gray-500 text-center leading-6 px-2">
                  Hệ thống phân tích thông minh giúp bạn đánh giá hiệu suất, theo dõi tiến độ và tối ưu hành trình học tập hiệu quả hơn.
                </Text>
              </>
            )}
          </View>

          {/* Circle Next Button */}
          <View className="items-center">
            <TouchableOpacity
              activeOpacity={0.8}
              className="w-16 h-16 rounded-full bg-primary justify-center items-center shadow-lg shadow-primary/40"
              onPress={nextSlide}
            >
              <Ionicons name="arrow-forward" size={26} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* --- SLIDE 4: AUTH WELCOME LANDING --- */}
      {slide === 4 && (
        <View className="flex-1 justify-between bg-accent pt-10">
          {/* Mascot Top Header Popping Up */}
          <View className="flex-1 justify-center items-center relative">
            <View className="w-72 h-72 rounded-full bg-white border border-white/50 absolute shadow-2xl shadow-black/5" />
            <Image
              source={require("../../assets/images/mascot_like2.png")}
              style={{ width: width * 0.80, height: width * 0.80, resizeMode: "contain", zIndex: 10, marginBottom: 0 }}
            />
          </View>

          {/* White Bottom Container Card */}
          <View
            className="bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl"
            style={{ minHeight: "55%" }}
          >
            {/* Title */}
            <Text
              className="text-3xl font-bold text-primary text-center mb-8"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Chào mừng bạn
            </Text>

            {/* Social Buttons Stack */}
            <View className="gap-4 mb-6">
              {/* Google Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                className="w-full bg-white py-4 px-6 rounded-2xl flex-row justify-center items-center border border-gray-100 shadow-sm"
              >
                <Image
                  source={require("../../assets/images/Google.png")}
                  style={{ width: 22, height: 22, marginRight: 12, resizeMode: "contain" }}
                />
                <Text className="text-charcoal text-base font-semibold">
                  Tiếp tục với Google
                </Text>
              </TouchableOpacity>

              {/* Apple Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                className="w-full bg-white py-4 px-6 rounded-2xl flex-row justify-center items-center border border-gray-100 shadow-sm"
              >
                <Image
                  source={require("../../assets/images/Apple.png")}
                  style={{ width: 22, height: 22, marginRight: 12, resizeMode: "contain" }}
                />
                <Text className="text-charcoal text-base font-semibold">
                  Tiếp tục với Apple
                </Text>
              </TouchableOpacity>
            </View>

            {/* Separator Or */}
            <View className="flex-row justify-center items-center mb-6">
              <View className="flex-1 h-[1px] bg-gray-100" />
              <Text className="mx-4 text-sm text-gray-400 font-medium">( Hoặc )</Text>
              <View className="flex-1 h-[1px] bg-gray-100" />
            </View>

            {/* Email Login Custom Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              className="w-full bg-primary pl-6 pr-2 py-2.5 rounded-full flex-row justify-between items-center shadow-md shadow-primary/20 mb-8"
              onPress={() => router.push("/login")}
            >
              <Text
                className="text-white text-base font-bold"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Đăng nhập bằng tài khoản của bạn
              </Text>
              <View className="w-12 h-12 rounded-full bg-white justify-center items-center">
                <Ionicons name="arrow-forward" size={22} color="#8E9E6E" />
              </View>
            </TouchableOpacity>

            {/* Footer Link */}
            <View className="flex-row justify-center mt-2">
              <Text className="text-sm text-gray-500">Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text
                  className="text-sm font-bold text-primary"
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  ĐĂNG KÝ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
