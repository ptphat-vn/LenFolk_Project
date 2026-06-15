import { useGetMyEnrollments } from "@/hooks/enrollment/use-get-my-enrollments";
import { useAuthStore } from "@/store/authStore";
import { MyEnrollmentItem } from "@/types/enrollments.type";

export type SubscriptionTier = "foundation" | "technique" | "repertoire";

const getTier = (enrollment?: MyEnrollmentItem): SubscriptionTier => {
  if (!enrollment?.item) return "foundation";

  const courseType = enrollment.item.courseType?.toLowerCase();
  const title = enrollment.item.title.toLowerCase();

  if (
    courseType === "repertoire" ||
    title.includes("repertoire") ||
    title.includes("biểu diễn")
  ) {
    return "repertoire";
  }

  if (
    courseType === "technique" ||
    title.includes("technique") ||
    title.includes("kỹ thuật")
  ) {
    return "technique";
  }

  if (enrollment.item.level === "advanced") return "repertoire";
  if (enrollment.item.level === "intermediate") return "technique";

  return "foundation";
};

export const useCurrentSubscription = () => {
  const isSubscribed = useAuthStore(
    (state) => state.user?.isSubscribed === true,
  );
  const query = useGetMyEnrollments();
  const currentEnrollment = query.data?.find(
    (enrollment) =>
      enrollment.itemType === "course" &&
      enrollment.status === "active" &&
      enrollment.isPaid &&
      enrollment.item,
  );
  const tier = getTier(currentEnrollment);
  const hasSubscription = isSubscribed || Boolean(currentEnrollment);

  return {
    ...query,
    currentEnrollment,
    tier,
    label:
      currentEnrollment?.item?.title ||
      (hasSubscription ? "Gói đã đăng ký" : "Foundations"),
    isSubscribed: hasSubscription,
    hasPremiumAccess: hasSubscription && tier !== "foundation",
  };
};
