import { useMutation } from "@tanstack/react-query";

import aiAxios from "@/setup/ai-axios";
import {
  AnalysisResult,
  BaseAnalysisPayload,
  createAnalysisFormData,
} from "@/types/ai-analysis.type";

export const useBasic = <AnalysisResult>() =>
  useMutation({
    mutationFn: async ({
      file,
      message,
      maxDurationSec,
      useLlm = false,
      onUploadProgress,
    }: BaseAnalysisPayload) => {
      const response = await aiAxios.post<AnalysisResult>(
        "/analyze/basic",
        createAnalysisFormData({ file, message }),
        {
          params: {
            max_duration_sec: maxDurationSec,
            use_llm: useLlm,
          },
          onUploadProgress: (event) => {
            if (!onUploadProgress) return;
            const total = event.total ?? 0;
            if (total > 0) {
              onUploadProgress(Math.round((event.loaded / total) * 100));
            }
          },
        },
      );

      return response.data;
    },
  });

export const useBasicAnalysis = useBasic;
