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
    title: "Bài 3: Thế bấm ngón và các nốt nhạc cơ bản",
    duration: "12:00",
    status: "in_progress",
    progress: 0.6,
    objective:
      "Làm quen với thế bấm ngón của 7 nốt cơ bản và luyện thổi từng nốt rõ, đúng cao độ.",
    theory: [
      "Quan sát bảng thế bấm để biết lỗ nào cần bịt kín trước khi thổi từng nốt.",
      "Dùng phần thịt đầu ngón tay che kín lỗ bấm, tránh để hở làm nốt bị lệch hoặc xì hơi.",
      "Luyện từng nốt Đô, Rê, Mi, Pha, Sol, La, Si chậm rãi; chỉ chuyển nốt khi âm đã rõ và ổn định.",
      "Giữ luồng hơi đều trong 3 đến 6 giây cho mỗi nốt để AI có đủ dữ liệu phân tích.",
    ],
    targetNote: "C5",
    practiceTip:
      "Chọn từng nốt, xem bảng thế bấm ngón rồi ghi âm để AI kiểm tra cao độ và độ ổn định.",
  },
  {
    id: 4,
    category: "Cơ bản",
    title: "Bài 4: Cách lấy hơi",
    duration: "10:00",
    status: "not_started",
    objective:
      "Biết cách hít vào, giữ hơi và đẩy hơi ổn định để tạo nền tảng cho tiếng sáo rõ, đều.",
    theory: [
      "Hít vào bằng mũi hoặc kết hợp mũi và miệng, đưa hơi xuống bụng thay vì chỉ nâng vai.",
      "Giữ vai, cổ và hàm thả lỏng để hơi không bị gằn hoặc đẩy quá mạnh.",
      "Khi thổi sáo, đẩy hơi thành luồng mảnh và đều; không xả hết hơi trong một lần.",
      "Tập giữ một luồng hơi ổn định trong 4 đến 6 giây trước khi chuyển sang câu dài hơn.",
      "Lấy hơi ở cuối cụm nhạc ngắn, tránh để hết sạch hơi rồi mới hít tiếp.",
    ],
    targetNote: "C5",
    practiceTip:
      "Thổi một nốt Đô thật đều trong 4-6 giây, nghỉ ngắn để lấy hơi rồi lặp lại 3 lần.",
  },
  {
    id: 5,
    category: "Cơ bản",
    title: "Bài 5: Luyện tập bấm sáo 6 lỗ",
    duration: "15:00",
    status: "not_started",
    objective:
      "Luyện phối hợp 6 ngón bấm cơ bản, bịt kín lỗ và chuyển nốt chậm rãi để âm không bị xì.",
    theory: [
      "Tay trái phụ trách 3 lỗ phía gần đầu thổi, tay phải phụ trách 3 lỗ còn lại.",
      "Dùng phần thịt đầu ngón tay che kín lỗ bấm; nếu hở một phần nhỏ, âm sẽ rè hoặc lệch cao độ.",
      "Giữ các ngón cong nhẹ và đặt sát mặt sáo để khi chuyển nốt không phải nhấc quá xa.",
      "Luyện từng thế bấm chậm, ưu tiên âm rõ trước khi tăng tốc độ đổi ngón.",
      "Khi đổi nốt, giữ hơi liên tục và chỉ thay đổi ngón; tránh ngắt hơi theo từng nốt.",
    ],
    targetNote: "D5",
    practiceTip:
      "Luyện chuỗi Đô - Rê - Mi thật chậm, giữ mỗi nốt 3 giây và kiểm tra lỗ bấm đã kín.",
  },
  {
    id: 6,
    category: "Trung cấp",
    title: "Bài 6: Lý thuyết về Nhịp và Phách",
    duration: "12:00",
    status: "not_started",
    objective:
      "Hiểu nhịp, phách và cách đếm đều để luyện sáo đúng tốc độ, không vào sớm hoặc trễ nhịp.",
    theory: [
      "Nhịp là khung thời gian lặp lại trong bản nhạc; phách là các nhịp đếm nhỏ bên trong khung đó.",
      "Phách mạnh thường là điểm tựa đầu ô nhịp, giúp người chơi biết nơi bắt đầu câu nhạc.",
      "Khi mới học, hãy đếm đều bằng miệng hoặc dùng metronome trước khi ghép với thế bấm.",
      "Không nên đổi ngón theo cảm giác vội; mỗi nốt cần rơi đúng phách đã đếm.",
      "Bắt đầu ở tốc độ chậm, sau đó tăng dần khi hơi và ngón đã ổn định.",
    ],
    targetNote: "C5",
    practiceTip:
      "Bật nhịp chậm 60 BPM, thổi một nốt Đô theo 4 phách đều rồi nghỉ 1 ô nhịp.",
  },
  {
    id: 7,
    category: "Trung cấp",
    title: "Bài 7: Lý thuyết thế bấm quãng 2",
    duration: "15:00",
    status: "not_started",
    objective:
      "Hiểu quãng 2 là khoảng cách giữa hai nốt liền kề và luyện chuyển ngón gần nhau cho đều, không vấp nhịp.",
    theory: [
      "Quãng 2 là khoảng cách giữa hai nốt đứng liền nhau, ví dụ Đô - Rê, Rê - Mi hoặc Mi - Pha.",
      "Khi luyện quãng 2, thay đổi ngón thường ít hơn các quãng xa nhưng vẫn cần bấm kín và đúng thời điểm.",
      "Giữ luồng hơi liên tục khi chuyển từ nốt trước sang nốt sau; không ngắt hơi theo từng nốt.",
      "Đếm nhịp chậm để mỗi lần đổi ngón rơi đúng phách, tránh chuyển sớm hoặc trễ.",
      "Luyện từng cặp quãng 2 lên và xuống trước khi ghép thành chuỗi dài hơn.",
    ],
    targetNote: "D5",
    practiceTip:
      "Luyện cặp Đô - Rê rồi Rê - Đô thật chậm, giữ mỗi nốt 2-3 giây và giữ hơi liền mạch.",
  },
  {
    id: 8,
    category: "Trung cấp",
    title: "Bài 8: Luyện tập thổi bài cơ bản",
    duration: "15:00",
    status: "not_started",
    objective:
      "Ghép hơi, nhịp và thế bấm để thổi một đoạn giai điệu ngắn với âm rõ và nhịp đều.",
    theory: [
      "Đọc trước tên nốt và nhịp của đoạn nhạc trước khi đặt sáo lên môi.",
      "Chia bài thành từng cụm ngắn, luyện chậm từng cụm rồi mới nối thành câu dài.",
      "Giữ hơi đều xuyên suốt câu nhạc, chỉ lấy hơi ở điểm nghỉ hợp lý.",
      "Khi lỗi một nốt, quay lại tốc độ chậm thay vì cố thổi nhanh toàn bài.",
      "Ghi âm lại bài cơ bản để kiểm tra âm sắc, nhịp và độ ổn định giữa các nốt.",
    ],
    targetNote: "E5",
    practiceTip:
      "Luyện chuỗi Đô - Rê - Mi - Rê - Đô theo nhịp chậm, ưu tiên đều hơi và đúng phách.",
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
