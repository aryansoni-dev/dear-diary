type AITextIntegrityStage =
  | "received"
  | "validated"
  | "stored"
  | "render_source";

export function logAITextIntegrity({
  length,
  stage,
  surface,
}: {
  length: number;
  stage: AITextIntegrityStage;
  surface: string;
}) {
  if (!__DEV__) {
    return;
  }

  console.info("AI text integrity", {
    characterCount: length,
    stage,
    surface,
  });
}

