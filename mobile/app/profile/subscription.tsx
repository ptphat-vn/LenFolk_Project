import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import SafeScreen from "@/components/SafeScreen";
import { useGetCourses } from "@/hooks/course/use-get-courses";
import { usePurchaseCourse } from "@/hooks/course/use-purchase-course";
import { useUploadPaymentProof } from "@/hooks/transaction-record/use-upload-payment-proof";

type PackageTab = "foundation" | "technique" | "repertoire";

export default function SubscriptionScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PackageTab>("technique");
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null);

  const { data: courses, isLoading: coursesLoading } = useGetCourses();
  const purchaseMutation = usePurchaseCourse();
  const uploadProofMutation = useUploadPaymentProof();

  // Find course IDs in backend corresponding to categories
  const mappedCourses = useMemo(() => {
    if (!courses) return {};
    const technique = courses.find((c) => c.level === "intermediate" || c.title.toLowerCase().includes("technique"));
    const repertoire = courses.find((c) => c.level === "advanced" || c.title.toLowerCase().includes("repertoire"));
    return {
      technique: technique?._id || null,
      repertoire: repertoire?._id || null,
    };
  }, [courses]);

  const activeCourseId = useMemo(() => {
    if (activeTab === "technique") return mappedCourses.technique;
    if (activeTab === "repertoire") return mappedCourses.repertoire;
    return null;
  }, [activeTab, mappedCourses]);

  const transactionId = purchaseMutation.data?.transactionId || "";

  const packageDetails = useMemo(() => {
    const findCourse = (level: "beginner" | "intermediate" | "advanced", keywords: string[]) => {
      if (!courses) return null;
      return courses.find(
        (c) =>
          c.level === level ||
          keywords.some((kw) => c.title.toLowerCase().includes(kw))
      );
    };

    const foundationCourse = findCourse("beginner", ["foundations", "foundation", "cơ bản"]);
    const techniqueCourse = findCourse("intermediate", ["technique", "kỹ năng", "trung cấp"]);
    const repertoireCourse = findCourse("advanced", ["repertoire", "biểu diễn", "chuyên nghiệp"]);

    return {
      foundation: {
        name: foundationCourse?.title || "Foundation",
        price: "Miễn phí",
        billing: "Vô thời hạn",
        badge: "Gói cơ bản",
        description: foundationCourse?.description || "Thích hợp cho người mới bắt đầu làm quen với nhạc cụ và sáo trúc đơn giản.",
        highlights: [
          "Xem bài học cơ bản miễn phí",
          "Luyện tập nốt hơi cơ bản",
        ],
        checklist: [
          "Kiểm soát hơi thở ban đầu",
          "Tư thế cầm sáo và vị trí đặt môi đúng",
          "Học nhạc lý cơ bản",
        ],
      },
      technique: {
        name: techniqueCourse?.title || "Technique",
        price: techniqueCourse?.plan
          ? `${new Intl.NumberFormat("vi-VN").format(techniqueCourse.plan.price)}đ`
          : "459.000đ",
        billing: techniqueCourse?.plan?.billingCycle === "monthly"
          ? "1 tháng"
          : techniqueCourse?.plan?.billingCycle === "quarterly"
            ? "3 tháng"
            : techniqueCourse?.plan?.billingCycle === "yearly"
              ? "1 năm"
              : "3 tháng",
        badge: "Phổ biến",
        description: techniqueCourse?.plan?.description || techniqueCourse?.description || "Xây dựng nền tảng âm nhạc và kỹ năng cơ bản qua phương pháp học tác phẩm.",
        highlights: techniqueCourse?.plan?.features && techniqueCourse.plan.features.length > 0
          ? techniqueCourse.plan.features.slice(0, 3)
          : [
            "AI hỗ trợ học tập",
            "Học tập hỏi đáp cùng trợ lý",
            "Đánh giá cao độ & nhịp theo thời gian thực",
          ],
        checklist: techniqueCourse?.plan?.features && techniqueCourse.plan.features.length > 3
          ? techniqueCourse.plan.features.slice(3)
          : [
            "Kiểm soát hơi thở, âm thanh ổn định",
            "Luyện, đánh lưỡi, rung hơi, lấy hơi thành thạo",
            "Làm chủ kỹ thuật cốt lõi của sáo trúc",
          ],
      },
      repertoire: {
        name: repertoireCourse?.title || "Repertoire",
        price: repertoireCourse?.plan
          ? `${new Intl.NumberFormat("vi-VN").format(repertoireCourse.plan.price)}đ`
          : "499.000đ",
        billing: repertoireCourse?.plan?.billingCycle === "monthly"
          ? "1 tháng"
          : repertoireCourse?.plan?.billingCycle === "quarterly"
            ? "3 tháng"
            : repertoireCourse?.plan?.billingCycle === "yearly"
              ? "1 năm"
              : "Tác phẩm",
        badge: "Chuyên nghiệp",
        description: repertoireCourse?.plan?.description || repertoireCourse?.description || "Hoàn thiện khả năng biểu diễn sáo trúc chuyên sâu: xử lý cảm xúc, màu sắc âm thanh và phong cách biểu diễn. Kết hợp luyện tập AI thông minh và coaching 1:1 trực tiếp cùng giảng viên.",
        highlights: repertoireCourse?.plan?.features && repertoireCourse.plan.features.length > 0
          ? repertoireCourse.plan.features.slice(0, 3)
          : [
            "Hoàn thiện kỹ thuật & cảm xúc biểu diễn thực thụ",
            "Luyện tập thông minh & đánh giá cao độ/nhịp bằng AI",
            "Coaching 1:1 hoặc 1:2 trực tiếp cùng Giảng viên chuyên môn",
          ],
        checklist: repertoireCourse?.plan?.features && repertoireCourse.plan.features.length > 3
          ? repertoireCourse.plan.features.slice(3)
          : [
            "1. Thẩm âm: Tìm hiểu và nghe làm quen giai điệu (Audio/Video)",
            "2. Xướng âm (Solfège): Đọc nốt theo nhịp, hiểu tiết tấu & cao độ",
            "3. Phân tích bài: Hiểu rõ cấu trúc, tone và các phân đoạn khó",
            "4. Luyện ngón + kỹ thuật + hơi thở chuyên sâu cho tác phẩm",
            "5. Vỡ bài: Tập luyện với tempo chậm kết hợp công nghệ AI",
            "6. Tập với nhạc nền/beat: Duy trì tempo và hòa hợp âm nhạc",
            "7. Hoàn thiện: Coaching trực tiếp với Giảng viên để tạo màu sắc riêng",
          ],
      },
    };
  }, [courses]);

  const currentDetails = packageDetails[activeTab];

  const handleSubscribePress = async () => {
    if (activeTab === "foundation") {
      Alert.alert("Gói cơ bản", "Bạn đang sử dụng gói Foundation miễn phí.");
      return;
    }

    if (activeCourseId) {
      // Execute payment request to backend
      purchaseMutation.mutate(
        { courseId: activeCourseId, paymentMethod: "qr_manual" },
        {
          onSuccess: () => {
            setCheckoutVisible(true);
          },
          onError: (error: any) => {
            Alert.alert(
              "Không thể tạo giao dịch",
              error?.response?.data?.message || "Vui lòng thử lại sau.",
            );
          },
        }
      );
    } else {
      Alert.alert(
        "Chưa thể đăng ký",
        "Backend chưa có khóa học hoặc bảng giá tương ứng với gói này.",
      );
    }
  };

  const handlePickProofImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền truy cập", "Bạn cần cấp quyền truy cập thư viện ảnh để tải lên ảnh minh chứng.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPaymentProofUri(result.assets[0].uri);
    }
  };

  const handleSubmitProof = async () => {
    if (!paymentProofUri) {
      Alert.alert("Lỗi", "Vui lòng chọn ảnh minh chứng chuyển khoản của bạn.");
      return;
    }

    if (!transactionId) {
      Alert.alert("Lỗi", "Không tìm thấy giao dịch để tải minh chứng.");
      return;
    }

    uploadProofMutation.mutate(
      {
        id: transactionId,
        proof: {
          uri: paymentProofUri,
          name: `proof-${transactionId}-${Date.now()}.jpg`,
          type: "image/jpeg",
        },
      },
      {
        onSuccess: () => {
          setCheckoutVisible(false);
          setPaymentProofUri(null);
          Alert.alert(
            "Đã gửi minh chứng",
            "Giao dịch đang chờ quản trị viên kiểm tra. Premium chỉ được kích hoạt sau khi thanh toán được duyệt.",
            [{ text: "Đã hiểu", onPress: () => router.back() }],
          );
        },
        onError: (error: any) => {
          Alert.alert(
            "Không thể tải minh chứng",
            error?.response?.data?.message || "Vui lòng thử lại sau.",
          );
        },
      },
    );
  };

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: "Đăng ký gói", headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* --- HEADER BACK ACTION --- */}
        <View className="px-6 pt-2 pb-4 flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-gray-100"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-[#687451] bg-[#E2E8D3] px-3.5 py-1.5 rounded-full">
            Premium
          </Text>
        </View>

        {/* --- HERO BANNER DESIGN --- */}
        <View className="px-6 flex-row justify-between items-center mb-6 relative">
          <View className="flex-1 pr-4">
            <Text
              className="text-2xl font-black text-[#10120C] leading-8"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              CHỌN GÓI HỌC {"\n"}PHÙ HỢP VỚI BẠN
            </Text>
            <Text className="text-xs text-[#687451] mt-1 font-semibold">
              Từ nền tảng đến biểu diễn chuyên nghiệp
            </Text>

            <View className="flex-row items-center mt-3 gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={14} color="#FFB800" />
              ))}
              <Text className="text-[10px] text-gray-500 font-bold ml-1">
                4.9 (+1.200 học viên)
              </Text>
            </View>
          </View>

          {/* Peaking headphone mascot */}
          <Image
            source={require("../../assets/images/mascot_like2.png")}
            style={{ width: 120, height: 120, resizeMode: "contain" }}
          />
        </View>

        {/* --- PACKAGE SELECTION TABS --- */}
        <View className="mx-6 bg-white rounded-2xl p-1.5 flex-row justify-between shadow-sm border border-gray-100 mb-6">
          {(["foundation", "technique", "repertoire"] as const).map((tab) => {
            const isSelected = activeTab === tab;
            const details = packageDetails[tab];
            const tabName = details.name;
            let tabSub = details.price;
            if (tabSub.endsWith(".000đ")) {
              tabSub = tabSub.replace(".000đ", "K");
            }

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.85}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl items-center justify-center ${isSelected ? "bg-[#8E9E6E]" : "bg-white"
                  }`}
              >
                <Text
                  className={`text-xs font-bold ${isSelected ? "text-white" : "text-charcoal"
                    }`}
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  {tabName}
                </Text>
                <Text className={`text-[9px] font-bold mt-0.5 ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                  {tabSub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- DETAIL CARD DISPLAY --- */}
        <View className="mx-6 rounded-[28px] border-2 border-[#8E9E6E]/30 bg-white p-6 shadow-sm relative overflow-hidden">
          {/* Badge indicator */}
          <View className="absolute top-4 right-4 bg-[#FFB800]/10 px-3 py-1 rounded-full border border-[#FFB800]/20">
            <Text className="text-[10px] font-black text-[#B87A00] uppercase tracking-wider">
              {currentDetails.badge}
            </Text>
          </View>

          <Text className="text-xs font-bold text-[#8E9E6E] uppercase tracking-widest mb-1 mt-6">
            Vietnamese Bamboo Flute
          </Text>
          <Text
            className="text-3xl font-extrabold text-[#10120C] mb-3"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            {currentDetails.name}
          </Text>

          <Text className="text-xs text-gray-500 leading-5 mb-5">
            {currentDetails.description}
          </Text>

          {/* Price Tag Box */}
          <View className="w-full bg-[#8E9E6E]/10 border border-[#8E9E6E]/20 rounded-2xl p-4 flex-row items-baseline mb-6">
            <Text className="text-3xl font-black text-[#8E9E6E]">{currentDetails.price}</Text>
            <Text className="text-sm font-bold text-[#687451] ml-1">/ {currentDetails.billing}</Text>
          </View>

          {/* Highlights box (Only for Technique/Repertoire) */}
          {activeTab !== "foundation" && (
            <View className="w-full bg-[#E2E8D3]/30 border border-[#C5D0B4]/40 rounded-2xl p-4 gap-2 mb-6">
              {currentDetails.highlights.map((h, idx) => (
                <View key={idx} className="flex-row items-start gap-2.5">
                  <Ionicons name="sparkles" size={14} color="#8E9E6E" style={{ marginTop: 2 }} />
                  <Text className="flex-1 text-[13px] font-semibold leading-5 text-[#4A533B]">
                    {h}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Features Checklist */}
          <View className="gap-3.5 mb-2">
            {currentDetails.checklist.map((item, idx) => (
              <View key={idx} className="flex-row items-start gap-3">
                <Ionicons name="checkmark-circle" size={18} color="#8E9E6E" />
                <Text className="flex-1 text-[13px] leading-5 text-charcoal/85">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* --- SUBSCRIBE ACTION BUTTON --- */}
        <View className="px-6 mt-6">
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={purchaseMutation.isPending || coursesLoading}
            onPress={handleSubscribePress}
            className="w-full bg-primary py-4.5 rounded-full items-center justify-center shadow flex-row gap-2"
          >
            {purchaseMutation.isPending && <ActivityIndicator color="white" />}
            <Ionicons name="flash" size={18} color="white" />
            <Text
              className="text-white text-base font-bold py-4"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              {activeTab === "foundation" ? "Gói cơ bản hiện tại" : `Đăng ký gói ${currentDetails.name}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- PAYMENT CHECKOUT MODAL --- */}
      <Modal
        visible={checkoutVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCheckoutVisible(false)}
      >
        <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-[#10120C]" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                Thanh Toán Đăng Ký
              </Text>
              <TouchableOpacity
                onPress={() => setCheckoutVisible(false)}
                className="w-9 h-9 rounded-full bg-white border border-gray-100 items-center justify-center shadow-sm"
              >
                <Ionicons name="close" size={20} color="#10120C" />
              </TouchableOpacity>
            </View>

            {/* Invoice Info Card */}
            <View className="bg-white rounded-[24px] p-5 shadow-sm mb-6 border border-gray-50">
              <Text className="text-xs font-bold text-[#8E9E6E] uppercase tracking-wider mb-2">Đơn hàng của bạn</Text>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-bold text-charcoal">Gói khóa học: {currentDetails.name}</Text>
                <Text className="text-base font-black text-[#8E9E6E]">{currentDetails.price}</Text>
              </View>
              <View className="h-[1px] bg-gray-100 my-2" />
              <Text className="text-xs text-gray-400 leading-4">
                Chuyển khoản thủ công bằng quét mã QR hoặc nhập số tài khoản ngân hàng bên dưới, sau đó chụp ảnh minh chứng và tải lên.
              </Text>
            </View>

            {/* QR & Bank Details */}
            <View className="bg-white rounded-[24px] p-6 shadow-sm items-center gap-4 mb-6 border border-gray-50">
              <Text className="text-sm font-bold text-charcoal">Quét mã VietQR chuyển khoản</Text>

              {/* Fake QR or Server QR */}
              <View className="w-48 h-48 bg-gray-50 items-center justify-center border border-gray-150 rounded-2xl overflow-hidden p-2">
                <Image
                  source={
                    purchaseMutation.data?.qrCodeUrl
                      ? { uri: purchaseMutation.data.qrCodeUrl }
                      : {
                          uri: `https://img.vietqr.io/image/${
                            purchaseMutation.data?.bankName?.includes("MB") || !purchaseMutation.data?.bankName
                              ? "MB-97042292038472910-compact2.jpg"
                              : `${purchaseMutation.data.bankName}-${purchaseMutation.data.bankAccountNumber}-compact2.jpg`
                          }?amount=${
                            purchaseMutation.data?.amountToPay || 0
                          }&addInfo=${(purchaseMutation.data?.transferNote || `LENFOLK {transactionId}`)
                            .replace("{transactionId}", transactionId)
                            .toUpperCase()
                            .replace(/\s+/g, "%20")}`
                        }
                  }
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              </View>

              <View className="w-full gap-2 mt-2">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-400">Ngân hàng:</Text>
                  <Text className="text-xs font-bold text-charcoal">
                    {purchaseMutation.data?.bankName || "MB Bank (Quân Đội)"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-400">Số tài khoản:</Text>
                  <Text className="text-xs font-bold text-charcoal select-text">
                    {purchaseMutation.data?.bankAccountNumber || "97042292038472910"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-400">Tên người nhận:</Text>
                  <Text className="text-xs font-bold text-charcoal">
                    {purchaseMutation.data?.bankAccountName || "CONG TY LENFOLK VIETNAM"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-400">Nội dung CK:</Text>
                  <Text className="text-xs font-bold text-charcoal select-text">
                    {(purchaseMutation.data?.transferNote || `LENFOLK {transactionId}`)
                      .replace("{transactionId}", transactionId)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Proof Upload Area */}
            <View className="gap-3 mb-6">
              <Text className="text-xs font-bold text-[#8E9E6E] uppercase tracking-wider">Tải lên biên lai giao dịch</Text>

              {paymentProofUri ? (
                <View className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-gray-250 relative">
                  <Image source={{ uri: paymentProofUri }} style={{ width: "100%", height: "100%" }} />
                  <TouchableOpacity
                    onPress={() => setPaymentProofUri(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 items-center justify-center"
                  >
                    <Ionicons name="trash" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handlePickProofImage}
                  className="w-full py-8 border-2 border-dashed border-[#8E9E6E]/40 bg-white rounded-2xl items-center justify-center gap-2"
                >
                  <Ionicons name="image-outline" size={32} color="#8E9E6E" />
                  <Text className="text-xs font-bold text-[#687451]">Chọn ảnh từ thư viện</Text>
                  <Text className="text-[10px] text-gray-400">Hỗ trợ JPG, PNG, WEBP tối đa 10MB</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Checkout Action buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleSubmitProof}
                disabled={uploadProofMutation.isPending}
                activeOpacity={0.9}
                className="w-full bg-[#8E9E6E] py-4 rounded-full items-center justify-center flex-row gap-2 shadow-sm"
              >
                {uploadProofMutation.isPending && <ActivityIndicator color="white" />}
                <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                <Text className="text-white font-bold text-sm">Gửi minh chứng thanh toán</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCheckoutVisible(false)}
                className="w-full bg-white border border-gray-200 py-4 rounded-full items-center justify-center"
              >
                <Text className="text-gray-500 font-bold text-sm">Hủy bỏ</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeScreen>
      </Modal>
    </SafeScreen>
  );
}
