const axios = require('axios');
const config = require('../config');

const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

const extractOpenAIOutputText = (response) => {
  if (typeof response.output_text === 'string') return response.output_text;

  const textParts = response.output
    ?.flatMap((item) => item.content ?? [])
    ?.map((content) => content.text)
    ?.filter((text) => typeof text === 'string');

  return textParts?.join('\n').trim() || '';
};

const extractGeminiOutputText = (response) => {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text)
    .filter((text) => typeof text === 'string')
    .join('\n')
    .trim();
};

const parseJsonObject = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
};

const createAnalysisPrompt = ({ transcript, message, mode, provider, fast = true }) => `
Bạn là trợ lý luyện thổi sáo trúc cho người mới học.

Yêu cầu từ app:
${message || 'Phân tích bản ghi luyện tập và đưa nhận xét ngắn gọn bằng tiếng Việt.'}

${
  transcript
    ? `Bản ghi đã được chuyển thành văn bản:\n${transcript}`
    : 'Hãy phân tích trực tiếp file âm thanh/video người học gửi lên.'
}

Trả về DUY NHẤT một JSON object hợp lệ, không markdown, theo schema:
{
  "file_info": {
    "transcript": "chuỗi transcript nếu có, nếu không có thì để rỗng",
    "model": "model đã dùng",
    "provider": "${provider}"
  },
  "summary": {
    "score": số nguyên từ 0 đến 100,
    "label": "nhãn ngắn",
    "summary": "1-2 câu nhận xét",
    "issues": ["tối đa 2 vấn đề"],
    "recommendations": ["tối đa 2 gợi ý"]
  }
}

Chế độ phân tích: ${mode}.
${fast ? 'Ưu tiên tốc độ: nhận xét thật ngắn, không phân tích dài.' : 'Ưu tiên chất lượng nhận xét nhưng vẫn ngắn gọn.'}
Nếu file chủ yếu là tiếng sáo không lời, hãy nói rõ giới hạn nhận diện và vẫn đưa gợi ý luyện tập hữu ích.
`;

const getErrorMessage = (error) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  error.message ||
  'AI provider request failed';

const assertProviderKey = (provider) => {
  if (provider === 'openai' && !config.ai.openaiApiKey) {
    const err = new Error('Backend chưa cấu hình OPENAI_API_KEY');
    err.statusCode = 500;
    throw err;
  }

  if (provider === 'gemini' && !config.ai.geminiApiKey) {
    const err = new Error('Backend chưa cấu hình GEMINI_API_KEY');
    err.statusCode = 500;
    throw err;
  }
};

const analyzeWithOpenAI = async ({ file, message, mode, fast }) => {
  assertProviderKey('openai');

  const transcriptionForm = new FormData();
  transcriptionForm.append(
    'file',
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname || 'practice-audio.m4a',
  );
  transcriptionForm.append('model', config.ai.openaiTranscriptionModel);
  transcriptionForm.append('response_format', 'json');
  if (message) transcriptionForm.append('prompt', message);

  try {
    const transcriptionResponse = await axios.post(
      `${OPENAI_BASE_URL}/audio/transcriptions`,
      transcriptionForm,
      {
        headers: {
          Authorization: `Bearer ${config.ai.openaiApiKey}`,
        },
        maxBodyLength: Infinity,
        timeout: 180000,
      },
    );

    const transcript = transcriptionResponse.data?.text || '';
    const analysisResponse = await axios.post(
      `${OPENAI_BASE_URL}/responses`,
      {
        model: config.ai.openaiAnalysisModel,
        input: createAnalysisPrompt({
          transcript,
          message,
          mode,
          provider: 'openai',
          fast,
        }),
        max_output_tokens: fast ? 260 : 420,
        reasoning: { effort: 'low' },
        store: false,
        text: {
          format: {
            type: 'json_object',
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.ai.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 180000,
      },
    );

    const outputText = extractOpenAIOutputText(analysisResponse.data);
    const parsed = parseJsonObject(outputText);

    return (
      parsed || {
        file_info: {
          transcript,
          model: config.ai.openaiAnalysisModel,
          provider: 'openai',
        },
        summary: {
          score: null,
          label: 'Đã phân tích',
          summary: outputText || 'OpenAI đã trả kết quả nhưng chưa đọc được JSON.',
          issues: [],
          recommendations: [],
        },
      }
    );
  } catch (error) {
    const err = new Error(getErrorMessage(error));
    err.statusCode = error.response?.status || 502;
    throw err;
  }
};

const analyzeWithGemini = async ({ file, message, mode, fast }) => {
  assertProviderKey('gemini');

  try {
    const prompt = createAnalysisPrompt({
      transcript: '',
      message,
      mode,
      provider: 'gemini',
      fast,
    });

    const response = await axios.post(
      `${GEMINI_BASE_URL}/models/${config.ai.geminiAnalysisModel}:generateContent`,
      {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: file.mimetype,
                  data: file.buffer.toString('base64'),
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.15,
          candidateCount: 1,
          maxOutputTokens: fast ? 260 : 420,
          thinkingConfig: {
            thinkingBudget: fast ? 0 : 512,
          },
        },
      },
      {
        params: { key: config.ai.geminiApiKey },
        headers: { 'Content-Type': 'application/json' },
        maxBodyLength: Infinity,
        timeout: 180000,
      },
    );

    const outputText = extractGeminiOutputText(response.data);
    const parsed = parseJsonObject(outputText);

    return (
      parsed || {
        file_info: {
          transcript: '',
          model: config.ai.geminiAnalysisModel,
          provider: 'gemini',
        },
        summary: {
          score: null,
          label: 'Đã phân tích',
          summary: outputText || 'Gemini đã trả kết quả nhưng chưa đọc được JSON.',
          issues: [],
          recommendations: [],
        },
      }
    );
  } catch (error) {
    const err = new Error(getErrorMessage(error));
    err.statusCode = error.response?.status || 502;
    throw err;
  }
};

exports.analyzePracticeMedia = async ({
  provider,
  file,
  message,
  mode,
  fast = true,
}) => {
  if (provider === 'openai') {
    return analyzeWithOpenAI({ file, message, mode, fast });
  }

  return analyzeWithGemini({ file, message, mode, fast });
};
