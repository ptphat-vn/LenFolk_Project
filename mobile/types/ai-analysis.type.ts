export type AudioUpload = {
  uri: string;
  name: string;
  type: string;
};

export type AnalysisResult = Record<string, unknown>;

export type BaseAnalysisPayload = {
  file: AudioUpload;
  message?: string;
  maxDurationSec?: number;
  useLlm?: boolean;
};

export type AdvancedAnalysisPayload = BaseAnalysisPayload & {
  fast?: boolean;
};

export const createAnalysisFormData = ({
  file,
  message,
}: Pick<BaseAnalysisPayload, "file" | "message">) => {
  const formData = new FormData();

  formData.append("file", file as unknown as Blob);

  if (message) {
    formData.append("message", message);
  }

  return formData;
};
