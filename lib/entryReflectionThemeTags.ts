import { normalizeTag, normalizeTags } from "./tags";

const maxAiThemeTagLength = 40;
const maxAiThemeWordCount = 4;
const diagnosisLikeTags = new Set([
  "adhd",
  "bipolar",
  "bipolar-disorder",
  "borderline-personality-disorder",
  "clinical-anxiety",
  "clinical-depression",
  "depression",
  "major-depressive-disorder",
  "ocd",
  "ptsd",
]);

export function normalizeAiThemesToEntryTags(themes: string[]) {
  const seenTags = new Set<string>();
  const normalizedTags: string[] = [];

  themes.forEach((theme) => {
    const normalizedTag = normalizeAiThemeToEntryTag(theme);

    if (!normalizedTag || seenTags.has(normalizedTag)) {
      return;
    }

    seenTags.add(normalizedTag);
    normalizedTags.push(normalizedTag);
  });

  return normalizedTags;
}

export function mergeEntryTagsWithAiThemes(
  existingTags: string[],
  aiThemes: string[],
) {
  return normalizeTags([
    ...normalizeTags(existingTags),
    ...normalizeAiThemesToEntryTags(aiThemes),
  ]);
}

export function areEntryTagsEqual(firstTags: string[], secondTags: string[]) {
  const normalizedFirstTags = normalizeTags(firstTags);
  const normalizedSecondTags = normalizeTags(secondTags);

  return (
    normalizedFirstTags.length === normalizedSecondTags.length &&
    normalizedFirstTags.every(
      (tag, index) => tag === normalizedSecondTags[index],
    )
  );
}

function normalizeAiThemeToEntryTag(theme: string) {
  const trimmedTheme = theme.trim().replace(/^#+/, "").trim();

  if (!trimmedTheme || looksLikeSentence(trimmedTheme)) {
    return null;
  }

  const wordCount = trimmedTheme.split(/[\s_-]+/).filter(Boolean).length;

  if (wordCount > maxAiThemeWordCount) {
    return null;
  }

  const normalizedTag = normalizeTag(trimmedTheme);

  if (
    !normalizedTag ||
    normalizedTag.length > maxAiThemeTagLength ||
    diagnosisLikeTags.has(normalizedTag)
  ) {
    return null;
  }

  return normalizedTag;
}

function looksLikeSentence(value: string) {
  return /[\n.!?]/.test(value);
}
