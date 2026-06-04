import React from "react";
import { Tabs } from "expo-router";
import { View, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View
      style={[
        styles.tabContainer,
        {
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderWidth: 1,
          borderColor: "#F3F4F6",
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
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
        } else if (route.name === "game") {
          iconName = isFocused ? "game-controller" : "game-controller-outline";
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
            {isFocused ? (
              <View
                key={`active-${route.key}`}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#F4E0AC",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Ionicons name={iconName} size={22} color="#8E9E6E" />
              </View>
            ) : (
              <View
                key={`inactive-${route.key}`}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={iconName} size={22} color="#C2C5BA" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Trang chủ" }} />
      <Tabs.Screen name="courses" options={{ title: "Bài học" }} />
      <Tabs.Screen name="game" options={{ title: "Trò chơi" }} />
      <Tabs.Screen name="leaderboard" options={{ title: "Bảng xếp hạng" }} />
      <Tabs.Screen name="profile" options={{ title: "Cá nhân" }} />
    </Tabs>
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
  },
});
