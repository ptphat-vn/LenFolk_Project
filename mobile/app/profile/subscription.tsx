import { getApiErrorMessage } from "@/lib/api-error";
import React, { useState, useMemo, useEffect } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import SafeScreen from "@/components/SafeScreen";
import { useGetCourses } from "@/hooks/course/use-get-courses";
import { usePurchaseCourse } from "@/hooks/course/use-purchase-course";
import { useGetTransactionStatus } from "@/hooks/transaction-record/use-get-transaction-status";
import { useCancelTransaction } from "@/hooks/transaction-record/use-cancel-transaction";
import { useGetMyEnrollments } from "@/hooks/enrollment/use-get-my-enrollments";

type PackageTab = "foundation" | "technique";

// Map message lỗi (thường là tiếng Anh / nội bộ) từ backend sang tiếng Việt thân thiện.
// Không hiển thị nguyên văn message backend cho người dùng.
function friendlyPurchaseError(raw?: string): string {
  const msg = (raw || "").toLowerCase();
  if (msg.includes("không thể kết nối đến máy chủ")) return raw!;
  if (msg.includes("not configured"))
    return "Hệ thống thanh toán đang bảo trì. Vui lòng thử lại sau.";
  if (msg.includes("already have active access") || msg.includes("already have access"))
    return "Bạn đã sở hữu gói học này rồi.";
  if (msg.includes("pending payment"))
    return "Bạn đang có một đơn thanh toán chờ xử lý. Vui lòng hoàn tất hoặc hủy đơn cũ trước.";
  if (msg.includes("price plan") || msg.includes("valid price"))
    return "Gói học này hiện chưa có bảng giá. Vui lòng thử lại sau.";
  if (msg.includes("coupon"))
    return "Mã giảm giá không hợp lệ hoặc đã hết hạn.";
  if (msg.includes("free"))
    return "Gói học này miễn phí, không cần thanh toán.";
  if (msg.includes("not available"))
    return "Gói học này hiện chưa mở bán.";
  return "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PackageTab>("technique");
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [pollExpired, setPollExpired] = useState(false);

  const { data: courses, isLoading: coursesLoading } = useGetCourses();
  const { data: myEnrollments } = useGetMyEnrollments();
  const purchaseMutation = usePurchaseCourse();
  const cancelMutation = useCancelTransaction();

  const purchase = purchaseMutation.data;
  const transactionId = purchase?.transactionId || "";

  // Bước 3 — poll trạng thái thanh toán trong khi màn QR đang mở.
  const { data: txStatus } = useGetTransactionStatus(
    transactionId,
    checkoutVisible && !!transactionId && !pollExpired
  );
  const isPaid = txStatus?.isPaid === true;
  const isFailed = txStatus?.status === "failed";

  // Các khóa học user đã sở hữu (active + đã thanh toán) → để hiện "Đã đăng ký".
  const ownedCourseIds = useMemo(() => {
    const ids = new Set<string>();
    (myEnrollments ?? []).forEach((e) => {
      if (e.itemType === "course" && e.status === "active" && e.isPaid && e.item?._id) {
        ids.add(e.item._id);
      }
    });
    return ids;
  }, [myEnrollments]);

  // Find course IDs in backend corresponding to categories
  const mappedCourses = useMemo(() => {
    if (!courses) return {};
    const technique = courses.find((c) => c.level === "intermediate" || c.title.toLowerCase().includes("technique"));
    return {
      technique: technique?._id || null,
    };
  }, [courses]);

  const activeCourseId = useMemo(() => {
    if (activeTab === "technique") return mappedCourses.technique;
    return null;
  }, [activeTab, mappedCourses]);

  // Gói đang xem đã được đăng ký chưa?
  const activeOwned = !!activeCourseId && ownedCourseIds.has(activeCourseId);

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
    };
  }, [courses]);

  const currentDetails = packageDetails[activeTab];

  const handleSubscribePress = async () => {
    if (activeTab === "foundation") {
      Alert.alert("Gói cơ bản", "Bạn đang sử dụng gói Foundation miễn phí.");
      return;
    }

    if (activeOwned) {
      Alert.alert("Đã đăng ký", `Bạn đã đăng ký gói ${currentDetails.name}.`);
      return;
    }

    if (activeCourseId) {
      // Bước 1 — tạo đơn & lấy QR SePay. Không gửi paymentMethod nữa.
      purchaseMutation.mutate(
        { courseId: activeCourseId },
        {
          onSuccess: () => {
            setPollExpired(false);
            setCheckoutVisible(true);
          },
          onError: (error: any) => {
            Alert.alert(
              "Không thể tạo giao dịch",
              friendlyPurchaseError(getApiErrorMessage(error)),
            );
          },
        }
      );
    } else {
      Alert.alert(
        "Chưa thể đăng ký",
        "Gói học này hiện chưa sẵn sàng. Vui lòng thử lại sau.",
      );
    }
  };

  const handleCloseCheckout = () => {
    setCheckoutVisible(false);
    setPollExpired(false);
    purchaseMutation.reset();
    cancelMutation.reset();
  };

  // Gọi API hủy đơn (PATCH /transaction-records/:id/cancel) rồi đóng màn.
  const cancelAndClose = () => {
    if (transactionId) {
      cancelMutation.mutate(transactionId, {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
        },
      });
    }
    handleCloseCheckout();
  };

  // Thoát khi đơn còn chờ = hủy giao dịch (chỉ hỏi xác nhận khi đang pending).
  const requestCancel = () => {
    // Đơn đã kết thúc (thành công/thất bại/hoàn) → đóng thẳng, không cần hỏi.
    if (isPaid || (txStatus && txStatus.status !== "pending")) {
      handleCloseCheckout();
      return;
    }
    Alert.alert(
      "Hủy giao dịch?",
      "Đơn thanh toán đang chờ sẽ bị hủy. Chỉ hủy khi bạn CHƯA chuyển khoản — nếu đã chuyển, hãy bấm \"Tiếp tục chờ\".",
      [
        { text: "Tiếp tục chờ", style: "cancel" },
        { text: "Hủy giao dịch", style: "destructive", onPress: cancelAndClose },
      ]
    );
  };

  // Khi SePay xác nhận (isPaid) → làm mới quyền sở hữu + báo thành công.
  useEffect(() => {
    if (!checkoutVisible || !isPaid) return;
    queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
    queryClient.invalidateQueries({ queryKey: ["me"] });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
  }, [checkoutVisible, isPaid, queryClient]);

  // Timeout poll sau 15 phút — đơn pending vẫn tự kích hoạt nếu tiền về sau đó.
  useEffect(() => {
    if (!checkoutVisible || isPaid) return;
    const timer = setTimeout(() => setPollExpired(true), 15 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [checkoutVisible, isPaid, transactionId]);

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
          <Text numberOfLines={1} className="max-w-[60%] text-sm font-bold text-[#687451] bg-[#E2E8D3] px-3.5 py-1.5 rounded-full">
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
          {(["foundation", "technique"] as const).map((tab) => {
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
                  numberOfLines={1}
                  className={`text-xs font-bold ${isSelected ? "text-white" : "text-charcoal"
                    }`}
                  style={{ fontFamily: "BeVietnamPro-Medium" }}
                >
                  {tabName}
                </Text>
                <Text numberOfLines={1} className={`text-[9px] font-bold mt-0.5 ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                  {tabSub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- DETAIL CARD DISPLAY --- */}
        <View className="mx-6 rounded-[28px] border-2 border-[#8E9E6E]/30 bg-white p-6 shadow-sm relative overflow-hidden">
          {/* Badge indicator */}
          <View className="absolute top-4 right-4 max-w-[52%] bg-[#FFB800]/10 px-3 py-1 rounded-full border border-[#FFB800]/20">
            <Text numberOfLines={1} className="text-[10px] font-black text-[#B87A00] uppercase tracking-wider">
              {currentDetails.badge}
            </Text>
          </View>

          <Text numberOfLines={2} className="text-xs font-bold text-[#8E9E6E] uppercase tracking-widest mb-1 mt-6 pr-24">
            Vietnamese Bamboo Flute
          </Text>
          <Text
            numberOfLines={2}
            className="text-3xl font-extrabold text-[#10120C] mb-3"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            {currentDetails.name}
          </Text>

          <Text className="text-xs text-gray-500 leading-5 mb-5">
            {currentDetails.description}
          </Text>

          {/* Price Tag Box */}
          <View className="w-full bg-[#8E9E6E]/10 border border-[#8E9E6E]/20 rounded-2xl p-4 flex-row flex-wrap items-baseline mb-6">
            <Text numberOfLines={1} className="max-w-full text-3xl font-black text-[#8E9E6E]">{currentDetails.price}</Text>
            <Text numberOfLines={1} className="text-sm font-bold text-[#687451] ml-1">/ {currentDetails.billing}</Text>
          </View>

          {/* Highlights box for the paid package */}
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
            disabled={purchaseMutation.isPending || coursesLoading || activeOwned}
            onPress={handleSubscribePress}
            className={`w-full py-4.5 rounded-full items-center justify-center shadow flex-row gap-2 ${
              activeOwned ? "bg-[#8E9E6E]" : "bg-primary"
            }`}
          >
            {purchaseMutation.isPending && <ActivityIndicator color="white" />}
            <Ionicons
              name={activeOwned ? "checkmark-circle" : "flash"}
              size={18}
              color="white"
            />
            <Text
              numberOfLines={2}
              className="text-white text-base font-bold py-4"
              style={{ fontFamily: "BeVietnamPro-Medium" }}
            >
              {activeTab === "foundation"
                ? "Gói cơ bản hiện tại"
                : activeOwned
                  ? "Đã đăng ký"
                  : `Đăng ký gói ${currentDetails.name}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- PAYMENT CHECKOUT MODAL (SePay QR auto-confirm) --- */}
      <Modal
        visible={checkoutVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={requestCancel}
      >
        <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text numberOfLines={2} className="min-w-0 flex-1 pr-3 text-xl font-bold text-[#10120C]" style={{ fontFamily: "BeVietnamPro-Medium" }}>
                {isPaid ? "Thanh Toán Thành Công" : "Thanh Toán Đăng Ký"}
              </Text>
              <TouchableOpacity
                onPress={isPaid ? handleCloseCheckout : requestCancel}
                className="w-9 h-9 rounded-full bg-white border border-gray-100 items-center justify-center shadow-sm"
              >
                <Ionicons name="close" size={20} color="#10120C" />
              </TouchableOpacity>
            </View>

            {isPaid ? (
              /* --- SUCCESS STATE --- */
              <View className="items-center gap-4 py-10">
                <View className="w-20 h-20 rounded-full bg-[#8E9E6E]/15 items-center justify-center">
                  <Ionicons name="checkmark-circle" size={56} color="#8E9E6E" />
                </View>
                <Text numberOfLines={3} className="text-lg font-bold text-charcoal text-center">
                  Đã kích hoạt gói {currentDetails.name}
                </Text>
                <Text className="text-xs text-gray-500 text-center leading-5 px-6">
                  Thanh toán đã được xác nhận tự động. Bạn có thể bắt đầu học ngay bây giờ.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    handleCloseCheckout();
                    router.back();
                  }}
                  activeOpacity={0.9}
                  className="w-full bg-[#8E9E6E] py-4 rounded-full items-center justify-center mt-4"
                >
                  <Text className="text-white font-bold text-sm">Bắt đầu học</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Invoice Info Card */}
                <View className="bg-white rounded-[24px] p-5 shadow-sm mb-6 border border-gray-50">
                  <Text className="text-xs font-bold text-[#8E9E6E] uppercase tracking-wider mb-2">Đơn hàng của bạn</Text>
                  <View className="flex-row justify-between items-start gap-3 mb-3">
                    <Text numberOfLines={2} className="min-w-0 flex-1 text-base font-bold text-charcoal">Gói khóa học: {currentDetails.name}</Text>
                    <Text numberOfLines={1} className="shrink-0 max-w-[40%] text-base font-black text-[#8E9E6E]">
                      {purchase
                        ? `${new Intl.NumberFormat("vi-VN").format(purchase.amountToPay)}đ`
                        : currentDetails.price}
                    </Text>
                  </View>
                  <View className="h-[1px] bg-gray-100 my-2" />
                  <Text className="text-xs text-gray-400 leading-4">
                    Quét mã QR bên dưới bằng app ngân hàng và chuyển khoản. Hệ thống tự động xác nhận — bạn{" "}
                    <Text className="font-bold text-[#687451]">không cần gửi minh chứng</Text>.
                  </Text>
                </View>

                {/* QR & Bank Details */}
                <View className="bg-white rounded-[24px] p-6 shadow-sm items-center gap-4 mb-6 border border-gray-50">
                  <Text className="text-sm font-bold text-charcoal">Quét mã VietQR để chuyển khoản</Text>

                  <View className="w-48 h-48 bg-gray-50 items-center justify-center border border-gray-150 rounded-2xl overflow-hidden p-2">
                    {purchase?.sepayQrUrl ? (
                      <Image
                        source={{ uri: purchase.sepayQrUrl }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="contain"
                      />
                    ) : (
                      <ActivityIndicator color="#8E9E6E" />
                    )}
                  </View>

                  <View className="w-full gap-2 mt-2">
                    <View className="flex-row justify-between gap-3">
                      <Text className="shrink-0 text-xs text-gray-400">Ngân hàng:</Text>
                      <Text numberOfLines={1} className="min-w-0 flex-1 text-right text-xs font-bold text-charcoal">
                        {purchase?.bankCode || "—"}
                      </Text>
                    </View>
                    <View className="flex-row justify-between gap-3">
                      <Text className="shrink-0 text-xs text-gray-400">Số tài khoản:</Text>
                      <Text numberOfLines={1} className="min-w-0 flex-1 text-right text-xs font-bold text-charcoal select-text">
                        {purchase?.accountNumber || "—"}
                      </Text>
                    </View>
                    <View className="flex-row justify-between gap-3">
                      <Text className="shrink-0 text-xs text-gray-400">Tên người nhận:</Text>
                      <Text numberOfLines={2} className="min-w-0 flex-1 text-right text-xs font-bold text-charcoal">
                        {purchase?.accountName || "—"}
                      </Text>
                    </View>
                    <View className="flex-row justify-between gap-3">
                      <Text className="shrink-0 text-xs text-gray-400">Nội dung CK:</Text>
                      <Text numberOfLines={1} className="min-w-0 flex-1 text-right text-xs font-bold text-[#8E9E6E] select-text">
                        {purchase?.payCode || "—"}
                      </Text>
                    </View>
                  </View>

                  <View className="w-full bg-[#FFF7E6] border border-[#FFB800]/30 rounded-xl px-3 py-2 mt-1">
                    <Text className="text-[10px] text-[#946200] leading-4">
                      Nếu nhập tay, nội dung chuyển khoản phải đúng mã{" "}
                      <Text className="font-bold">{purchase?.payCode || ""}</Text> để hệ thống khớp đơn.
                    </Text>
                  </View>
                </View>

                {/* Live status row */}
                <View className="bg-white rounded-[24px] p-5 shadow-sm mb-6 border border-gray-50 flex-row items-center gap-3">
                  {isFailed ? (
                    <Ionicons name="close-circle" size={24} color="#D9534F" />
                  ) : pollExpired ? (
                    <Ionicons name="time-outline" size={24} color="#946200" />
                  ) : (
                    <ActivityIndicator color="#8E9E6E" />
                  )}
                  <View className="min-w-0 flex-1">
                    <Text numberOfLines={2} className="text-sm font-bold text-charcoal">
                      {isFailed
                        ? "Giao dịch thất bại"
                        : pollExpired
                          ? "Vẫn đang chờ thanh toán"
                          : "Đang chờ bạn chuyển khoản..."}
                    </Text>
                    <Text numberOfLines={3} className="text-[11px] text-gray-400 leading-4 mt-0.5">
                      {isFailed
                        ? "Vui lòng đóng và thử tạo lại giao dịch."
                        : pollExpired
                          ? "Nếu đã chuyển khoản, quyền truy cập vẫn tự kích hoạt khi tiền về."
                          : "Màn hình sẽ tự cập nhật ngay khi nhận được thanh toán."}
                    </Text>
                  </View>
                </View>

                {/* Action buttons */}
                <View className="gap-3">
                  {pollExpired && (
                    <TouchableOpacity
                      onPress={() => setPollExpired(false)}
                      activeOpacity={0.9}
                      className="w-full bg-[#8E9E6E] py-4 rounded-full items-center justify-center flex-row gap-2 shadow-sm"
                    >
                      <Ionicons name="refresh" size={18} color="white" />
                      <Text className="text-white font-bold text-sm">Kiểm tra lại</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={requestCancel}
                    disabled={cancelMutation.isPending}
                    activeOpacity={0.9}
                    className="w-full bg-[#FBEAE9] border border-[#D9534F]/30 py-4 rounded-full items-center justify-center flex-row gap-1.5"
                  >
                    {cancelMutation.isPending ? (
                      <ActivityIndicator color="#D9534F" />
                    ) : (
                      <Ionicons
                        name={isFailed ? "close-outline" : "close-circle-outline"}
                        size={16}
                        color="#D9534F"
                      />
                    )}
                    <Text className="text-[#D9534F] font-bold text-sm">
                      {isFailed ? "Đóng" : "Hủy giao dịch"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeScreen>
      </Modal>
    </SafeScreen>
  );
}


