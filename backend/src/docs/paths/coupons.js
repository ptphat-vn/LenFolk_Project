const { bearer, idParam, okData, okList, okMessage, err, jsonBody } = require('./_shared');

module.exports = {
  '/coupons': {
    get: {
      tags: ['Coupons'], summary: 'Danh sách mã giảm giá (admin)', security: bearer,
      responses: { 200: okList('Coupon') },
    },
    post: {
      tags: ['Coupons'], summary: 'Tạo mã giảm giá (admin)', security: bearer,
      requestBody: jsonBody('CouponInput'),
      responses: { 201: okData('Coupon', 'Đã tạo') },
    },
  },
  '/coupons/{id}': {
    get: {
      tags: ['Coupons'], summary: 'Chi tiết mã giảm giá (admin)', security: bearer,
      parameters: [idParam], responses: { 200: okData('Coupon'), 404: err('Không tìm thấy') },
    },
    patch: {
      tags: ['Coupons'], summary: 'Cập nhật mã giảm giá (admin)', security: bearer,
      parameters: [idParam], requestBody: jsonBody('CouponInput', false),
      responses: { 200: okData('Coupon', 'Đã cập nhật'), 404: err('Không tìm thấy') },
    },
    delete: {
      tags: ['Coupons'], summary: 'Xóa mã giảm giá (admin)', security: bearer,
      parameters: [idParam], responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') },
    },
  },
};
