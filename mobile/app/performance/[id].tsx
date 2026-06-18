import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useVideoPlayer, VideoView } from "expo-video";
import YoutubePlayer from "react-native-youtube-iframe";
import SafeScreen from "@/components/SafeScreen";
import { useGetDetailPerformance } from "@/hooks/performance/use-get-detail-performance";
import { usePurchasePerformance } from "@/hooks/performance/use-purchase-performance";
import { useGetTransactionStatus } from "@/hooks/transaction-record/use-get-transaction-status";
import { useCancelTransaction } from "@/hooks/transaction-record/use-cancel-transaction";
import { useGetMyEnrollments } from "@/hooks/enrollment/use-get-my-enrollments";

const formatMoney = (amount?: number, currency = "VND") =>
  amount && amount > 0
    ? `${new Intl.NumberFormat("vi-VN").format(amount)}${currency === "VND" ? "đ" : ` ${currency}`}`
    : "Miễn phí";

function getYoutubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/,
  );
  return match && match[2].length === 11 ? match[2] : null;
}

function friendlyPurchaseError(raw?: string): string {
  const msg = (raw || "").toLowerCase();
  if (msg.includes("already")) return "Bạn đã sở hữu tác phẩm này rồi.";
  if (msg.includes("pending")) return "Bạn đang có một đơn thanh toán chờ xử lý.";
  if (msg.includes("coupon")) return "Mã giảm giá không hợp lệ hoặc đã hết hạn.";
  if (msg.includes("not available") || msg.includes("published"))
    return "Tác phẩm này hiện chưa mở bán.";
  if (msg.includes("free")) return "Tác phẩm này miễn phí, không cần thanh toán.";
  return "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
}

