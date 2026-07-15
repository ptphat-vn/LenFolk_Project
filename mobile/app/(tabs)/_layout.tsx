import { SwipeableTabShell } from '@/components/swipeable-tab-shell';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Nhãn ngắn + icon cho từng tab (label ngắn để vừa 1 dòng ở font nhỏ).
const TAB_META: Record<string, { label: string; icon: any; iconActive: any }> =
  {
    index: { label: 'Trang chủ', icon: 'home-outline', iconActive: 'home' },
    courses: { label: 'Bài học', icon: 'book-outline', iconActive: 'book' },
    practice: {
      label: 'Luyện tập',
      icon: 'musical-notes-outline',
      iconActive: 'musical-notes',
    },
    leaderboard: {
      label: 'Xếp hạng',
      icon: 'trophy-outline',
      iconActive: 'trophy',
    },
    profile: { label: 'Cá nhân', icon: 'person-outline', iconActive: 'person' },
  };

const ACTIVE_COLOR = '#8E9E6E';
const INACTIVE_COLOR = '#6B7A5E';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter(
    (route: any) => route.name !== 'performances',
  );

  return (
    <View style={[styles.tabContainer, { bottom: insets.bottom + 8 }]}>
      {visibleRoutes.map((route: any) => {
        const index = state.routes.findIndex(
          (item: any) => item.key === route.key,
        );
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const meta = TAB_META[route.name] ?? TAB_META.index;

        const onPress = () => {
          Haptics.selectionAsync().catch(() => undefined);
          const event = navigation.emit({
            type: 'tabPress',
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
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        if (route.name === 'practice') {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={meta.label}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.fabButton}
              activeOpacity={0.85}
            >
              <View style={[styles.fab, isFocused && styles.fabActive]}>
                <Ionicons
                  name={isFocused ? meta.iconActive : meta.icon}
                  size={28}
                  color="#FFFFFF"
                />
              </View>
              <Text
                style={[styles.label, styles.labelActive]}
                numberOfLines={1}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        }

        // Tab thường: active = icon tô đậm + đổi màu + chữ đậm (không dùng khối tròn).
        const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={meta.label}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFocused ? meta.iconActive : meta.icon}
              size={23}
              color={color}
            />
            <Text
              style={[styles.label, { color }, isFocused && styles.labelActive]}
              numberOfLines={1}
            >
              {meta.label}
            </Text>
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
          animation: 'shift',
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Trang chủ' }} />
        <Tabs.Screen name="courses" options={{ title: 'Bài học' }} />
        <Tabs.Screen
          name="performances"
          options={{ title: 'Tác phẩm', href: null }}
        />
        <Tabs.Screen name="practice" options={{ title: 'Luyện tập' }} />
        <Tabs.Screen name="leaderboard" options={{ title: 'Bảng xếp hạng' }} />
        <Tabs.Screen name="profile" options={{ title: 'Cá nhân' }} />
      </Tabs>
    </SwipeableTabShell>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    position: 'absolute',
    left: 20,
    right: 20,
    // bottom được set động = safe area + 8
    height: 66,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1,
    borderColor: '#EFF1EA',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    overflow: 'visible',
    shadowColor: '#10120C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  // Tab thường: chia đều 2 bên, mỗi bên 2 item (FAB ở giữa chiếm chỗ cố định).
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 3,
  },
  // Khối FAB giữa: rộng cố định để chừa "khoảng trống giữa" → không ăn vào icon lân cận.
  fabButton: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 3,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: ACTIVE_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30, // nhô hẳn lên trên bar (nổi, không đè lấp lửng)
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
  },
  fabActive: {
    backgroundColor: '#7C8B5E', // đậm hơn 1 chút khi đang ở tab này
  },
  label: {
    fontSize: 10,
    fontFamily: 'BeVietnamPro-Medium',
    color: INACTIVE_COLOR,
  },
  labelActive: {
    color: ACTIVE_COLOR,
    fontWeight: '700',
  },
});
