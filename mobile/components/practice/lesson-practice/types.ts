export type RecordedAudioFile = {
  uri: string;
  name: string;
  note: string;
  noteLabel: string;
  durationSeconds: number;
  createdAt: number;
};

export type ReferenceTrackId = "4.1" | "4.2" | "5.1" | "5.2" | "8";

export type ReferencePracticeTrack = {
  id: ReferenceTrackId;
  title: string;
  noteSequence: string;
  sheets: number[];
  audio?: number;
};

export type CompactAnalysisResult = {
  score: number | null;
  label: string;
  description: string;
  issues: string[];
  recommendations: string[];
};
