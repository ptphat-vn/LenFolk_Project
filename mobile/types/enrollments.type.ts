export type Enrollment = {
  _id: string;
  userId: string;
  itemType: "course" | "performance";
  courseId: string | null;
  coursePlanId: string | null;
  performanceId: string | null;
  status: "pending" | "active" | "expired" | "cancelled";
  isPaid: boolean;
  startDate: string;
  endDate: string | null;
  platform: "qr_manual" | "stripe" | "ios" | "android" | "google_play";
  createdAt: string;
  updatedAt: string;
};

export type MyEnrollmentItem = {
  _id: string;
  itemType: "course" | "performance";
  status: "pending" | "active" | "expired" | "cancelled";
  isPaid: boolean;
  startDate: string;
  endDate: string | null;
  item: {
    _id: string;
    title: string;
    thumbnail: string | null;
    status: string;
    price?: number;
  } | null;
  plan: {
    price: number;
    billingCycle: string;
    currency: string;
  } | null;
};
