import { useMutation } from "@tanstack/react-query";

import { analyzePracticeMedia } from "@/setup/ai-analysis-api";
import {
  AnalysisResult,
  BaseAnalysisPayload,
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
      return analyzePracticeMedia({
        file,
        message,
        maxDurationSec,
        useLlm,
        onUploadProgress,
        mode: "basic",
      }) as Promise<AnalysisResult>;
    },
  });

export const useBasicAnalysis = useBasic;
