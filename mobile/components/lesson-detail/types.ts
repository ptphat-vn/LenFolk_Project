export type LessonDetailViewModel = {
  id: string;
  lessonNumber?: number;
  title: string;
  category: string;
  duration: string;
  hasPractice: boolean;
  objective: string;
  theory: string[];
  targetNote: string;
  practiceTip: string;
  videoUrl: string | null;
};
