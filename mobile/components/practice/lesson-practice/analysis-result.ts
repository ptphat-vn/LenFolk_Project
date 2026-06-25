import type { CompactAnalysisResult } from "./types";

const parseObjectField = (value: unknown) => {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return typeof value === "object" ? (value as Record<string, unknown>) : null;
};

const toStringList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];

const shorten = (value: unknown, maxLength = 120) => {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};

export const parseAnalysisData = (data: unknown) => {
  if (!data || typeof data !== "object") return null;

  const rawData = data as Record<string, unknown>;
  const fileInfo = parseObjectField(
    rawData.file_info || rawData["File Info"] || rawData.fileInfo,
  );
  let summary = parseObjectField(
    rawData.summary || rawData["Summary"] || rawData.summaryInfo,
  );

  if (!summary && (rawData.score !== undefined || rawData.summary !== undefined)) {
    summary = rawData;
  }

  return { fileInfo, summary };
};

export const getCompactAnalysisResult = (
  data: unknown,
): CompactAnalysisResult | null => {
  const parsedData = parseAnalysisData(data);
  const summary = parsedData?.summary;

  if (!summary) {
    return data
      ? {
          score: null,
          label: "Đã phân tích",
          description: "AI đã trả kết quả, nhưng chưa đúng định dạng tóm tắt.",
          issues: [],
          recommendations: [],
        }
      : null;
  }

  return {
    score: typeof summary.score === "number" ? Math.round(summary.score) : null,
    label: typeof summary.label === "string" ? summary.label : "Đã phân tích",
    description: shorten(
      summary.summary || summary.description || summary.feedback,
      130,
    ),
    issues: toStringList(summary.issues)
      .slice(0, 2)
      .map((item) => shorten(item, 80)),
    recommendations: toStringList(
      summary.recommendations || summary.suggestions,
    )
      .slice(0, 2)
      .map((item) => shorten(item, 90)),
  };
};
