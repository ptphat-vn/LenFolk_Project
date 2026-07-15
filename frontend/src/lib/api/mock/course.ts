export const mockCourses = [
  {
    id: 'free',
    name: 'Gói Foundations',
    price: 'Miễn phí',
    desc: 'Trải nghiệm cơ bản với AI demo và một số bài học giới hạn.',
    features: ['Tìm hiểu và trải nghiệm về sáo trúc', 'Trợ lý AI Y Len đánh giá hơi thổi', 'Giới hạn 5 bài học', 'Không giới hạn thời gian'],
  },
  {
    id: 'pre',
    name: 'Gói Repertoire ',
    price: 'Chỉ từ 399.000đ / tác phẩm',
    desc: 'Lựa chọn phổ biến cho người mới bắt đầu học sáo trúc nghiêm túc.',
    features: [
      'Tác phẩm chuyên biệt & bản cover từ nguồn có chuyên môn',
      'AI Y Len phân tích âm điệu và tôn vinh màu sắc âm nhạc cá nhân',
      'Đặc quyền đồng hành cùng giảng viên để tinh chỉnh và hoàn thiện bài',
      'Trọn bộ học liệu độc quyền bao gồm sheet nhạc, cảm âm và beat chất lượng cao'
    ],
  }
];

export const getCourses = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCourses);
    }, 500);
  });
};
