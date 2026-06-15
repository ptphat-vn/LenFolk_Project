import React, { useState } from "react";
import { ActivityIndicator, LayoutChangeEvent, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type SlideToConfirmProps = {
  /** Chữ hiển thị trên thanh trượt khi rảnh. */
  label: string;
  /** Chữ hiển thị khi đang xử lý (loading). */
  loadingLabel?: string;
  /** Gọi khi người dùng kéo nút mũi tên tới cuối. */
  onConfirm: () => void;
  /** Đang gọi API → hiện spinner trong nút, khoá thao tác. */
  loading?: boolean;
  /** Khoá thanh trượt (vd thiếu input). */
  disabled?: boolean;
};

const THUMB = 48; // đường kính nút mũi tên (khớp w-12 h-12)
const PADDING = 8; // khoảng đệm 2 bên trong track
const TRACK_HEIGHT = THUMB + PADDING * 2;

export default function SlideToConfirm({
  label,
  loadingLabel,
  onConfirm,
  loading = false,
  disabled = false,
}: SlideToConfirmProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const x = useSharedValue(0);

  const maxX = Math.max(trackWidth - THUMB - PADDING * 2, 0);
  const isLocked = disabled || loading;

  const handleConfirm = () => {
    if (isLocked) return;
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
    onConfirm();
  };

  const pan = Gesture.Pan()
    .enabled(!isLocked && maxX > 0)
    // Chỉ kích hoạt khi kéo ngang sang phải → không nuốt cử chỉ cuộn dọc của ScrollView.
    .activeOffsetX(8)
    .onUpdate((e) => {
      x.value = Math.min(Math.max(e.translationX, 0), maxX);
    })
    .onEnd(() => {
      if (x.value >= maxX - 6) {
        runOnJS(handleConfirm)();
      }
      // Luôn trả nút về đầu: thành công → màn chuyển trang; lỗi/thiếu input → kéo lại được.
      x.value = withSpring(0, { damping: 18, stiffness: 180 });
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity:
      maxX > 0
        ? interpolate(x.value, [0, maxX * 0.55], [1, 0], Extrapolation.CLAMP)
        : 1,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={onLayout}
      className="w-full rounded-full bg-primary shadow-lg shadow-primary/20 justify-center"
      style={{ height: TRACK_HEIGHT, opacity: disabled ? 0.6 : 1 }}
    >
      {/* Nhãn căn giữa, mờ dần khi kéo */}
      <Animated.Text
        pointerEvents="none"
        numberOfLines={1}
        style={[
          {
            textAlign: "center",
            color: "white",
            fontSize: 16,
            fontWeight: "700",
            fontFamily: "BeVietnamPro-Medium",
            paddingLeft: THUMB,
            paddingRight: 12,
          },
          labelStyle,
        ]}
      >
        {loading ? loadingLabel ?? label : label}
      </Animated.Text>

      {/* Nút mũi tên kéo được */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              position: "absolute",
              left: PADDING,
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
            },
            thumbStyle,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#8E9E6E" />
          ) : (
            <Ionicons name="arrow-forward" size={22} color="#8E9E6E" />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
