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
  /**
   * Called with the upload progress (0-100) while the audio file is being sent
   * to the AI service. Useful to show that the recorded file is readable and is
   * actually being uploaded.
   */
  onUploadProgress?: (percent: number) => void;
};

export type AdvancedAnalysisPayload = BaseAnalysisPayload & {
  fast?: boolean;
};

export const createAnalysisFormData = ({
  file,
  message,
}: Pick<BaseAnalysisPayload, "file" | "message">) => {
  const formData = new FormData();

  formData.append("file", file as any);

  if (message) {
    formData.append("message", message);
  }

  return formData;
};
