import {
  areEntryTagsEqual,
  mergeEntryTagsWithAiThemes,
  normalizeAiThemesToEntryTags,
} from "../lib/entryReflectionThemeTags";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertTagsEqual(
  actualTags: string[],
  expectedTags: string[],
  message: string,
) {
  assert(
    actualTags.length === expectedTags.length &&
      actualTags.every((tag, index) => tag === expectedTags[index]),
    `${message}. Expected ${expectedTags.join(", ")}, received ${actualTags.join(", ")}.`,
  );
}

assertTagsEqual(
  normalizeAiThemesToEntryTags([
    " productivity ",
    "",
    "#Accomplishment",
    "Productivity",
  ]),
  ["productivity", "accomplishment"],
  "AI themes should be trimmed, un-hashed, normalized, and deduplicated",
);

assertTagsEqual(
  normalizeAiThemesToEntryTags([
    "Try to be kinder to yourself tomorrow.",
    "one two three four five",
    "clinical depression",
    "self compassion",
  ]),
  ["self-compassion"],
  "AI themes should ignore sentences, long phrases, and diagnosis-like labels",
);

assertTagsEqual(
  normalizeAiThemesToEntryTags([
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "work-life balance",
  ]),
  ["work-life-balance"],
  "AI themes should respect the AI theme tag length limit",
);

assertTagsEqual(
  mergeEntryTagsWithAiThemes([], ["productivity", "accomplishment"]),
  ["productivity", "accomplishment"],
  "AI themes should become tags for an untagged entry",
);

assertTagsEqual(
  mergeEntryTagsWithAiThemes(["college"], ["productivity", "accomplishment"]),
  ["college", "productivity", "accomplishment"],
  "Existing entry tags should be preserved before AI theme tags",
);

assertTagsEqual(
  mergeEntryTagsWithAiThemes(["Productivity"], [
    "productivity",
    "accomplishment",
  ]),
  ["productivity", "accomplishment"],
  "Existing AI theme tags should not be duplicated",
);

assert(
  areEntryTagsEqual(["Productivity", "accomplishment"], [
    "productivity",
    "accomplishment",
  ]),
  "Tag equality should compare normalized tags",
);

assert(
  areEntryTagsEqual(["accomplishment", "Productivity"], [
    "productivity",
    "accomplishment",
  ]),
  "Tag equality should ignore tag order after normalization",
);

assert(
  !areEntryTagsEqual(["college"], ["college", "productivity"]),
  "Tag equality should detect newly added AI theme tags",
);
