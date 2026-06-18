import { useMutation } from "@tanstack/react-query";

import aiAxios from "@/setup/ai-axios";
import {
  AdvancedAnalysisPayload,
  AnalysisResult,
  createAnalysisFormData,
} from "@/types/ai-analysis.type";

export const useAdvanced = <AnalysisResult>() =>
  useMutation({
    mutationFn: async ({
      file,
      message,
      fast = false,
      maxDurationSec,
      useLlm = false,
      onUploadProgress,
    }: AdvancedAnalysisPayload) => {
      const response = await aiAxios.post<AnalysisResult>(
        "/analyze/advanced",
        createAnalysisFormData({ file, message }),
        {
          params: {
            fast,
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
        }
      );

      return response.data;
    },
  });

export const useAdvancedAnalysis = useAdvanced;
