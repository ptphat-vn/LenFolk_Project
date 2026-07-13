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

const clampProbability = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(1, Math.max(0, number));
};

const createAudioDetectionPrompt = () => `
Bạn là bộ kiểm duyệt audio nghiêm ngặt trước khi chấm bài luyện sáo trúc.
Hãy nghe toàn bộ file và phân loại âm thanh thực tế, không suy đoán từ tên file hay yêu cầu của người dùng.

Trả về DUY NHẤT một JSON object hợp lệ, không markdown:
{
  "dominant_sound": "flute" | "speech" | "noise" | "music_other" | "silence" | "mixed" | "unknown",
  "flute_probability": số từ 0 đến 1,
  "speech_probability": số từ 0 đến 1,
  "speech_ratio": số từ 0 đến 1,
  "has_sustained_tonal_notes": boolean,
  "has_breath_blown_flute_timbre": boolean,
  "evidence": ["tối đa 3 dấu hiệu nghe được"],
  "detected_notes_or_ranges": ["cao độ hoặc vùng cao độ nếu đủ chắc chắn"],
  "quality_observations": ["độ ổn định cao độ, hơi, tiếng gió, chuyển nốt nếu có"]
}

Quy tắc bắt buộc:
- Lời nói, đọc tên nốt, hát, huýt sáo, tiếng nền hoặc im lặng KHÔNG phải tiếng sáo.
- Chỉ chọn dominant_sound="flute" khi tiếng sáo là âm thanh chính và có bằng chứng âm sắc hơi thổi cùng cao độ nhạc cụ kéo dài.
- Nếu nghe được câu nói hoặc nhiều từ có nghĩa, dominant_sound phải là "speech" hoặc "mixed"; speech_probability tối thiểu 0.9 khi file chỉ có giọng nói.
- Không được xem nguyên âm kéo dài, hát, đọc tên nốt hoặc huýt sáo là âm sắc sáo; detected_notes_or_ranges phải để rỗng nếu chỉ nghe giọng người.
- Nếu không chắc, giảm flute_probability và chọn "mixed" hoặc "unknown".
`;

const normalizeAudioDetection = (value) => {
  const dominantSound = typeof value?.dominant_sound === 'string'
    ? value.dominant_sound
    : 'unknown';
  const fluteProbability = clampProbability(value?.flute_probability);
  const speechProbability = clampProbability(value?.speech_probability);
  const speechRatio = clampProbability(value?.speech_ratio);
  const evidence = Array.isArray(value?.evidence)
    ? value.evidence.filter((item) => typeof item === 'string').slice(0, 3)
    : [];
  const qualityObservations = Array.isArray(value?.quality_observations)
    ? value.quality_observations.filter((item) => typeof item === 'string').slice(0, 4)
    : [];
  const detectedNotesOrRanges = Array.isArray(value?.detected_notes_or_ranges)
    ? value.detected_notes_or_ranges.filter((item) => typeof item === 'string').slice(0, 8)
    : [];
  const isFlute =
    dominantSound === 'flute' &&
    fluteProbability >= 0.9 &&
    speechProbability <= 0.15 &&
    speechRatio <= 0.1 &&
    detectedNotesOrRanges.length > 0 &&
    value?.has_sustained_tonal_notes === true &&
    value?.has_breath_blown_flute_timbre === true;

  return {
    dominant_sound: dominantSound,
    flute_probability: fluteProbability,
    speech_probability: speechProbability,
    speech_ratio: speechRatio,
    has_sustained_tonal_notes: value?.has_sustained_tonal_notes === true,
    has_breath_blown_flute_timbre: value?.has_breath_blown_flute_timbre === true,
    evidence,
    detected_notes_or_ranges: detectedNotesOrRanges,
    quality_observations: qualityObservations,
    is_flute: isFlute,
  };
};

