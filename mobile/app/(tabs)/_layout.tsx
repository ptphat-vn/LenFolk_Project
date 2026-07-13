import React from "react";
import { Redirect, Tabs } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useAuthStore } from "@/store/authStore";
import * as Haptics from "expo-haptics";
import { SwipeableTabShell } from "@/components/swipeable-tab-shell";

function CustomTabBar({ state, descriptors, navigation }: any) {
  const [itemWidth, setItemWidth] = React.useState(0);
  const indicatorX = useSharedValue(0);
  const visibleRoutes = state.routes.filter(
    (route: any) => route.name !== "performances",
  );
  const activeRouteKey = state.routes[state.index]?.key;
  const activeVisibleIndex = visibleRoutes.findIndex(
    (route: any) => route.key === activeRouteKey,
  );

  React.useEffect(() => {
    if (itemWidth === 0 || activeVisibleIndex < 0) {
      return;
    }

    indicatorX.value = withSpring(activeVisibleIndex * itemWidth, {
      damping: 22,
      stiffness: 220,
      mass: 0.7,
      overshootClamping: false,
    });
  }, [activeVisibleIndex, indicatorX, itemWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      onLayout={(event) => {
        setItemWidth(
          (event.nativeEvent.layout.width - styles.tabContainer.paddingHorizontal * 2) /
            visibleRoutes.length,
        );
      }}
      style={[
        styles.tabContainer,
        {
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderWidth: 1,
          borderColor: "#F3F4F6",
        },
      ]}
    >
      {itemWidth > 0 && activeVisibleIndex >= 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeIndicatorSlot,
            { width: itemWidth },
            indicatorStyle,
          ]}
        >
          <View style={styles.activeIndicator} />
        </Animated.View>
      )}

      {visibleRoutes.map((route: any) => {
        const index = state.routes.findIndex((item: any) => item.key === route.key);
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          Haptics.selectionAsync().catch(() => undefined);
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => undefined,
          );
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // Resolve icon name based on active status and route
        let iconName: any = "home-outline";
        if (route.name === "index") {
          iconName = isFocused ? "home" : "home-outline";
        } else if (route.name === "courses") {
          iconName = isFocused ? "book" : "book-outline";
        } else if (route.name === "practice") {
          iconName = isFocused ? "musical-notes" : "musical-notes-outline";
        } else if (route.name === "leaderboard") {
          iconName = isFocused ? "trophy" : "trophy-outline";
        } else if (route.name === "profile") {
          iconName = isFocused ? "person" : "person-outline";
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.8}
          >
            <View style={styles.iconSlot}>
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? "#8E9E6E" : "#C2C5BA"}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { user, token, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return null;
  }

  if (!user || !token) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <SwipeableTabShell>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: "shift",
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Trang chủ" }} />
        <Tabs.Screen name="courses" options={{ title: "Bài học" }} />
        <Tabs.Screen
          name="performances"
          options={{ title: "Tác phẩm", href: null }}
        />
        <Tabs.Screen name="practice" options={{ title: "Luyện tập" }} />
        <Tabs.Screen name="leaderboard" options={{ title: "Bảng xếp hạng" }} />
        <Tabs.Screen name="profile" options={{ title: "Cá nhân" }} />
      </Tabs>
    </SwipeableTabShell>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    shadowColor: "#10120C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 1,
  },
  iconSlot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicatorSlot: {
    position: "absolute",
    left: 8,
    top: 10,
    height: 48,
    alignItems: "center",
  },
  activeIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F4E0AC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});
