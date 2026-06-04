import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { Ionicons, Feather } from "@expo/vector-icons";
import { AnimatedBlock } from "@/components/AnimatedPage";
import SafeScreen from "../../components/SafeScreen";

const allLessons = [
  {
    id: 1,
    category: "Cơ bản",
    title: "Bài 1: Làm quen với sáo trúc",
    duration: "5:00",
    status: "completed",
  },
  {
    id: 2,
    category: "Cơ bản",
    title: "Bài 2: Kỹ thuật thổi cơ bản",
    duration: "15:00",
    status: "completed",
  },
  {
    id: 3,
    category: "Cơ bản",
    title: "Bài 3: Luyện tập hơi thở",
    duration: "8:00",
    status: "in_progress",
    progress: 0.6, // 60% progress
  },
  {
    id: 4,
    category: "Cơ bản",
    title: "Bài 4: Lấy hơi cơ bản",
    duration: "8:00",
    status: "not_started",
  },
  {
    id: 5,
    category: "Trung cấp",
    title: "Bài 5: Các nốt cao",
    duration: "15:00",
    status: "not_started",
  },
  {
    id: 6,
    category: "Trung cấp",
    title: "Bài 6: Đi ngón nâng cao",
    duration: "20:00",
    status: "not_started",
  },
  {
    id: 7,
    category: "Trung cấp",
    title: "Bài 7: Rung âm cơ bản",
    duration: "15:00",
    status: "not_started",
  },
  {
    id: 8,
    category: "Trung cấp",
    title: "Bài 8: Đuổi hơi cấp tốc",
    duration: "15:00",
    status: "not_started",
  },
  {
    id: 9,
    category: "Nâng cao",
    title: "Bài 9: Kỹ thuật réo nhạc",
    duration: "15:00",
    status: "not_started",
  },
  {
    id: 10,
    category: "Nâng cao",
    title: "Bài 10: Xử lý tác phẩm",
    duration: "15:00",
    status: "not_started",
  },
  {
    id: 11,
    category: "Nâng cao",
    title: "Bài 11: Biểu diễn sân khấu",
    duration: "15:00",
    status: "not_started",
  },
];

