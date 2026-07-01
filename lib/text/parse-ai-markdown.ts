export type AITextBlock =
  | { content: string; type: "blockquote" }
  | { content: string; language: string | null; type: "code" }
  | { content: string; level: 1 | 2 | 3; type: "heading" }
  | { type: "horizontal-rule" }
  | { items: AITextListItem[]; type: "list" }
  | { content: string; type: "paragraph" }
  | { content: string; type: "table" };

export type AITextListItem = {
  content: string;
  depth: number;
  marker: string;
};

export function parseAITextBlocks(content: string): AITextBlock[] {
  const normalizedContent = content.replace(/\r\n?/g, "\n");
  const lines = normalizedContent.split("\n");
  const blocks: AITextBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const codeFence = line.match(/^\s*```([^`]*)$/);

    if (codeFence) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({
        content: codeLines.join("\n"),
        language: codeFence[1]?.trim() || null,
        type: "code",
      });
      continue;
    }

    const heading = line.match(/^\s*(#{1,3})\s+(.+)$/);

    if (heading) {
      blocks.push({
        content: heading[2].trim(),
        level: heading[1].length as 1 | 2 | 3,
        type: "heading",
      });
      index += 1;
      continue;
    }

    if (/^\s*((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})\s*$/.test(line)) {
      blocks.push({ type: "horizontal-rule" });
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const tableShape = getTableShape(line, lines[index + 1]);
      const tableLines = [line, lines[index + 1]];
      index += 2;

      while (
        index < lines.length &&
        tableShape &&
        matchesTableShape(lines[index], tableShape)
      ) {
        tableLines.push(lines[index]);
        index += 1;
      }

      blocks.push({ content: tableLines.join("\n"), type: "table" });
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }

      blocks.push({ content: quoteLines.join("\n"), type: "blockquote" });
      continue;
    }

    if (getListItem(line)) {
      const items: AITextListItem[] = [];

      while (index < lines.length) {
        const item = getListItem(lines[index]);

        if (!item) {
          break;
        }

        items.push(item);
        index += 1;
      }

      blocks.push({ items, type: "list" });
      continue;
    }

    const paragraphLines = [line];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !isBlockStart(lines, index)
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    blocks.push({ content: paragraphLines.join("\n"), type: "paragraph" });
  }

  return blocks.length > 0
    ? blocks
    : [{ content: normalizedContent, type: "paragraph" }];
}

function getListItem(line: string): AITextListItem | null {
  const match = line.match(/^(\s*)([-+*]|\d+[.)])\s+(.+)$/);

  if (!match) {
    return null;
  }

  return {
    content: match[3],
    depth: Math.min(3, Math.floor(match[1].replace(/\t/g, "  ").length / 2)),
    marker: /^\d/.test(match[2]) ? match[2] : "•",
  };
}

function isBlockStart(lines: string[], index: number) {
  const line = lines[index];

  return (
    /^\s*```/.test(line) ||
    /^\s*#{1,3}\s+/.test(line) ||
    /^\s*>/.test(line) ||
    /^\s*((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})\s*$/.test(line) ||
    Boolean(getListItem(line)) ||
    isTableStart(lines, index)
  );
}

function isTableStart(lines: string[], index: number) {
  const header = lines[index];
  const separator = lines[index + 1];
  const separatorRow = getTableRow(separator);
  const tableShape = getTableShape(header, separator);

  if (!separatorRow || !tableShape) {
    return false;
  }

  return separatorRow.cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

type TableRow = {
  cells: string[];
  hasLeadingPipe: boolean;
  hasTrailingPipe: boolean;
};

type TableShape = {
  columnCount: number;
  hasLeadingPipe: boolean | null;
  hasTrailingPipe: boolean | null;
};

function getTableRow(line: string | undefined): TableRow | null {
  const trimmedLine = line?.trim();

  if (!trimmedLine?.includes("|")) {
    return null;
  }

  const hasLeadingPipe = trimmedLine.startsWith("|");
  const hasTrailingPipe = trimmedLine.endsWith("|");
  const rowContent = trimmedLine
    .slice(hasLeadingPipe ? 1 : 0, hasTrailingPipe ? -1 : undefined);
  const cells = rowContent.split("|").map((cell) => cell.trim());

  if (cells.length < 2) {
    return null;
  }

  return { cells, hasLeadingPipe, hasTrailingPipe };
}

function getTableShape(
  headerLine: string | undefined,
  separatorLine: string | undefined,
): TableShape | null {
  const headerRow = getTableRow(headerLine);
  const separatorRow = getTableRow(separatorLine);

  if (
    !headerRow ||
    !separatorRow ||
    headerRow.cells.length !== separatorRow.cells.length
  ) {
    return null;
  }

  return {
    columnCount: headerRow.cells.length,
    hasLeadingPipe:
      headerRow.hasLeadingPipe === separatorRow.hasLeadingPipe
        ? headerRow.hasLeadingPipe
        : null,
    hasTrailingPipe:
      headerRow.hasTrailingPipe === separatorRow.hasTrailingPipe
        ? headerRow.hasTrailingPipe
        : null,
  };
}

function matchesTableShape(line: string, expectedShape: TableShape) {
  const candidateRow = getTableRow(line);

  return Boolean(
    candidateRow &&
      candidateRow.cells.length === expectedShape.columnCount &&
      (expectedShape.hasLeadingPipe === null ||
        candidateRow.hasLeadingPipe === expectedShape.hasLeadingPipe) &&
      (expectedShape.hasTrailingPipe === null ||
        candidateRow.hasTrailingPipe === expectedShape.hasTrailingPipe),
  );
}
