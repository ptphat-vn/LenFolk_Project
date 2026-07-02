import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import { AnimatedBlock } from "@/components/AnimatedPage";
import NotificationButton from "@/components/NotificationButton";
import { useScrollToTopOnFocus } from "@/hooks/use-scroll-to-top-on-focus";
import { useGetPerformances } from "@/hooks/performance/use-get-performances";

const formatMoney = (amount?: number, currency = "VND") =>
  amount && amount > 0
    ? `${new Intl.NumberFormat("vi-VN").format(amount)}${currency === "VND" ? "đ" : ` ${currency}`}`
    : "Miễn phí";

const getInstructorName = (instructor: unknown) => {
  if (typeof instructor === "object" && instructor && "name" in instructor) {
    return String((instructor as { name?: string }).name || "LenFolk");
  }
  return "LenFolk";
};

export default function PerformancesScreen() {
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const [searchQuery, setSearchQuery] = React.useState("");
  const { data: performances, isLoading } = useGetPerformances({
    status: "published",
    sort: "-isFeatured,-publishedAt,-createdAt",
  });

  const filteredPerformances = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (performances ?? []).filter((item) => {
      if (!query) return true;
      return `${item.title} ${item.description ?? ""} ${item.genre ?? ""} ${item.tags.join(" ")}`
        .toLowerCase()
        .includes(query);
    });
  }, [performances, searchQuery]);

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <AnimatedBlock variant="header" className="bg-[#FDF8EA] pt-2 pb-5 px-6">
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-gray-100"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#10120C" />
            </TouchableOpacity>

            <Text
              className="text-xl font-bold text-charcoal text-center"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              Tác phẩm biểu diễn
            </Text>

            <NotificationButton inverted />
          </View>

          <View className="w-full flex-row items-center bg-white rounded-full px-5 py-3 shadow-sm border border-gray-100">
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-charcoal text-sm ml-3 py-1"
              placeholder="Tìm tác phẩm, thể loại"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              className="pl-3 border-l border-gray-150"
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="options-outline" size={20} color="#8E9E6E" />
            </TouchableOpacity>
          </View>
        </AnimatedBlock>

        <AnimatedBlock variant="panel" delay={90} className="mx-6 rounded-[30px] bg-[#8E9E6E] p-5">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xs font-bold uppercase tracking-wider text-white/70">
                Repertoire
              </Text>
              <Text
                className="text-xl font-bold text-white"
                style={{ fontFamily: "BeVietnamPro-Medium" }}
              >
                Kho tác phẩm biểu diễn
              </Text>
            </View>
            <View className="h-12 w-12 rounded-2xl bg-white/15 items-center justify-center">
              <Ionicons name="musical-notes" size={24} color="white" />
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator color="white" size="large" className="py-12" />
          ) : filteredPerformances.length > 0 ? (
            filteredPerformances.map((item) => (
              <TouchableOpacity
                key={item._id}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/performance/[id]",
                    params: {
                      id: item._id,
                      title: item.title,
                      price: String(item.price || 0),
                      currency: item.currency,
                      thumbnail: item.imageUrls?.[0] || item.thumbnail || "",
                      isFree: item.isFree ? "true" : "false",
                    },
                  } as unknown as Href)
                }
                className="mb-4 overflow-hidden rounded-[26px] bg-[#E2E8D3] border border-white/25"
              >
                {(item.imageUrls?.[0] || item.thumbnail) ? (
                  <Image
                    source={{ uri: item.imageUrls?.[0] || item.thumbnail! }}
                    style={{ width: "100%", height: 150 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-[150px] w-full items-center justify-center bg-[#F4E0AC]">
                    <Ionicons name="albums-outline" size={40} color="#7C672D" />
                  </View>
                )}
                <View className="p-5">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="min-w-0 flex-1">
                      <Text
                        numberOfLines={2}
                        className="text-base font-bold text-[#10120C]"
                        style={{ fontFamily: "BeVietnamPro-Medium" }}
                      >
                        {item.title}
                      </Text>
                      <Text numberOfLines={1} className="mt-1 text-xs font-bold text-[#687451]">
                        {getInstructorName(item.instructorId)}
                        {item.genre ? ` • ${item.genre}` : ""}
                      </Text>
                    </View>
                    <Text numberOfLines={1} className="shrink-0 text-sm font-black text-[#8E9E6E]">
                      {formatMoney(item.isFree ? 0 : item.price, item.currency)}
                    </Text>
                  </View>
                  {!!item.description && (
                    <Text numberOfLines={2} className="mt-3 text-xs leading-5 text-[#55594F]">
                      {item.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center rounded-[26px] bg-[#E2E8D3] p-8">
              <Feather name="search" size={32} color="#8E9E6E" />
              <Text className="mt-3 text-center text-base font-bold text-charcoal">
                Chưa có tác phẩm phù hợp
              </Text>
            </View>
          )}
        </AnimatedBlock>
      </ScrollView>
    </SafeScreen>
  );
}