const createAnalysisPrompt = ({ transcript, detection, message, mode, provider, fast = true }) => `
Bạn là trợ lý luyện thổi sáo trúc cho người mới học.

Yêu cầu từ app:
${message || 'Phân tích bản ghi luyện tập và đưa nhận xét ngắn gọn bằng tiếng Việt.'}

${
  transcript
    ? `Bản ghi đã được chuyển thành văn bản:\n${transcript}`
    : 'Hãy phân tích trực tiếp file âm thanh/video người học gửi lên.'
}

Kết quả kiểm duyệt audio trực tiếp (đã xác nhận có tiếng sáo):
${JSON.stringify(detection)}

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
Chỉ đánh giá những gì có bằng chứng trong kết quả kiểm duyệt audio. Không cộng điểm vì lời nói hoặc transcript. Nếu thiếu bằng chứng cho một tiêu chí thì nêu là chưa đủ dữ liệu, không tự suy diễn.
- Điểm 80 trở lên chỉ khi có bằng chứng rõ về cao độ ổn định, luồng hơi và chuyển nốt.
- Điểm 90 trở lên chỉ khi các tiêu chí kỹ thuật đều rất tốt; không dùng điểm cao như điểm mặc định.
- Nếu phát hiện lời nói chiếm ưu thế thì score bắt buộc bằng 0.
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

const detectFluteWithGemini = async (file) => {
  assertProviderKey('gemini');

  try {
    const response = await axios.post(
      `${GEMINI_BASE_URL}/models/${config.ai.geminiAnalysisModel}:generateContent`,
      {
        contents: [
          {
            role: 'user',
            parts: [
              { text: createAudioDetectionPrompt() },
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
          temperature: 0,
          candidateCount: 1,
          maxOutputTokens: 360,
          thinkingConfig: { thinkingBudget: 0 },
        },
      },
      {
        params: { key: config.ai.geminiApiKey },
        headers: { 'Content-Type': 'application/json' },
        maxBodyLength: Infinity,
        timeout: 180000,
      },
    );

    const parsed = parseJsonObject(extractGeminiOutputText(response.data));
    if (!parsed) {
      const err = new Error('AI không trả được kết quả nhận diện tiếng sáo hợp lệ');
      err.statusCode = 502;
      throw err;
    }

    return normalizeAudioDetection(parsed);
  } catch (error) {
    if (error.statusCode) throw error;
    const err = new Error(getErrorMessage(error));
    err.statusCode = error.response?.status || 502;
    throw err;
  }
};

const countTranscriptWords = (transcript) =>
  String(transcript || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const transcriptConfirmsSpeech = (transcript, detection) =>
  countTranscriptWords(transcript) >= 6 &&
  (detection.speech_probability >= 0.08 || detection.speech_ratio >= 0.05);

const normalizeAnalysisResult = (result, detection, fallbackFileInfo = {}) => {
  const rawScore = Number(result?.summary?.score);
  const evidenceCeiling = Math.round(
    100 * detection.flute_probability * (1 - detection.speech_probability),
  );
  const score = Number.isFinite(rawScore)
    ? Math.min(100, evidenceCeiling, Math.max(0, Math.round(rawScore)))
    : null;

  return {
    ...result,
    file_info: {
      ...fallbackFileInfo,
      ...(result?.file_info || {}),
      audio_detection: detection,
    },
    summary: {
      ...(result?.summary || {}),
      score,
    },
  };
};

const createNonFluteResult = (detection, provider) => ({
  file_info: {
    transcript: '',
    model: config.ai.geminiAnalysisModel,
    provider,
    audio_detection: detection,
  },
  summary: {
    score: 0,
    label: 'Không nhận diện được tiếng sáo',
    summary:
      detection.dominant_sound === 'speech'
        ? 'Bản ghi chủ yếu là giọng nói nên không được chấm như bài thổi sáo.'
        : 'Bản ghi chưa có đủ bằng chứng âm sắc và cao độ để xác nhận là tiếng sáo.',
    issues: detection.evidence,
    recommendations: [
      'Ghi lại ở nơi yên tĩnh và thổi nốt sáo rõ trong vài giây.',
      'Không nói trong lúc ghi; đặt micro cách sáo vừa phải để tránh tiếng gió quá lớn.',
    ],
  },
});

const analyzeWithOpenAI = async ({ file, detection, message, mode, fast }) => {
  assertProviderKey('openai');

  const transcriptionForm = new FormData();
  transcriptionForm.append(
    'file',
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname || 'practice-audio.m4a',
  );
  transcriptionForm.append('model', config.ai.openaiTranscriptionModel);
  transcriptionForm.append('response_format', 'json');

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
    if (transcriptConfirmsSpeech(transcript, detection)) {
      return createNonFluteResult(
        {
          ...detection,
          dominant_sound: 'speech',
          speech_probability: Math.max(detection.speech_probability, 0.9),
          is_flute: false,
          evidence: [
            ...detection.evidence,
            'Bản chuyển lời chứa một câu nói có nghĩa.',
          ].slice(0, 3),
        },
        'openai',
      );
    }

    const analysisResponse = await axios.post(
      `${OPENAI_BASE_URL}/responses`,
      {
        model: config.ai.openaiAnalysisModel,
        input: createAnalysisPrompt({
          transcript,
          detection,
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

    const result =
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
      };

    return normalizeAnalysisResult(result, detection, {
      transcript,
      model: config.ai.openaiAnalysisModel,
      provider: 'openai',
    });
  } catch (error) {
    const err = new Error(getErrorMessage(error));
    err.statusCode = error.response?.status || 502;
    throw err;
  }
};

const analyzeWithGemini = async ({ file, detection, message, mode, fast }) => {
  assertProviderKey('gemini');

  try {
    const prompt = createAnalysisPrompt({
      transcript: '',
      detection,
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

    const result =
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
      };

    return normalizeAnalysisResult(result, detection, {
      transcript: '',
      model: config.ai.geminiAnalysisModel,
      provider: 'gemini',
    });
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
  const detection = await detectFluteWithGemini(file);
  if (!detection.is_flute) {
    return createNonFluteResult(detection, provider);
  }

  if (provider === 'openai') {
    return analyzeWithOpenAI({ file, detection, message, mode, fast });
  }

  return analyzeWithGemini({ file, detection, message, mode, fast });
};

exports.normalizeAudioDetection = normalizeAudioDetection;
