const jwt = require('jsonwebtoken');
const { WebSocketServer, WebSocket } = require('ws');

const config = require('../config');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const aiAnalysisService = require('../services/ai-analysis.service');

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_CHUNK_SIZE = 512 * 1024;

const sendJson = (ws, payload) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
};

const closeWithError = (ws, message, code = 1008, errorCode) => {
  sendJson(ws, {
    type: 'error',
    message,
    ...(errorCode ? { code: errorCode } : {}),
  });
  ws.close(code, message.slice(0, 120));
};

const getTokenFromRequest = (request) => {
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }

  const url = new URL(request.url, 'ws://localhost');
  return url.searchParams.get('token');
};

const authenticateRequest = async (request) => {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const decoded = jwt.verify(token, config.jwt.secret);
  const user = await User.findById(decoded.id);
  return user && user.isActive ? user : null;
};

const getAnalysisProviderForUser = async (user) => {
  if (user.isSubscribed) return 'openai';

  const enrollment = await Enrollment.findOne({
    userId: user._id,
    status: 'active',
    isPaid: true,
    itemType: 'course',
    $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
  }).select('_id');

  return enrollment ? 'openai' : 'gemini';
};

const createSession = () => ({
  chunks: [],
  receivedBytes: 0,
  mode: 'basic',
  message: '',
  fileName: 'practice-media.m4a',
  mimeType: 'audio/mp4',
  totalSize: 0,
  fast: true,
  useLlm: true,
  isStarted: false,
  isAnalyzing: false,
});

const handleStart = (ws, session, payload) => {
  if (session.isStarted) {
    closeWithError(ws, 'Phiên phân tích đã bắt đầu');
    return;
  }

  const mimeType = String(payload.mimeType || '');
  if (!mimeType.startsWith('audio/') && !mimeType.startsWith('video/')) {
    closeWithError(ws, 'Chỉ hỗ trợ audio/video');
    return;
  }

  const totalSize = Number(payload.totalSize || 0);
  if (!Number.isFinite(totalSize) || totalSize <= 0 || totalSize > MAX_FILE_SIZE) {
    closeWithError(ws, 'Kích thước file không hợp lệ hoặc vượt quá 25MB');
    return;
  }

  session.mode = payload.mode === 'advanced' ? 'advanced' : 'basic';
  session.message = typeof payload.message === 'string' ? payload.message : '';
  session.fileName =
    typeof payload.fileName === 'string' && payload.fileName.trim()
      ? payload.fileName.trim()
      : 'practice-media.m4a';
  session.mimeType = mimeType;
  session.totalSize = totalSize;
  session.fast = payload.fast !== false;
  session.useLlm = payload.useLlm !== false;
  session.isStarted = true;

  sendJson(ws, { type: 'ready' });
};

const handleChunk = (ws, session, payload) => {
  if (!session.isStarted || session.isAnalyzing) {
    closeWithError(ws, 'Chunk được gửi sai trạng thái');
    return;
  }

  if (typeof payload.data !== 'string' || payload.data.length === 0) {
    closeWithError(ws, 'Chunk rỗng hoặc sai định dạng');
    return;
  }

  const chunk = Buffer.from(payload.data, 'base64');
  if (chunk.length > MAX_CHUNK_SIZE) {
    closeWithError(ws, 'Chunk vượt quá giới hạn 512KB');
    return;
  }

  session.receivedBytes += chunk.length;
  if (session.receivedBytes > MAX_FILE_SIZE || session.receivedBytes > session.totalSize) {
    closeWithError(ws, 'Dung lượng nhận vượt quá giới hạn');
    return;
  }

  session.chunks.push(chunk);
  sendJson(ws, {
    type: 'progress',
    receivedBytes: session.receivedBytes,
    totalSize: session.totalSize,
    percent: Math.round((session.receivedBytes * 100) / session.totalSize),
  });
};

const handleEnd = async (ws, session, user) => {
  if (!session.isStarted || session.isAnalyzing) {
    closeWithError(ws, 'Phiên phân tích chưa sẵn sàng');
    return;
  }

  if (session.receivedBytes !== session.totalSize) {
    closeWithError(ws, 'File upload chưa đủ dữ liệu');
    return;
  }

  session.isAnalyzing = true;
  sendJson(ws, { type: 'analyzing' });

  const provider = await getAnalysisProviderForUser(user);
  const buffer = Buffer.concat(session.chunks, session.receivedBytes);
  const result = await aiAnalysisService.analyzePracticeMedia({
    provider,
    file: {
      buffer,
      mimetype: session.mimeType,
      originalname: session.fileName,
      size: buffer.length,
    },
    message: session.message,
    mode: session.mode,
    fast: session.fast,
    useLlm: session.useLlm,
  });

  sendJson(ws, {
    type: 'result',
    provider,
    data: result,
  });
  ws.close(1000, 'done');
};

const initAiAnalysisWebSocket = (server) => {
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 800 * 1024,
  });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url, 'ws://localhost');
    if (pathname !== '/api/ai-analysis/stream') {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', async (ws, request) => {
    let user;
    try {
      user = await authenticateRequest(request);
    } catch {
      closeWithError(ws, 'Token không hợp lệ');
      return;
    }

    if (!user) {
      closeWithError(ws, 'Chưa xác thực');
      return;
    }

    const session = createSession();
    sendJson(ws, { type: 'connected' });

    ws.on('message', async (raw, isBinary) => {
      try {
        if (isBinary) {
          closeWithError(ws, 'Vui lòng gửi JSON text message');
          return;
        }

        const payload = JSON.parse(raw.toString());
        if (payload.type === 'start') {
          handleStart(ws, session, payload);
          return;
        }
        if (payload.type === 'chunk') {
          handleChunk(ws, session, payload);
          return;
        }
        if (payload.type === 'end') {
          await handleEnd(ws, session, user);
          return;
        }

        closeWithError(ws, 'Message type không hợp lệ');
      } catch (error) {
        // Lỗi nghiệp vụ (vd: không phải tiếng sáo) dùng close code 1008 và
        // kèm error.code để client phân biệt với lỗi hệ thống (1011).
        const isOperational = Boolean(error.code || error.isOperational);
        closeWithError(
          ws,
          error.message || 'Không thể xử lý WebSocket message',
          isOperational ? 1008 : 1011,
          error.code,
        );
      }
    });
  });
};

module.exports = initAiAnalysisWebSocket;
