import type { Lesson as LocalLesson } from "@/constants/lessons";

import {
  lessonEightReferenceTracks,
  lessonFiveReferenceTracks,
  lessonFourReferenceTracks,
} from "./practice-assets";
import type { ReferencePracticeTrack } from "./types";

type LessonPracticeFlagsInput = {
  isNotePracticeMode: boolean;
  lessonNumber?: string;
  lessonTitle: string;
  mockLesson?: LocalLesson;
};

export type LessonPracticeFlags = {
  isMouthPlacementLesson: boolean;
  isBasicNotesLesson: boolean;
  isBreathingLesson: boolean;
  isFingerPracticeLesson: boolean;
  isBasicTuneLesson: boolean;
  isReferencePracticeLesson: boolean;
  isCompactReferenceSheetLesson: boolean;
};

export const getLessonPracticeFlags = ({
  isNotePracticeMode,
  lessonNumber,
  lessonTitle,
  mockLesson,
}: LessonPracticeFlagsInput): LessonPracticeFlags => {
  const normalizedTitle = lessonTitle.toLowerCase();

  const isMouthPlacementLesson =
    !isNotePracticeMode &&
    (mockLesson?.id === 2 ||
      Number(lessonNumber) === 2 ||
      normalizedTitle.includes("đặt môi") ||
      normalizedTitle.includes("dat moi"));
  const isBasicNotesLesson =
    mockLesson?.id === 3 ||
    Number(lessonNumber) === 3 ||
    normalizedTitle.includes("thế bấm") ||
    normalizedTitle.includes("the bam") ||
    normalizedTitle.includes("nốt nhạc cơ bản") ||
    normalizedTitle.includes("not nhac co ban");
  const isBreathingLesson =
    !isNotePracticeMode &&
    (mockLesson?.id === 4 ||
      Number(lessonNumber) === 4 ||
      normalizedTitle.includes("lấy hơi") ||
      normalizedTitle.includes("lay hoi"));
  const isFingerPracticeLesson =
    !isNotePracticeMode &&
    (mockLesson?.id === 5 ||
      Number(lessonNumber) === 5 ||
      normalizedTitle.includes("bấm sáo") ||
      normalizedTitle.includes("bam sao") ||
      normalizedTitle.includes("6 lỗ") ||
      normalizedTitle.includes("6 lo"));
  const isBasicTuneLesson =
    !isNotePracticeMode &&
    (mockLesson?.id === 8 ||
      Number(lessonNumber) === 8 ||
      normalizedTitle.includes("thổi bài cơ bản") ||
      normalizedTitle.includes("thoi bai co ban"));
  const isReferencePracticeLesson =
    isBreathingLesson || isFingerPracticeLesson || isBasicTuneLesson;
  const isCompactReferenceSheetLesson =
    isFingerPracticeLesson || isBasicTuneLesson;

  return {
    isMouthPlacementLesson,
    isBasicNotesLesson,
    isBreathingLesson,
    isFingerPracticeLesson,
    isBasicTuneLesson,
    isReferencePracticeLesson,
    isCompactReferenceSheetLesson,
  };
};

export const getPracticeTitle = (flags: LessonPracticeFlags) =>
  flags.isMouthPlacementLesson
    ? "Luyện thổi sáo"
    : flags.isBasicNotesLesson
      ? "Luyện nốt cơ bản"
      : flags.isBreathingLesson
        ? "Luyện lấy hơi"
        : flags.isFingerPracticeLesson
          ? "Luyện bấm sáo"
          : flags.isBasicTuneLesson
            ? "Luyện bài cơ bản"
            : "Luyện cao độ";

export const getRecordingTarget = (
  flags: LessonPracticeFlags,
  targetNote: string,
  targetNoteLabel: string,
) => ({
  title: flags.isMouthPlacementLesson
    ? "Mục tiêu"
    : flags.isBasicNotesLesson
      ? "Nốt đang luyện"
      : flags.isBreathingLesson
        ? "Mẫu hơi"
        : flags.isFingerPracticeLesson
          ? "Mẫu bài"
          : flags.isBasicTuneLesson
            ? "Sheet bài"
            : "Nốt mục tiêu",
  label: flags.isMouthPlacementLesson
    ? "Âm sáo rõ"
    : flags.isBreathingLesson
      ? "Giữ đều hơi"
      : flags.isFingerPracticeLesson
        ? "Đổi ngón đều"
        : flags.isBasicTuneLesson
          ? "Thổi theo sheet"
          : targetNoteLabel,
  detail: flags.isMouthPlacementLesson
    ? "Không chỉ toàn tiếng gió"
    : flags.isBreathingLesson || flags.isFingerPracticeLesson
      ? "Nghe sheet mẫu rồi thổi theo"
      : flags.isBasicTuneLesson
        ? "Xem sheet rồi ghi âm bài thổi"
        : targetNote,
});

export const getReferencePracticeTracks = (
  flags: Pick<
    LessonPracticeFlags,
    "isBasicTuneLesson" | "isFingerPracticeLesson"
  >,
): ReferencePracticeTrack[] => {
  if (flags.isBasicTuneLesson) return lessonEightReferenceTracks;
  if (flags.isFingerPracticeLesson) return lessonFiveReferenceTracks;
  return lessonFourReferenceTracks;
};
