const calmParagraph =
  "A steady reflection can hold both uncertainty and progress without rushing either one. The details remain available so the reader can return to them at their own pace.";

export const shortAIResponse = "A short one-paragraph response.";

export const longAIResponse = Array.from(
  { length: 18 },
  (_, index) => `Paragraph ${index + 1}. ${calmParagraph}`,
).join("\n\n");

export const veryLongAIResponse = Array.from(
  { length: 82 },
  (_, index) => `Reflection section ${index + 1}. ${calmParagraph}`,
).join("\n\n");

export const markdownAIResponse = `# A complete reflection

This paragraph includes **bold text**, *italic text*, and \`inline code\`.

## What stood out

- A first observation that wraps naturally on narrow screens.
  - A nested observation with enough detail to span more than one line.
- A second observation with a [helpful link](https://example.com/reflection/resources).

1. Pause and notice what feels important.
2. Write down one gentle next step.

> Progress can be quiet and still be meaningful.`;

export const codeAIResponse = `A short example:

\`\`\`ts
function preserveCompleteResponse(chunks: string[]) {
  return chunks.join("");
}

const intentionallyLongLine = "${"complete-response-".repeat(18)}";
\`\`\`

| Surface | Expected behavior |
| --- | --- |
| Chat | Natural vertical height |
| Code | Horizontal scrolling only |`;

export const unicodeAIResponse =
  "आज की सोच को धीरे-धीरे पढ़ें। 😊 यहाँ हिंदी, café, naïve, résumé, العربية, 日本語, and emoji 🫶🏽 remain visible together.";

export const longTokenAIResponse = [
  "https://example.com/a/very/very/very/long/path/without/spaces?with=query&and=more-values",
  "averyveryveryveryveryveryveryveryveryveryverylongunbrokentoken",
  "A".repeat(120),
].join("\n\n");

export const reportAIResponse = `# Period overview

${longAIResponse}

## Patterns

${markdownAIResponse}

## Next focus

${calmParagraph}`;

export const streamingAIResponseChunks = [
  "# A growing",
  " response\n\nThe first para",
  "graph arrives in irregular pieces.\n\n- One complete",
  " item\n- Another complete item\n\n",
  unicodeAIResponse,
];

export const assembledStreamingAIResponse = streamingAIResponseChunks.join("");

export const aiResponseFixtureCharacterCounts = {
  long: longAIResponse.length,
  report: reportAIResponse.length,
  veryLong: veryLongAIResponse.length,
};

