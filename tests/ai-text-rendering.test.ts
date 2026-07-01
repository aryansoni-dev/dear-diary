import { addSafeBreakOpportunities } from "../lib/text/add-safe-break-opportunities";
import { parseAITextBlocks } from "../lib/text/parse-ai-markdown";

import {
  assembledStreamingAIResponse,
  codeAIResponse,
  longAIResponse,
  longTokenAIResponse,
  markdownAIResponse,
  reportAIResponse,
  streamingAIResponseChunks,
  unicodeAIResponse,
  veryLongAIResponse,
} from "./fixtures/ai-responses";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function getBlockContent(content: string) {
  return parseAITextBlocks(content)
    .flatMap((block) => {
      if (block.type === "list") {
        return block.items.map((item) => item.content);
      }

      return "content" in block ? [block.content] : [];
    })
    .join("\n\n");
}

assert(longAIResponse.length >= 2_000, "Long fixture must exceed 2,000 characters.");
assert(
  veryLongAIResponse.length >= 10_000,
  "Very-long fixture must exceed 10,000 characters.",
);
assert(
  getBlockContent(veryLongAIResponse) === veryLongAIResponse,
  "Plain prose parsing must preserve every character except structural separators.",
);

const markdownBlocks = parseAITextBlocks(markdownAIResponse);
assert(
  markdownBlocks.some((block) => block.type === "heading"),
  "Markdown headings must be identified.",
);
assert(
  markdownBlocks.some((block) => block.type === "list"),
  "Markdown lists must be identified.",
);
assert(
  markdownBlocks.some((block) => block.type === "blockquote"),
  "Markdown blockquotes must be identified.",
);

const codeBlocks = parseAITextBlocks(codeAIResponse);
assert(
  codeBlocks.some(
    (block) =>
      block.type === "code" && block.content.includes("intentionallyLongLine"),
  ),
  "Code blocks must retain wide lines.",
);
assert(
  codeBlocks.some((block) => block.type === "table"),
  "Markdown tables must use the wide-content path.",
);

const tableWithTrailingProse = parseAITextBlocks(
  "| Mood | Count |\n| --- | --- |\n| Calm | 2 |\nThis prose contains | a pipe but is not a table row.",
);
const parsedTable = tableWithTrailingProse.find(
  (block) => block.type === "table",
);
assert(
  parsedTable?.content ===
    "| Mood | Count |\n| --- | --- |\n| Calm | 2 |",
  "Table parsing must stop when a pipe-containing line does not match the table structure.",
);
assert(
  tableWithTrailingProse.some(
    (block) =>
      block.type === "paragraph" && block.content.includes("not a table row"),
  ),
  "Pipe-containing prose after a table must remain a paragraph.",
);

const breakableText = addSafeBreakOpportunities(longTokenAIResponse);
assert(
  breakableText.includes("\u200B"),
  "Long tokens must receive display-only break opportunities.",
);
assert(
  breakableText.replace(/\u200B/g, "") === longTokenAIResponse,
  "Removing display-only breaks must restore the exact source.",
);
assert(
  addSafeBreakOpportunities(unicodeAIResponse).replace(/\u200B/g, "") ===
    unicodeAIResponse,
  "Unicode source must remain unchanged.",
);
assert(
  streamingAIResponseChunks.join("") === assembledStreamingAIResponse,
  "Irregular streaming chunks must assemble without loss.",
);
assert(
  getBlockContent(reportAIResponse).includes("Next focus"),
  "The final report section must remain in parsed output.",
);
