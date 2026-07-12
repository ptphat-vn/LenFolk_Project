import axios from "axios";

type ApiErrorBody = {
  message?: unknown;
  detail?: unknown;
  error?: unknown;
};

const DEFAULT_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại.";
const SERVER_UNAVAILABLE_MESSAGE =
  "Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend server đã được khởi động.";

const cleanMessage = (value: unknown) => {
  if (typeof value !== "string") return undefined;

  const message = value
    .replace(/request failed with status code\s*\d+/gi, "")
    .replace(/\b(?:http\s*)?status(?:\s*code)?\s*[:=-]?\s*\d{3}\b/gi, "")
    .replace(/^\s*[-:–—]+\s*/, "")
    .trim();

  return message || undefined;
};

const getBackendMessage = (data: unknown): string | undefined => {
  if (typeof data === "string") {
    const value = data.trim();

    if (
      (value.startsWith("{") && value.endsWith("}")) ||
      (value.startsWith("[") && value.endsWith("]"))
    ) {
      try {
        return getBackendMessage(JSON.parse(value));
      } catch {
        return undefined;
      }
    }

    return cleanMessage(value);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) return undefined;

  const body = data as ApiErrorBody;
  return (
    getBackendMessage(body.message) ??
    getBackendMessage(body.detail) ??
    getBackendMessage(body.error)
  );
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = DEFAULT_MESSAGE,
) => {
  if (axios.isAxiosError(error)) {
    const backendMessage = getBackendMessage(error.response?.data);
    if (backendMessage) return backendMessage;

    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      /timeout(?: of)?\s*\d+ms/i.test(error.message) ||
      (!error.response && error.code === "ERR_NETWORK")
    ) {
      return SERVER_UNAVAILABLE_MESSAGE;
    }

    if (error.response?.status === 401) {
      return "Email hoặc mật khẩu không đúng.";
    }

    if (error.response?.status === 409) {
      return "Email đã được sử dụng cho tài khoản khác.";
    }

    return fallback;
  }

  if (error instanceof Error) {
    return cleanMessage(error.message) ?? fallback;
  }

  return fallback;
};

