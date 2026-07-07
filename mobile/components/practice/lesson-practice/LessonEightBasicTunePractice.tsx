import { ReferenceSheetPractice, type ReferenceSheetPracticeProps } from "./ReferenceSheetPractice";

type Props = Omit<
  ReferenceSheetPracticeProps,
  "isBasicTuneLesson" | "isCompactReferenceSheetLesson" | "isFingerPracticeLesson"
>;

export function LessonEightBasicTunePractice(props: Props) {
  return (
    <ReferenceSheetPractice
      {...props}
      isBasicTuneLesson
      isCompactReferenceSheetLesson
      isFingerPracticeLesson={false}
    />
  );
}
