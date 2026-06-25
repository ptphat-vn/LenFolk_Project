import { ReferenceSheetPractice, type ReferenceSheetPracticeProps } from "./ReferenceSheetPractice";

type Props = Omit<
  ReferenceSheetPracticeProps,
  "isBasicTuneLesson" | "isCompactReferenceSheetLesson" | "isFingerPracticeLesson"
>;

export function LessonFiveFingerPractice(props: Props) {
  return (
    <ReferenceSheetPractice
      {...props}
      isBasicTuneLesson={false}
      isCompactReferenceSheetLesson
      isFingerPracticeLesson
    />
  );
}
