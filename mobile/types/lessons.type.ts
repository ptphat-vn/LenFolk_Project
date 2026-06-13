export type Lesson = {
  _id: string;
  courseId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  order: number;
  duration: number; // in seconds
  status: "draft" | "published";
  isFree: boolean;
  transcript: string | null;
  techniques: string[];
  createdAt: string;
  updatedAt: string;
};
