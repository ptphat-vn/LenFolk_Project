// Auto-generated from Swagger

export interface PracticeSession {
  _id?: string;
  userId?: string;
  lessonId?: string;
  audioFileUrl?: string;
  aiScore?: number;
  rhythmScore?: number;
  pitchScore?: number;
  accuracyScore?: number;
  aiFeedback?: string;
  referenceAudio?: string;
  duration?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePracticeSessionInput {
  userId: string;
  lessonId: string;
  audioFileUrl?: string;
  duration?: number;
  referenceAudio?: string;
  status?: string;
}

