export const mockNews = [
  { tag: 'Sự kiện', title: 'Vươn Mình Cùng Đất Nước — Sự kiện biểu diễn FPT 2026', date: '20 Thg 5' },
  { tag: 'Nghệ thuật', title: 'Nghệ thuật sáo trúc trong kỷ nguyên số', date: '20 Thg 5' },
  { tag: 'Công nghệ', title: 'LENFOLK ra mắt tính năng AI nhận diện âm thanh mới', date: '20 Thg 5' },
];

export const getNews = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockNews);
    }, 500);
  });
};
