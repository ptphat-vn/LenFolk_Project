import { ReferenceSheetPractice, type ReferenceSheetPracticeProps } from "./ReferenceSheetPractice";

type Props = Omit<
  ReferenceSheetPracticeProps,
  "isBasicTuneLesson" | "isCompactReferenceSheetLesson" | "isFingerPracticeLesson"
>;

export function LessonFourBreathingPractice(props: Props) {
  return (
    <ReferenceSheetPractice
      {...props}
      isBasicTuneLesson={false}
      isCompactReferenceSheetLesson={false}
      isFingerPracticeLesson={false}
    />
  );
}
