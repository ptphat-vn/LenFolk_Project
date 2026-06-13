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
        }
      );

      return response.data;
    },
  });

export const useAdvancedAnalysis = useAdvanced;
