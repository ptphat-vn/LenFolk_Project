const { bearer, err, formBody } = require('./_shared');

const aiAnalysisResponse = {
  description: 'Kết quả phân tích AI',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/AIAnalysisResponse' },
    },
  },
};

const multipartEndpoint = (summary, description) => ({
  tags: ['AIAnalysis'],
  summary,
  description,
  security: bearer,
  requestBody: formBody('AIAnalysisUpload'),
  responses: {
    200: aiAnalysisResponse,
    400: err('Thiếu file hoặc file không hợp lệ'),
    401: err('Chưa xác thực'),
    502: err('AI provider trả lỗi'),
  },
});

module.exports = {
  '/ai-analysis/basic': {
    post: multipartEndpoint(
      'Phân tích luyện tập cơ bản bằng HTTP upload',
      'Fallback HTTP multipart. Mobile hiện dùng WebSocket chunk ở /api/ai-analysis/stream, nhưng endpoint này vẫn nhận audio/video field "file". Free user dùng Gemini; user có gói dùng OpenAI.',
    ),
  },
  '/ai-analysis/advanced': {
    post: multipartEndpoint(
      'Phân tích luyện tập nâng cao bằng HTTP upload',
      'Fallback HTTP multipart cho chế độ advanced. Free user dùng Gemini; user có gói dùng OpenAI.',
    ),
  },
  '/ai-analysis/stream': {
    get: {
      tags: ['AIAnalysis'],
      summary: 'WebSocket stream/chunk audio-video để phân tích AI',
      description:
        'WebSocket endpoint: ws(s)://<host>/api/ai-analysis/stream?token=<JWT>. Protocol: server gửi {"type":"connected"}; client gửi {"type":"start","mode":"basic|advanced","fileName":"practice.m4a","mimeType":"audio/mp4","totalSize":12345,"message":"..."}; server trả ready; client gửi nhiều {"type":"chunk","index":0,"data":"base64..."}; client gửi {"type":"end"}; server trả progress/analyzing/result/error. Giới hạn file 25MB, chunk tối đa 512KB.',
      security: bearer,
      responses: {
        101: {
          description: 'Switching Protocols - WebSocket connection established',
        },
        401: err('Token không hợp lệ hoặc thiếu token'),
      },
    },
  },
};
