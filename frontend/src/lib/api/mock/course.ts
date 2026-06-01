export const mockCourses = [
  {
    id: 'free',
    name: 'Gói FREE',
    price: 'Miễn phí',
    desc: 'Trải nghiệm cơ bản với AI demo và một số bài học giới hạn.',
    features: ['Track cơ bản', 'AI demo', 'Giới hạn 10 bài học', 'Cộng đồng học viên'],
  },
  {
    id: 'pre',
    name: 'Gói REPERTOIRE',
    price: '499.000đ / tác phẩm',
    desc: 'Lựa chọn phổ biến cho người mới bắt đầu học sáo trúc nghiêm túc.',
    features: ['Toàn bộ track cơ bản & trung cấp', 'AI đánh giá thời gian thực', 'Lộ trình cá nhân hóa', 'Không giới hạn bài học', 'Chứng chỉ hoàn thành'],
  }
];

export const getCourses = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCourses);
    }, 500);
  });
};