export default function CoursesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Tất cả", "Cơ bản", "Trung cấp", "Nâng cao"];

  // Filter lessons based on category pill and search query
  const filteredLessons = allLessons.filter((lesson) => {
    const matchesFilter = activeFilter === "Tất cả" || lesson.category === activeFilter;
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* --- TOP CONTAINER (CREAM HEADER) --- */}
        <AnimatedBlock className="bg-[#FDF8EA] pt-2 pb-5 px-6">
          {/* Header Navigation Row */}
          <View className="flex-row justify-between items-center mb-6">
            {/* Back Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-gray-100"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#10120C" />
            </TouchableOpacity>

            {/* Center Screen Title */}
            <Text
              className="text-xl font-bold text-charcoal text-center"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              BÀI HỌC
            </Text>

            {/* Green Circle Bell Notification Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full justify-center items-center shadow"
              style={{ backgroundColor: Colors.light.primary }}
            >
              <Ionicons name="notifications" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar Input */}
          <View className="w-full flex-row items-center bg-white rounded-full px-5 py-3 shadow-sm border border-gray-100 mb-2">
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-charcoal text-sm ml-3 py-1"
              placeholder="Tìm kiếm"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity className="pl-3 border-l border-gray-150">
              <Ionicons name="options-outline" size={20} color="#8E9E6E" />
            </TouchableOpacity>
          </View>
        </AnimatedBlock>

        {/* --- CATEGORY SELECTOR TABS ROW --- */}
        <AnimatedBlock delay={90} className="flex-row justify-between mx-6 z-10 -mb-[1px]">
          {categories.map((cat) => {
            const isSelected = activeFilter === cat;
            
            // Apply customized rounded corners to active tab to match the green box's shoulder shape
            let tabStyle: any = {};
            if (isSelected) {
              if (cat === "Tất cả") {
                tabStyle = {
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                };
              } else if (cat === "Nâng cao") {
                tabStyle = {
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                };
              } else {
                tabStyle = {
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                };
              }
            }

            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(cat)}
                className={`py-3.5 items-center justify-center flex-1 ${
                  isSelected ? "bg-[#8E9E6E]" : ""
                }`}
                style={isSelected ? [tabStyle, { borderBottomWidth: 0 }] : {}}
              >
                <Text
                  className={`text-[15px] font-bold ${
                    isSelected ? "text-[#10120C]" : "text-charcoal"
                  }`}
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </AnimatedBlock>

        {/* --- SAGE GREEN CONTAINER FOR LESSONS LIST --- */}
        <AnimatedBlock
          delay={150}
          className="mx-6 bg-[#8E9E6E] pt-8 pb-4 px-5 shadow-sm"
          style={{
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            borderTopLeftRadius: activeFilter === "Tất cả" ? 0 : 20,
            borderTopRightRadius: activeFilter === "Nâng cao" ? 0 : 20,
          }}
        >
          {filteredLessons.length > 0 ? (
            filteredLessons.map((lesson, idx) => (
              <AnimatedBlock key={lesson.id} delay={200 + idx * 45}>
              <TouchableOpacity
                activeOpacity={0.9}
                className="w-full bg-[#E2E8D3] rounded-3xl p-5 mb-4 flex-row items-center justify-between shadow-sm border border-[#D6DDC6]/40"
              >
                {/* Left Column: Icon Status badge + Title & Category */}
                <View className="flex-row items-center flex-1 pr-4 px-2">
                  {/* Status Badge */}
                  <View className="mr-4">
                    {lesson.status === "completed" && (
                      <View className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border-2 border-[#8E9E6E]">
                        <Ionicons name="checkmark" size={20} color="#8E9E6E" />
                      </View>
                    )}
                    {lesson.status === "in_progress" && (
                      <View className="w-10 h-10 rounded-full bg-[#8E9E6E] justify-center items-center shadow-sm">
                        <Ionicons name="pause" size={18} color="white" />
                      </View>
                    )}
                    {lesson.status === "not_started" && (
                      <View className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border-2 border-white">
                        <Ionicons name="play" size={18} color="#8E9E6E" style={{ marginLeft: 3 }} />
                      </View>
                    )}
                  </View>

                  {/* Titles */}
                  <View className="flex-1">
                    <Text className="text-xs text-charcoal/70 font-semibold mb-0.5">
                      {lesson.category}
                    </Text>
                    <Text
                      className="text-[15px] font-bold text-charcoal leading-5"
                      style={{ fontFamily: "BeVietnamPro-Medium" }}
                    >
                      {lesson.title}
                    </Text>

                    {/* Progress bar under title for in_progress status */}
                    {lesson.status === "in_progress" && (
                      <View className="w-full max-w-[180px] h-1.5 bg-white rounded-full mt-2.5 overflow-hidden">
                        <View
                          className="h-full bg-primary"
                          style={{ width: `${(lesson.progress || 0.6) * 100}%`, backgroundColor: Colors.light.primary }}
                        />
                      </View>
                    )}
                  </View>
                </View>

                {/* Right Column: Duration duration */}
                <Text className="text-sm font-bold text-charcoal/90">
                  {lesson.duration}
                </Text>
              </TouchableOpacity>
              </AnimatedBlock>
            ))
          ) : (
            <View className="items-center justify-center py-20 bg-[#E2E8D3] rounded-3xl p-6">
              <Feather name="search" size={32} color="#8E9E6E" className="mb-3" />
              <Text className="text-base font-bold text-charcoal text-center mb-1">
                Không tìm thấy bài học nào
              </Text>
              <Text className="text-xs text-charcoal/60 text-center px-4 leading-4">
                Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc của bạn.
              </Text>
            </View>
          )}
        </AnimatedBlock>
      </ScrollView>
    </SafeScreen>
  );
}
