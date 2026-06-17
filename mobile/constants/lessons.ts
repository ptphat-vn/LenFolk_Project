export type Lesson = {
  id: number;
  category: "Cơ bản" | "Trung cấp" | "Nâng cao";
  title: string;
  duration: string;
  status: "completed" | "in_progress" | "not_started";
  progress?: number;
  objective: string;
  theory: string[];
  targetNote: string;
  practiceTip: string;
  /**
   * Đặt false cho các bài chỉ mang tính giới thiệu/lý thuyết, không có phần
   * ghi âm luyện tập với AI. Mặc định coi như có luyện tập.
   */
  hasPractice?: boolean;
};

export const lessons: Lesson[] = [
  {
    id: 1,
    category: "Cơ bản",
    title: "Bài 1: Giới thiệu sáo trúc Việt Nam",
    duration: "5:00",
    status: "completed",
    objective:
      "Làm quen với cây sáo trúc Việt Nam loại 6 lỗ bấm: nguồn gốc, cấu tạo và cách cầm sáo cơ bản. Đây là bài giới thiệu nên chưa có phần luyện tập ghi âm.",
    theory: [
      "Sáo trúc là nhạc cụ hơi truyền thống của Việt Nam, làm từ ống trúc hoặc nứa, cho âm thanh trong trẻo, mộc mạc và gần gũi.",
      "Loại phổ biến nhất với người mới là sáo 6 lỗ bấm: gồm 1 lỗ thổi và 6 lỗ bấm để tạo ra các nốt nhạc.",
      "Gần đuôi sáo còn có các lỗ định âm (lỗ thoát hơi) giúp chỉnh cao độ và treo dây trang trí.",
      "Sáo trúc Việt Nam thường được định âm theo các tông như Đô, Rê, Sol... tuỳ chiều dài và đường kính ống.",
      "Tư thế cầm: giữ sáo nằm ngang, thân sáo hơi chếch xuống, vai và hai tay thả lỏng tự nhiên.",
      "Tay trái bấm 3 lỗ phía trên, tay phải bấm 3 lỗ phía dưới; dùng phần thịt đầu ngón bịt thật kín lỗ bấm.",
      "Hãy quan sát và làm quen với cây sáo trước; các kỹ thuật đặt môi, lấy hơi và thổi nốt sẽ học ở những bài sau.",
    ],
    targetNote: "B4",
    practiceTip: "Bài giới thiệu — chỉ cần quan sát và làm quen với cây sáo.",
    hasPractice: false,
  },
  {
    id: 2,
    category: "Cơ bản",
    title: "Bài 2: Cách đặt môi và thổi sáo",
    duration: "15:00",
    status: "completed",
    objective: "Biết cách đặt môi, cầm sáo và hướng hơi để tạo được âm sáo rõ.",
    theory: [
      "Đặt cạnh lỗ thổi tựa nhẹ gần môi dưới, không ép sáo quá chặt.",
      "Giữ sáo ngang, cằm và vai thả lỏng để luồng hơi đi ổn định.",
      "Thu khẩu hình nhỏ và hướng hơi mảnh qua cạnh lỗ thổi để tạo âm rõ.",
    ],
    targetNote: "A4",
    practiceTip: "Xem hình mẫu đặt môi rồi ghi âm một hơi thổi sao cho ra âm sáo rõ.",
  },
  {
    id: 3,
    category: "Cơ bản",
    title: "Bài 3: Luyện tập hơi thở",
    duration: "8:00",
    status: "in_progress",
    progress: 0.6,
    objective: "Kiểm soát luồng hơi dài và đều khi giữ nốt.",
    theory: [
      "Hít sâu bằng mũi và miệng trong khoảng 2 giây.",
      "Giữ cơ bụng chủ động để luồng hơi không bị hụt.",
      "Ưu tiên âm đều trước khi cố kéo dài thời gian.",
    ],
    targetNote: "G4",
    practiceTip: "Giữ G4 trong 6 giây với âm lượng ổn định.",
  },
  {
    id: 4,
    category: "Cơ bản",
    title: "Bài 4: Lấy hơi cơ bản",
    duration: "8:00",
    status: "not_started",
    objective: "Biết lấy hơi nhanh giữa hai câu nhạc.",
    theory: [
      "Chọn điểm lấy hơi ở cuối cụm giai điệu.",
      "Mở khẩu hình vừa đủ để lấy hơi nhanh mà không gây tiếng động.",
      "Không thở hết sạch trước khi lấy hơi tiếp theo.",
    ],
    targetNote: "C5",
    practiceTip: "Thổi hai nốt C5, lấy hơi nhanh rồi lặp lại.",
  },
  {
    id: 5,
    category: "Trung cấp",
    title: "Bài 5: Các nốt cao",
    duration: "15:00",
    status: "not_started",
    objective: "Điều chỉnh tốc độ hơi để phát nốt cao sáng và rõ.",
    theory: [
      "Thu nhỏ khẩu hình thay vì thổi mạnh đột ngột.",
      "Tăng tốc độ hơi nhưng vẫn giữ cơ thể thả lỏng.",
      "Kiểm tra kín lỗ bấm trước khi điều chỉnh hơi.",
    ],
    targetNote: "D5",
    practiceTip: "Đi từ A4 lên D5 chậm, giữ mỗi nốt 2 giây.",
  },
  {
    id: 6,
    category: "Trung cấp",
    title: "Bài 6: Đi ngón nâng cao",
    duration: "20:00",
    status: "not_started",
    objective: "Chuyển ngón nhanh mà không làm đứt luồng âm.",
    theory: [
      "Giữ ngón tay gần mặt sáo để giảm quãng di chuyển.",
      "Tập chậm với máy đếm nhịp trước khi tăng tốc.",
      "Đảm bảo các ngón đổi vị trí cùng thời điểm.",
    ],
    targetNote: "E5",
    practiceTip: "Lặp mẫu C5-D5-E5-D5 trong 30 giây.",
  },
  {
    id: 7,
    category: "Trung cấp",
    title: "Bài 7: Rung âm cơ bản",
    duration: "15:00",
    status: "not_started",
    objective: "Tạo rung âm nhẹ bằng kiểm soát hơi bụng.",
    theory: [
      "Bắt đầu từ nốt thẳng và ổn định.",
      "Tạo dao động nhẹ bằng cơ bụng, không rung hàm.",
      "Giữ nhịp rung đều và biên độ vừa phải.",
    ],
    targetNote: "A4",
    practiceTip: "Giữ A4 và tạo 4 nhịp rung đều mỗi giây.",
  },
  {
    id: 8,
    category: "Trung cấp",
    title: "Bài 8: Đuổi hơi cấp tốc",
    duration: "15:00",
    status: "not_started",
    objective: "Duy trì câu nhạc nhanh với lượng hơi hợp lý.",
    theory: [
      "Không dùng toàn bộ hơi cho những nốt đầu câu.",
      "Giữ âm lượng vừa phải để tiết kiệm hơi.",
      "Đánh dấu trước các điểm lấy hơi ngắn.",
    ],
    targetNote: "G4",
    practiceTip: "Thổi chuỗi G4-A4-B4-A4 trong một hơi.",
  },
  {
    id: 9,
    category: "Nâng cao",
    title: "Bài 9: Kỹ thuật réo nhạc",
    duration: "15:00",
    status: "not_started",
    objective: "Tạo chuyển động trang trí rõ nhưng không gấp.",
    theory: [
      "Tách riêng từng nhóm ngón trước khi ghép vào giai điệu.",
      "Giữ luồng hơi liên tục trong toàn bộ kỹ thuật.",
      "Tăng tốc dần theo máy đếm nhịp.",
    ],
    targetNote: "B4",
    practiceTip: "Tập cụm A4-B4-C5-B4 từ chậm đến nhanh.",
  },
  {
    id: 10,
    category: "Nâng cao",
    title: "Bài 10: Xử lý tác phẩm",
    duration: "15:00",
    status: "not_started",
    objective: "Xây dựng sắc thái và hướng câu cho một đoạn nhạc.",
    theory: [
      "Xác định cao trào trước khi chọn mức âm lượng.",
      "Nối câu bằng hơi thay vì tách từng nốt.",
      "Ghi âm và nghe lại để kiểm tra sắc thái.",
    ],
    targetNote: "C5",
    practiceTip: "Thổi một câu 8 nhịp, tăng dần rồi giảm âm lượng.",
  },
  {
    id: 11,
    category: "Nâng cao",
    title: "Bài 11: Biểu diễn sân khấu",
    duration: "15:00",
    status: "not_started",
    objective: "Giữ âm thanh ổn định trong điều kiện biểu diễn.",
    theory: [
      "Khởi động hơi và ngón trước khi lên sân khấu.",
      "Giữ nhịp nội tại khi có tiếng ồn xung quanh.",
      "Chuẩn bị điểm bắt đầu lại nếu xảy ra lỗi.",
    ],
    targetNote: "D5",
    practiceTip: "Ghi một lượt hoàn chỉnh và không dừng giữa chừng.",
  },
];

export const getLessonById = (id: string | number) =>
  lessons.find((lesson) => lesson.id === Number(id));

/** Lấy số thứ tự bài học từ tiêu đề dạng "Bài 1: ...". */
export const getLessonNumberFromTitle = (
  title?: string | null,
): number | undefined => {
  const match = title?.match(/Bài\s+(\d+)/i);
  return match ? Number(match[1]) : undefined;
};

/**
 * Cho biết một bài học có phần luyện tập ghi âm với AI hay không.
 * Bài giới thiệu (ví dụ Bài 1) được đánh dấu hasPractice = false ở trên.
 */
export const lessonHasPractice = (lessonNumber?: number) => {
  if (lessonNumber == null) return true;
  const mockLesson = lessons.find((lesson) => lesson.id === lessonNumber);
  return mockLesson?.hasPractice !== false;
};
