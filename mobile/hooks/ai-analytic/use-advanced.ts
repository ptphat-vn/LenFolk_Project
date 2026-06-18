import { useMutation } from "@tanstack/react-query";

import { analyzePracticeMedia } from "@/setup/ai-analysis-api";
import {
  AdvancedAnalysisPayload,
  AnalysisResult,
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
      return analyzePracticeMedia({
        file,
        message,
        fast,
        maxDurationSec,
        useLlm,
        onUploadProgress,
        mode: "advanced",
      }) as Promise<AnalysisResult>;
    },
  });

export const useAdvancedAnalysis = useAdvanced;
