module.exports = {
  AIAnalysisUpload: {
    type: 'object',
    required: ['file'],
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'File audio/video cần phân tích. Field name phải là "file".',
      },
      message: {
        type: 'string',
        example:
          'Phân tích nốt sáo người học vừa thổi. Nhận xét ngắn gọn bằng tiếng Việt.',
      },
      maxDurationSec: {
        type: 'number',
        example: 30,
        description: 'Tuỳ chọn, client gửi để mô tả giới hạn thời lượng.',
      },
      useLlm: {
        type: 'boolean',
        example: true,
      },
      fast: {
        type: 'boolean',
        example: false,
        description: 'Tuỳ chọn cho phân tích advanced.',
      },
    },
  },
  AIAnalysisSummary: {
    type: 'object',
    properties: {
      score: { type: 'integer', nullable: true, minimum: 0, maximum: 100, example: 82 },
      label: { type: 'string', example: 'Âm khá ổn' },
      summary: {
        type: 'string',
        example: 'Âm sáo đã rõ, nhưng hơi chưa thật đều ở cuối câu.',
      },
      issues: {
        type: 'array',
        items: { type: 'string' },
        example: ['Hơi bị hụt ở cuối bản ghi'],
      },
      recommendations: {
        type: 'array',
        items: { type: 'string' },
        example: ['Giữ luồng hơi ổn định hơn trong 4-6 giây'],
      },
    },
  },
  AIAnalysisResult: {
    type: 'object',
    properties: {
      file_info: {
        type: 'object',
        properties: {
          transcript: {
            type: 'string',
            example: '',
            description:
              'Transcript nếu provider có bước nhận diện âm thanh; tiếng sáo không lời có thể để rỗng.',
          },
          model: { type: 'string', example: 'gpt-5.2' },
          provider: { type: 'string', enum: ['gemini', 'openai'], example: 'openai' },
        },
      },
      summary: { $ref: '#/components/schemas/AIAnalysisSummary' },
    },
  },
  AIAnalysisResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      provider: { type: 'string', enum: ['gemini', 'openai'], example: 'gemini' },
      data: { $ref: '#/components/schemas/AIAnalysisResult' },
    },
  },
  AIAnalysisWebSocketMessage: {
    type: 'object',
    description:
      'WebSocket JSON message cho /api/ai-analysis/stream. Client gửi start -> nhiều chunk base64 -> end. Server trả connected, ready, progress, analyzing, result hoặc error.',
    properties: {
      type: {
        type: 'string',
        enum: ['start', 'chunk', 'end', 'connected', 'ready', 'progress', 'analyzing', 'result', 'error'],
        example: 'chunk',
      },
      data: {
        type: 'string',
        description: 'Base64 chunk khi type=chunk; AI result khi type=result.',
      },
      percent: {
        type: 'integer',
        example: 42,
        description: 'Tiến độ upload server trả về khi type=progress.',
      },
      message: {
        type: 'string',
        description: 'Prompt phân tích khi type=start hoặc lỗi khi type=error.',
      },
    },
  },
};
