export type EntryAIReflection = {
  id: string;
  userId: string;
  entryId: string;

  summary: string;
  emotions: string[];
  themes: string[];
  observation: string | null;
  followUpQuestion: string | null;
  suggestion: string | null;

  model: string | null;
  sourceEntryUpdatedAt: string;

  createdAt: string;
  updatedAt: string;
};

export type GenerateEntryReflectionResponse = {
  reflection: EntryAIReflection;
};
