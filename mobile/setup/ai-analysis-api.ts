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

  if (typeof info.size !== "number" || info.size <= 0) {
    throw new Error("File phân tích rỗng hoặc không đọc được dung lượng.");
  }

  return info.size;
};

const readBase64Chunk = (uri: string, position: number, length: number) =>
  FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
    position,
    length,
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
  const [url, totalSize] = await Promise.all([
    getWebSocketUrl(),
    getFileSize(file.uri),
  ]);

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
          const data = await readBase64Chunk(file.uri, position, length);
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
          percent?: number;
          data?: AnalysisResult;
        };

        if (payload.type === "connected") {
          sendJson({
            type: "start",
            mode,
            fileName: file.name,
            mimeType: file.type,
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
          settleReject(new Error(payload.message || "AI phân tích thất bại."));
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
