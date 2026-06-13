export type PracticeSession = {
  _id: string;
  userId: string;
  lessonId: string;
  audioFileUrl: string | null;
  aiScore: number | null;
  rhythmScore: number | null;
  pitchScore: number | null;
  accuracyScore: number | null;
  aiFeedback: string | null;
  referenceAudio: string | null;
  duration: number; // in seconds
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
};
