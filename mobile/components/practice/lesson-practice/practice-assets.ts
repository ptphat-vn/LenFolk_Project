import type { ReferencePracticeTrack } from "./types";

export const mouthPlacementPracticeImages = [
  require("../../../assets/images/dat_moi_1.png"),
  require("../../../assets/images/dat_moi_2.png"),
  require("../../../assets/images/dat_moi_3.png"),
];

export const basicNotesPracticeImage = require("../../../assets/images/bai_3.png");

export const lessonFourReferenceTracks: ReferencePracticeTrack[] = [
  {
    id: "4.1",
    title: "Bài 4.1",
    noteSequence: "C D E F G A B C2 C2 B A G F E D C",
    sheets: [
      require("../../../assets/images/bai_4_1_sheet_1.png"),
      require("../../../assets/images/bai_4_1_sheet_2.png"),
    ],
    audio: require("../../../assets/audio/4.1.m4a"),
  },
  {
    id: "4.2",
    title: "Bài 4.2",
    noteSequence: "C D E F G A B, B A G F E D C",
    sheets: [
      require("../../../assets/images/bai_4_2_sheet_1.png"),
      require("../../../assets/images/bai_4_2_sheet_2.png"),
    ],
    audio: require("../../../assets/audio/4.2.m4a"),
  },
];

export const lessonFiveReferenceTracks: ReferencePracticeTrack[] = [
  {
    id: "5.1",
    title: "Bài 5.1",
    noteSequence:
      "G G G G A A A A B B B B A A A A G G G G A A A A B B B B G A B B A G G A B A G",
    sheets: [
      require("../../../assets/images/bai_5_1_sheet_1.png"),
      require("../../../assets/images/bai_5_1_sheet_2.png"),
      require("../../../assets/images/bai_5_1_sheet_3.png"),
    ],
    audio: require("../../../assets/audio/5.1.m4a"),
  },
  {
    id: "5.2",
    title: "Bài 5.2",
    noteSequence:
      "C C C C D D D D E E E E F F F F E E E E D D D D C C C C C D E F E D C D E F E D C",
    sheets: [
      require("../../../assets/images/bai_5_2_sheet_1.png"),
      require("../../../assets/images/bai_5_2_sheet_2.png"),
      require("../../../assets/images/bai_5_2_sheet_3.png"),
    ],
    audio: require("../../../assets/audio/5.2.m4a"),
  },
];

export const lessonEightReferenceTracks: ReferencePracticeTrack[] = [
  {
    id: "8",
    title: "Bài 8",
    noteSequence:
      "D2 F2 A G A C2 D2\nD2 F2 A G A C2 D2\nD2 F2 D2 D2 D2 F2 F C2\nF C2 F C2 D2 A D2\nA G F G A D\nC2 A C2 E2 D2 C2 D2",
    sheets: [
      require("../../../assets/images/bai_8_sheet_1.png"),
      require("../../../assets/images/bai_8_sheet_2.png"),
      require("../../../assets/images/bai_8_sheet_3.png"),
      require("../../../assets/images/bai_8_sheet_4.png"),
      require("../../../assets/images/bai_8_sheet_5.png"),
      require("../../../assets/images/bai_8_sheet_6.png"),
    ],
  },
];
