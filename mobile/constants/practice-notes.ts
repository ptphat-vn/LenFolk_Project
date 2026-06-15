export type PracticeNote = {
  pitch: string;
  label: string;
};

export const PRACTICE_NOTES: PracticeNote[] = [
  { pitch: "C4", label: "Đô" },
  { pitch: "D4", label: "Rê" },
  { pitch: "E4", label: "Mi" },
  { pitch: "F4", label: "Pha" },
  { pitch: "G4", label: "Sol" },
  { pitch: "A4", label: "La" },
  { pitch: "B4", label: "Si" },
];

const SOLFEGE_LABELS: Record<string, string> = {
  C: "Đô",
  D: "Rê",
  E: "Mi",
  F: "Pha",
  G: "Sol",
  A: "La",
  B: "Si",
};

export const getRandomPracticeNote = () =>
  PRACTICE_NOTES[Math.floor(Math.random() * PRACTICE_NOTES.length)];

export const getNoteLabel = (pitch?: string) => {
  if (!pitch) return "Đô";
  return SOLFEGE_LABELS[pitch.trim().charAt(0).toUpperCase()] || pitch;
};