export default function PerformanceDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    id: string;
    title?: string;
    price?: string;
    currency?: "VND" | "USD";
    thumbnail?: string;
    isFree?: string;
  }>();
  const [checkoutVisible, setCheckoutVisible] = React.useState(false);
  const [pollExpired, setPollExpired] = React.useState(false);

  const { data: enrollments } = useGetMyEnrollments();
  const ownedPerformanceIds = React.useMemo(() => {
    const ids = new Set<string>();
    (enrollments ?? []).forEach((item) => {
      if (
        item.itemType === "performance" &&
        item.status === "active" &&
        item.isPaid &&
        item.item?._id
      ) {
        ids.add(item.item._id);
      }
    });
    return ids;
  }, [enrollments]);
  const isOwned = !!params.id && ownedPerformanceIds.has(params.id);

  const {
    data: detail,
    isLoading,
    error,
  } = useGetDetailPerformance(params.id || "");
  const purchaseMutation = usePurchasePerformance();
  const cancelMutation = useCancelTransaction();
  const purchase = purchaseMutation.data;
  const transactionId = purchase?.transactionId || "";
  const { data: txStatus } = useGetTransactionStatus(
    transactionId,
    checkoutVisible && !!transactionId && !pollExpired,
  );
  const isPaid = txStatus?.isPaid === true;
  const isFailed = txStatus?.status === "failed";

  const fallbackPrice = Number(params.price || 0);
  const performance = detail ?? {
    _id: params.id,
    title: params.title || "Tác phẩm",
    description: null,
    thumbnail: params.thumbnail || null,
    videoUrl: null,
    documents: [],
    isFree: params.isFree === "true" || fallbackPrice <= 0,
    genre: null,
    duration: null,
    price: fallbackPrice,
    currency: params.currency || "VND",
    tags: [],
    status: "published",
    instructorId: "",
    adminCommissionPercentage: 30,
    isFeatured: false,
    publishedAt: null,
    createdAt: "",
    updatedAt: "",
  };
  const hasAccess = performance.isFree || isOwned || !!detail;
  const youtubeVideoId = React.useMemo(
    () => getYoutubeVideoId(detail?.videoUrl),
    [detail?.videoUrl],
  );
  const player = useVideoPlayer(null, (player) => {
    player.loop = false;
  });

  React.useEffect(() => {
    if (detail?.videoUrl && !youtubeVideoId) {
      player.replaceAsync(detail.videoUrl);
    }
  }, [detail?.videoUrl, player, youtubeVideoId]);

  const requestPurchase = () => {
    if (!params.id) return;
    if (performance.isFree) {
      Alert.alert("Miễn phí", "Tác phẩm này có thể xem trực tiếp.");
      return;
    }
    if (isOwned) {
      Alert.alert("Đã sở hữu", "Bạn đã mua tác phẩm này.");
      return;
    }

    purchaseMutation.mutate(
      { performanceId: params.id },
      {
        onSuccess: () => {
          setPollExpired(false);
          setCheckoutVisible(true);
        },
        onError: (err: any) => {
          Alert.alert(
            "Không thể tạo giao dịch",
            friendlyPurchaseError(err?.response?.data?.message),
          );
        },
      },
    );
  };

  const closeCheckout = () => {
    setCheckoutVisible(false);
    setPollExpired(false);
    purchaseMutation.reset();
    cancelMutation.reset();
  };

  const cancelAndClose = () => {
    if (transactionId) {
      cancelMutation.mutate(transactionId, {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
        },
      });
    }
    closeCheckout();
  };

  const requestCancel = () => {
    if (isPaid || (txStatus && txStatus.status !== "pending")) {
      closeCheckout();
      return;
    }
    Alert.alert(
      "Hủy giao dịch?",
      "Đơn thanh toán đang chờ sẽ bị hủy. Nếu đã chuyển khoản, hãy tiếp tục chờ hệ thống xác nhận.",
      [
        { text: "Tiếp tục chờ", style: "cancel" },
        { text: "Hủy giao dịch", style: "destructive", onPress: cancelAndClose },
      ],
    );
  };

  React.useEffect(() => {
    if (!checkoutVisible || !isPaid) return;
    queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
    queryClient.invalidateQueries({ queryKey: ["performanceDetail", params.id] });
  }, [checkoutVisible, isPaid, params.id, queryClient]);

  React.useEffect(() => {
    if (!checkoutVisible || isPaid) return;
    const timer = setTimeout(() => setPollExpired(true), 15 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [checkoutVisible, isPaid, transactionId]);

  return (
    <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: performance.title, headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 48, gap: 20 }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)/performances")}
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#10120C" />
          </TouchableOpacity>
          <View className="rounded-full bg-[#E2E8D3] px-4 py-2">
            <Text className="text-xs font-bold text-[#687451]">
              {performance.genre || "Tác phẩm"}
            </Text>
          </View>
        </View>

        {isLoading && !detail ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator color="#8E9E6E" />
          </View>
        ) : null}

        {youtubeVideoId && hasAccess ? (
          <View className="overflow-hidden rounded-[28px] bg-black w-full shadow-sm">
            <YoutubePlayer height={210} play={false} videoId={youtubeVideoId} />
          </View>
        ) : detail?.videoUrl && hasAccess ? (
          <View className="overflow-hidden rounded-[28px] bg-black aspect-[16/9] w-full shadow-sm">
            <VideoView
              style={{ width: "100%", height: "100%" }}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />
          </View>
        ) : performance.thumbnail ? (
          <Image
            source={{ uri: performance.thumbnail }}
            style={{ width: "100%", height: 220, borderRadius: 28 }}
            resizeMode="cover"
          />
        ) : (
          <View className="h-[220px] items-center justify-center rounded-[28px] bg-[#F4E0AC]">
            <Ionicons name="albums-outline" size={52} color="#7C672D" />
          </View>
        )}

        <View className="gap-4 rounded-[30px] bg-[#8E9E6E] p-6">
          <Text
            selectable
            className="text-2xl font-bold leading-8 text-white"
            style={{ fontFamily: "BeVietnamPro-Medium" }}
          >
            {performance.title}
          </Text>
          <Text className="text-sm leading-6 text-white/90">
            {performance.description || "Tác phẩm biểu diễn được biên soạn cho người học LenFolk."}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="rounded-full bg-white/15 px-3 py-1.5">
              <Text className="text-xs font-bold text-white">
                {formatMoney(performance.isFree ? 0 : performance.price, performance.currency)}
              </Text>
            </View>
            {isOwned && (
              <View className="rounded-full bg-white/15 px-3 py-1.5">
                <Text className="text-xs font-bold text-white">Đã sở hữu</Text>
              </View>
            )}
          </View>
        </View>

        {error && !detail && !isOwned && !performance.isFree ? (
          <View className="rounded-[28px] bg-white p-6">
            <Text className="text-base font-bold text-[#10120C]">
              Cần mua để xem đầy đủ
            </Text>
            <Text className="mt-2 text-sm leading-6 text-[#55594F]">
              Sau khi thanh toán, bạn sẽ xem được video và tài liệu đính kèm của tác phẩm này.
            </Text>
          </View>
        ) : null}

        {hasAccess && detail?.documents?.length ? (
          <View className="gap-3 rounded-[28px] bg-white p-6">
            <Text className="text-lg font-bold text-[#10120C]">Tài liệu</Text>
            {detail.documents.map((doc) => (
              <TouchableOpacity
                key={doc.url}
                onPress={() => Linking.openURL(doc.url)}
                className="flex-row items-center justify-between rounded-2xl bg-[#E2E8D3] p-4"
              >
                <Text numberOfLines={1} className="min-w-0 flex-1 text-sm font-bold text-[#4A533B]">
                  {doc.name}
                </Text>
                <Ionicons name="open-outline" size={18} color="#687451" />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={purchaseMutation.isPending || isOwned || performance.isFree}
          onPress={requestPurchase}
          className={`flex-row items-center justify-center gap-2 rounded-[24px] px-6 py-5 ${
            isOwned || performance.isFree ? "bg-[#E2E8D3]" : "bg-[#10120C]"
          }`}
        >
          {purchaseMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Ionicons
              name={isOwned || performance.isFree ? "checkmark-circle" : "card-outline"}
              size={21}
              color={isOwned || performance.isFree ? "#687451" : "white"}
            />
          )}
          <Text
            className={`text-base font-bold ${
              isOwned || performance.isFree ? "text-[#687451]" : "text-white"
            }`}
          >
            {performance.isFree
              ? "Tác phẩm miễn phí"
              : isOwned
                ? "Đã mua"
                : `Mua tác phẩm ${formatMoney(performance.price, performance.currency)}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={checkoutVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={requestCancel}
      >
        <SafeScreen style={{ backgroundColor: "#FDF8EA" }}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="min-w-0 flex-1 pr-3 text-xl font-bold text-[#10120C]">
                {isPaid ? "Thanh toán thành công" : "Thanh toán tác phẩm"}
              </Text>
              <TouchableOpacity
                onPress={isPaid ? closeCheckout : requestCancel}
                className="w-9 h-9 rounded-full bg-white border border-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#10120C" />
              </TouchableOpacity>
            </View>

            {isPaid ? (
              <View className="items-center gap-4 py-10">
                <Ionicons name="checkmark-circle" size={70} color="#8E9E6E" />
                <Text className="text-lg font-bold text-charcoal text-center">
                  Đã mở khóa {performance.title}
                </Text>
                <TouchableOpacity
                  onPress={closeCheckout}
                  className="w-full bg-[#8E9E6E] py-4 rounded-full items-center justify-center mt-4"
                >
                  <Text className="text-white font-bold text-sm">Xem tác phẩm</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className="bg-white rounded-[24px] p-5 mb-6 border border-gray-50">
                  <Text className="text-xs font-bold text-[#8E9E6E] uppercase tracking-wider mb-2">
                    Đơn hàng
                  </Text>
                  <View className="flex-row justify-between items-start gap-3">
                    <Text numberOfLines={2} className="min-w-0 flex-1 text-base font-bold text-charcoal">
                      {performance.title}
                    </Text>
                    <Text className="shrink-0 text-base font-black text-[#8E9E6E]">
                      {purchase
                        ? formatMoney(purchase.amountToPay, purchase.currency)
                        : formatMoney(performance.price, performance.currency)}
                    </Text>
                  </View>
                </View>

                <View className="bg-white rounded-[24px] p-6 items-center gap-4 mb-6 border border-gray-50">
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
                    {[
                      ["Ngân hàng", purchase?.bankCode || "-"],
                      ["Số tài khoản", purchase?.accountNumber || "-"],
                      ["Tên người nhận", purchase?.accountName || "-"],
                      ["Nội dung CK", purchase?.payCode || "-"],
                    ].map(([label, value]) => (
                      <View key={label} className="flex-row justify-between gap-3">
                        <Text className="shrink-0 text-xs text-gray-400">{label}:</Text>
                        <Text numberOfLines={1} className="min-w-0 flex-1 text-right text-xs font-bold text-charcoal">
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="bg-white rounded-[24px] p-5 mb-6 border border-gray-50 flex-row items-center gap-3">
                  {isFailed ? (
                    <Ionicons name="close-circle" size={24} color="#D9534F" />
                  ) : pollExpired ? (
                    <Ionicons name="time-outline" size={24} color="#946200" />
                  ) : (
                    <ActivityIndicator color="#8E9E6E" />
                  )}
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-bold text-charcoal">
                      {isFailed
                        ? "Giao dịch thất bại"
                        : pollExpired
                          ? "Vẫn đang chờ thanh toán"
                          : "Đang chờ bạn chuyển khoản..."}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={requestCancel}
                  disabled={cancelMutation.isPending}
                  className="w-full bg-[#FBEAE9] border border-[#D9534F]/30 py-4 rounded-full items-center justify-center"
                >
                  <Text className="text-[#D9534F] font-bold text-sm">
                    {isFailed ? "Đóng" : "Hủy giao dịch"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeScreen>
      </Modal>
    </SafeScreen>
  );
}
