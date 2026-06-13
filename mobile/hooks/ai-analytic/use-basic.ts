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
    }: BaseAnalysisPayload) => {
      const response = await aiAxios.post<AnalysisResult>(
        "/analyze/basic",
        createAnalysisFormData({ file, message }),
        {
          params: {
            max_duration_sec: maxDurationSec,
            use_llm: useLlm,
          },
        },
      );

      return response.data;
    },
  });

export const useBasicAnalysis = useBasic;
