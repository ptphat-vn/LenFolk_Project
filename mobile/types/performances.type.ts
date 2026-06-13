export type PerformanceDocument = {
  name: string;
  url: string;
  publicId: string | null;
  format: string | null;
  resourceType: string;
  bytes: number | null;
};

export type Performance = {
  _id: string;
  instructorId: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  videoUrl: string | null;
  documents: PerformanceDocument[];
  isFree: boolean;
  genre: string | null;
  duration: number | null; // in seconds
  adminCommissionPercentage: number;
  status: "pending" | "published" | "archived";
  price: number;
  currency: "VND" | "USD";
  tags: string[];
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
