import * as Haptics from "expo-haptics";
import { Href, usePathname, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

const TAB_ROUTES = [
  { segment: "/", href: "/(tabs)" },
  { segment: "/courses", href: "/(tabs)/courses" },
  { segment: "/game", href: "/(tabs)/game" },
  { segment: "/leaderboard", href: "/(tabs)/leaderboard" },
  { segment: "/profile", href: "/(tabs)/profile" },
] as const;

const SWIPE_DISTANCE = 72;
const SWIPE_VELOCITY = 650;

const getCurrentTabIndex = (pathname: string) => {
  const matchedIndex = TAB_ROUTES.findIndex(
    ({ segment }) => segment !== "/" && pathname.endsWith(segment),
  );

  return matchedIndex >= 0 ? matchedIndex : 0;
};

export function SwipeableTabShell({
  children,
}: React.PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();

  const changeTab = React.useCallback(
    (direction: -1 | 1) => {
      const currentIndex = getCurrentTabIndex(pathname);
      const nextIndex = currentIndex + direction;

      if (nextIndex < 0 || nextIndex >= TAB_ROUTES.length) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => undefined);
        return;
      }

      Haptics.selectionAsync().catch(() => undefined);
      router.replace(TAB_ROUTES[nextIndex].href as Href);
    },
    [pathname, router],
  );

  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-32, 32])
        .failOffsetY([-24, 24])
        .onEnd((event) => {
          const isLeftSwipe =
            event.translationX <= -SWIPE_DISTANCE ||
            event.velocityX <= -SWIPE_VELOCITY;
          const isRightSwipe =
            event.translationX >= SWIPE_DISTANCE ||
            event.velocityX >= SWIPE_VELOCITY;

          if (isLeftSwipe) {
            runOnJS(changeTab)(1);
          } else if (isRightSwipe) {
            runOnJS(changeTab)(-1);
          }
        }),
    [changeTab],
  );

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1 }}>{children}</View>
    </GestureDetector>
  );
}
