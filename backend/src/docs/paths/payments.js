module.exports = {
  '/payments/sepay/webhook': {
    post: {
      tags: ['Payments'],
      summary: 'Webhook SePay — xác nhận thanh toán tự động (SePay gọi, KHÔNG dành cho client)',
      description:
        'Endpoint **public** do SePay gọi server-to-server mỗi khi có biến động số dư.\n\n' +
        '**Xác thực:** SePay gửi header `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`. ' +
        'Sai key → `401`. Nếu biến môi trường để trống thì bỏ qua bước xác thực (chỉ nên dùng khi test).\n\n' +
        '**Xử lý:** trích `payCode` (vd `LF1A2B3C4D`) từ `content`/`code` → khớp `TransactionRecord.payCode` → ' +
        'nếu khớp & `transferAmount >= amount` thì hoàn tất đơn (Enrollment `active`, cộng ví instructor, ' +
        '`User.isSubscribed=true`). **Idempotent** — gọi lại không xử lý 2 lần.\n\n' +
        'Luôn trả `200` cho mọi case đã xử lý (kể cả không khớp) để SePay không retry; chỉ `401` khi sai Api Key.',
      security: [{ sepayApiKey: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/SepayWebhookPayload' } },
        },
      },
      responses: {
        200: {
          description: 'Đã tiếp nhận (xem message để biết kết quả khớp đơn)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Payment confirmed' },
                },
              },
            },
          },
        },
        401: {
          description: 'Sai Api Key',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid Api Key' },
                },
              },
            },
          },
        },
      },
    },
  },
};
