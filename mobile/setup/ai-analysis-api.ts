import * as FileSystem from "expo-file-system/legacy";

import { API_URL } from "@/constants/api";
import { secureStorage } from "@/lib/secure-storage";
import { useAuthStore } from "@/store/authStore";
import {
  AdvancedAnalysisPayload,
  AnalysisResult,
  BaseAnalysisPayload,
} from "@/types/ai-analysis.type";

type BackendAnalysisPayload = BaseAnalysisPayload &
  Partial<Pick<AdvancedAnalysisPayload, "fast">> & {
    mode: "basic" | "advanced";
  };

const CHUNK_SIZE = 512 * 1024;
const MIN_AUDIO_FILE_BYTES = 2 * 1024;

const getWebSocketUrl = async () => {
  const token =
    useAuthStore.getState().token ?? (await secureStorage.getItem("token"));

  if (!token) {
    throw new Error("Bạn cần đăng nhập để dùng AI phân tích.");
  }

  const baseUrl = API_URL.replace(/^http/i, "ws").replace(/\/$/, "");
  return `${baseUrl}/ai-analysis/stream?token=${encodeURIComponent(token)}`;
};

const getFileSize = async (uri: string) => {
  const info = await FileSystem.getInfoAsync(uri);

  if (!info.exists) {
    throw new Error("Không tìm thấy file cần phân tích.");
  }

  if (typeof info.size !== "number" || info.size < MIN_AUDIO_FILE_BYTES) {
    throw new Error("Bản ghi không hợp lệ hoặc chưa lưu xong. Hãy ghi âm lại ít nhất 1 giây.");
  }

  return info.size;
};

const readBase64Chunk = (uri: string, position: number, length: number) =>
  FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
    position,
    length,
  });

// Web: bản ghi là blob: URL, expo-file-system không đọc được — dùng fetch + FileReader.
const isBlobUri = (uri: string) => uri.startsWith("blob:");

const fetchWebBlob = async (uri: string) => {
  const blob = await (await fetch(uri)).blob();
  if (blob.size < MIN_AUDIO_FILE_BYTES) {
    throw new Error("Bản ghi không hợp lệ hoặc chưa lưu xong. Hãy ghi âm lại ít nhất 1 giây.");
  }
  return blob;
};

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Không đọc được file ghi âm."));
    reader.readAsDataURL(blob);
  });

export const analyzePracticeMedia = async ({
  file,
  message,
  maxDurationSec,
  useLlm,
  fast,
  mode,
  onUploadProgress,
}: BackendAnalysisPayload): Promise<AnalysisResult> => {
  const webBlob = isBlobUri(file.uri) ? await fetchWebBlob(file.uri) : null;
  const [url, totalSize] = await Promise.all([
    getWebSocketUrl(),
    webBlob ? Promise.resolve(webBlob.size) : getFileSize(file.uri),
  ]);
  // Web ghi âm ra webm/ogg chứ không phải m4a — báo đúng mime cho backend.
  const mimeType = webBlob?.type || file.type;

  return new Promise<AnalysisResult>((resolve, reject) => {
    const ws = new WebSocket(url);
    let settled = false;
    let uploadStarted = false;

    const settleReject = (error: Error) => {
      if (settled) return;
      settled = true;
      ws.close();
      reject(error);
    };

    const sendJson = (payload: Record<string, unknown>) => {
      ws.send(JSON.stringify(payload));
    };

    const uploadChunks = async () => {
      if (uploadStarted) return;
      uploadStarted = true;

      try {
        let position = 0;
        while (position < totalSize) {
          const length = Math.min(CHUNK_SIZE, totalSize - position);
          const data = webBlob
            ? await blobToBase64(webBlob.slice(position, position + length))
            : await readBase64Chunk(file.uri, position, length);
          sendJson({
            type: "chunk",
            index: Math.floor(position / CHUNK_SIZE),
            data,
          });
          position += length;
        }

        sendJson({ type: "end" });
      } catch (error) {
        settleReject(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    };

    ws.onopen = () => undefined;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as {
          type?: string;
          message?: string;
          code?: string;
          percent?: number;
          data?: AnalysisResult;
        };

        if (payload.type === "connected") {
          sendJson({
            type: "start",
            mode,
            fileName: file.name,
            mimeType,
            totalSize,
            message,
            maxDurationSec,
            useLlm,
            fast,
          });
          return;
        }

        if (payload.type === "ready") {
          uploadChunks();
          return;
        }

        if (payload.type === "progress" && typeof payload.percent === "number") {
          onUploadProgress?.(payload.percent);
          return;
        }

        if (payload.type === "result") {
          settled = true;
          onUploadProgress?.(100);
          ws.close();
          resolve(payload.data ?? {});
          return;
        }

        if (payload.type === "error") {
          const error = new Error(payload.message || "AI phân tích thất bại.");
          if (payload.code) {
            (error as Error & { code?: string }).code = payload.code;
          }
          settleReject(error);
        }
      } catch (error) {
        settleReject(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    };

    ws.onerror = () => {
      settleReject(new Error("Không thể kết nối WebSocket AI."));
    };

    ws.onclose = (event) => {
      if (!settled && event.code !== 1000) {
        settleReject(
          new Error(event.reason || "Kết nối WebSocket AI đã bị đóng."),
        );
      }
    };
  });
};
