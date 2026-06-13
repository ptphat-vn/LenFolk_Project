export type Course = {
  _id: string;
  instructorId: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  isFree: boolean;
  adminCommissionPercentage: number;
  courseType: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "pending" | "published" | "archived";
  tags: string[];
  totalLessons: number;
  enrollCount: number;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: CoursePlan | null;
};

export type CoursePlan = {
  _id: string;
  courseId: string;
  name: string | null;
  description: string | null;
  price: number;
  currency: "VND" | "USD";
  billingCycle: "monthly" | "quarterly" | "yearly";
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
