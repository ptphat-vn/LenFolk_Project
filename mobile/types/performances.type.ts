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
  instructorId:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
        avatar?: string | null;
      };
  title: string;
  description: string | null;
  thumbnail: string | null;
  imageUrls?: string[];
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

export type CreatePerformancePayload = {
  title: string;
  description?: string;
  thumbnail?: string;
  imageUrls?: string[];
  images?: MobileImageFile[];
  videoUrl?: string;
  isFree?: boolean;
  genre?: string;
  duration?: number;
  price?: number;
  currency?: "VND" | "USD";
  tags?: string[];
};

export type MobileImageFile = {
  uri: string;
  name: string;
  type: string;
};
