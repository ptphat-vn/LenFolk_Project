import { getApiErrorMessage } from "@/lib/api-error";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Href, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import SafeScreen from "@/components/SafeScreen";
import { useCreatePerformance } from "@/hooks/performance/use-create-performance";
import { useAuthStore } from "@/store/authStore";
import { MobileImageFile } from "@/types/performances.type";

const parseNumber = (value: string) => {
  const normalized = value.replace(/[^\d]/g, "");
  return normalized ? Number(normalized) : 0;
};

export default function CreatePerformanceScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const createPerformance = useCreatePerformance();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState("");
  const [selectedImages, setSelectedImages] = React.useState<MobileImageFile[]>([]);
  const [videoUrl, setVideoUrl] = React.useState("");
  const [genre, setGenre] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [isFree, setIsFree] = React.useState(false);

  const canManage = user?.role === "instructor" || user?.role === "admin";
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Bạn cần cấp quyền truy cập thư viện ảnh để thêm hình tác phẩm.",
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.85,
      });

      if (!result.canceled && result.assets.length > 0) {
        const nextImages = result.assets.map((asset, index) => ({
          uri: asset.uri,
          name:
            asset.fileName ||
            `performance-${Date.now()}-${index}.${asset.uri.split(".").pop() || "jpg"}`,
          type: asset.mimeType || "image/jpeg",
        }));
        setSelectedImages((current) => [...current, ...nextImages].slice(0, 10));
      }
    } catch {
      Alert.alert("Lỗi", "Không thể chọn ảnh từ thư viện");
    }
  };

  const submit = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      Alert.alert("Thiếu tiêu đề", "Vui lòng nhập tên tác phẩm.");
      return;
    }

    const parsedPrice = isFree ? 0 : parseNumber(price);
    if (!isFree && parsedPrice <= 0) {
      Alert.alert("Thiếu giá bán", "Tác phẩm trả phí cần có giá lớn hơn 0.");
      return;
    }

    createPerformance.mutate(
      {
        title: cleanTitle,
        description: description.trim() || undefined,
        thumbnail: thumbnail.trim() || undefined,
        images: selectedImages.length > 0 ? selectedImages : undefined,
        videoUrl: videoUrl.trim() || undefined,
        genre: genre.trim() || undefined,
        duration: duration.trim() ? Number(duration.trim()) * 60 : undefined,
        isFree,
        price: parsedPrice,
        currency: "VND",
        tags: tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
      {
        onSuccess: (response) => {
          Alert.alert(
            "Đã gửi tác phẩm",
            response.message || "Tác phẩm đang chờ admin duyệt.",
            [
              {
                text: "Xem danh sách",
                onPress: () => router.replace("/instructor/performances" as Href),
              },
            ],
          );
        },
        onError: (error: any) => {
          Alert.alert(
            "Không thể tạo tác phẩm",
            getApiErrorMessage(error, "Vui lòng kiểm tra dữ liệu và thử lại."),
          );
        },
      },
    );
  };

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false, title: "Tạo tác phẩm" }} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full bg-white"
            >
              <Ionicons name="arrow-back" size={22} color="#10120C" />
            </TouchableOpacity>
            <Text
              className="text-xl font-bold text-[#10120C]"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              TẠO TÁC PHẨM
            </Text>
            <View className="h-11 w-11" />
          </View>

          {!canManage ? (
            <View className="rounded-[28px] bg-white p-7 items-center">
              <Ionicons name="lock-closed" size={40} color="#8E9E6E" />
              <Text className="mt-3 text-center text-base font-bold text-charcoal">
                Chỉ giảng viên mới tạo được tác phẩm
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              <View className="rounded-[28px] bg-white p-5 border border-gray-100">
                <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
                  Thông tin chính
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Tên tác phẩm"
                  placeholderTextColor="#9CA3AF"
                  className="mb-3 rounded-2xl bg-[#F8F9FA] px-4 py-3 text-sm text-charcoal"
                />
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Mô tả ngắn"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  className="min-h-[110px] rounded-2xl bg-[#F8F9FA] px-4 py-3 text-sm text-charcoal"
                />
              </View>

              <View className="rounded-[28px] bg-white p-5 border border-gray-100">
                <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
                  Media
                </Text>
                <TextInput
                  value={thumbnail}
                  onChangeText={setThumbnail}
                  placeholder="URL ảnh thumbnail (tùy chọn)"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  className="mb-3 rounded-2xl bg-[#F8F9FA] px-4 py-3 text-sm text-charcoal"
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={pickImages}
                  className="mb-3 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-[#8E9E6E] bg-[#E2E8D3] px-4 py-3"
                >
                  <Ionicons name="images-outline" size={18} color="#687451" />
                  <Text className="text-sm font-bold text-[#687451]">
                    {selectedImages.length > 0
                      ? `Đã chọn ${selectedImages.length} ảnh`
                      : "Chọn nhiều ảnh"}
                  </Text>
                </TouchableOpacity>
                {selectedImages.length > 0 && (
                  <View className="mb-3 flex-row flex-wrap gap-2">
                    {selectedImages.map((image, index) => (
                      <View key={`${image.uri}-${index}`} className="relative">
                        <Image
                          source={{ uri: image.uri }}
                          style={{ width: 72, height: 72, borderRadius: 18 }}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() =>
                            setSelectedImages((current) =>
                              current.filter((_, itemIndex) => itemIndex !== index),
                            )
                          }
                          className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-[#10120C]"
                        >
                          <Ionicons name="close" size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                <TextInput
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  placeholder="URL video hoặc YouTube"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  className="rounded-2xl bg-[#F8F9FA] px-4 py-3 text-sm text-charcoal"
                />
              </View>

              <View className="rounded-[28px] bg-white p-5 border border-gray-100">
                <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
                  Phân loại và giá
                </Text>
                <TextInput
                  value={genre}
                  onChangeText={setGenre}
                  placeholder="Thể loại, ví dụ: Dân ca"
                  placeholderTextColor="#9CA3AF"
                  className="mb-3 rounded-2xl bg-[#F8F9FA] px-4 py-3 text-sm text-charcoal"
                />
                <TextInput
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Thời lượng (phút)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="mb-3 rounded-2xl bg-[#F8F9FA] px-4 py-3 text-sm text-charcoal"
                />
                <TextInput
                  value={tags}
                  onChangeText={setTags}
                  placeholder="Tags, cách nhau bằng dấu phẩy"
                  placeholderTextColor="#9CA3AF"
                  className="mb-3 rounded-2xl bg-[#F8F9FA] px-4 py-3 text-sm text-charcoal"
                />
                <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#E2E8D3] px-4 py-3">
                  <View className="min-w-0 flex-1 pr-3">
                    <Text className="text-sm font-bold text-[#4A533B]">
                      Miễn phí
                    </Text>
                    <Text className="text-xs text-[#687451]">
                      Bật nếu không thu phí tác phẩm này
                    </Text>
                  </View>
                  <Switch
                    value={isFree}
                    onValueChange={setIsFree}
                    trackColor={{ false: "#D1D5DB", true: "#8E9E6E" }}
                    thumbColor="white"
                  />
                </View>
                {!isFree && (
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    placeholder="Giá bán VND"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="rounded-2xl bg-[#F8F9FA] px-4 py-3 text-sm text-charcoal"
                  />
                )}
              </View>

              <View className="rounded-[24px] bg-[#FFF7E6] border border-[#FFB800]/30 p-4">
                <Text className="text-xs leading-5 text-[#946200]">
                  Sau khi gửi, tác phẩm của giảng viên sẽ ở trạng thái chờ duyệt.
                  Admin duyệt xong mới xuất hiện trong kho tác phẩm public.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={createPerformance.isPending}
                onPress={submit}
                className="mt-2 flex-row items-center justify-center gap-2 rounded-[24px] bg-[#10120C] px-6 py-5"
              >
                {createPerformance.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
                <Text className="text-base font-bold text-white">
                  Gửi tác phẩm
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

