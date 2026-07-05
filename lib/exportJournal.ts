import { Directory, File } from "expo-file-system";

import { formatTagLabel } from "@/lib/tags";
import type { JournalEntry } from "@/types/journal";

type ExportFileType = "json" | "markdown";

const exportDirectoryName = "DearDiary Export";
const directoryPickerCancellationCodes = new Set([
  "ERR_FILE_PICKING_CANCELLED",
  "ERR_PICKER_CANCELLED",
]);

export type JournalExportErrorCode =
  | "file-system-unavailable"
  | "sharing-unavailable";

export class JournalExportError extends Error {
  code: JournalExportErrorCode;

  constructor(code: JournalExportErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "JournalExportError";
  }
}

export const generateJournalMarkdown = (entries: JournalEntry[]): string => {
  const sortedEntries = getEntriesNewestFirst(entries);
  const lines = [
    "# DearDiary Journal Export",
    "",
    `Exported on: ${formatDisplayDate(new Date())}`,
    `Total entries: ${sortedEntries.length}`,
    "",
    "---",
    "",
  ];

  if (sortedEntries.length === 0) {
    lines.push("No journal entries found.", "");
    return lines.join("\n");
  }

  sortedEntries.forEach((entry) => {
    lines.push(`## ${formatDisplayDate(entry.createdAt)}`, "");
    lines.push(`### ${entry.title.trim() || "Untitled Entry"}`, "");

    if (entry.mood) {
      lines.push(`**Mood:** ${entry.mood}  `);
    }

    lines.push(`**Type:** ${entry.type}  `);

    const tags = entry.tags ?? [];

    if (tags.length > 0) {
      lines.push(`**Tags:** ${tags.map(formatTagLabel).join(" ")}  `);
    }

    if (entry.prompt?.trim()) {
      lines.push(`**Prompt:** ${entry.prompt.trim()}`);
    }

    lines.push("", entry.content.trim() || "No content.", "", "---", "");
  });

  return lines.join("\n");
};

export const generateJournalJson = (entries: JournalEntry[]): string => {
  const sortedEntries = getEntriesNewestFirst(entries);

  return JSON.stringify(
    {
      app: "DearDiary",
      exportedAt: new Date().toISOString(),
      totalEntries: sortedEntries.length,
      entries: sortedEntries,
    },
    null,
    2,
  );
};

export const exportJournalAsMarkdown = async (
  entries: JournalEntry[],
): Promise<boolean> => {
  const markdown = generateJournalMarkdown(entries);
  return writeExportFile(markdown, "markdown");
};

export const exportJournalAsJson = async (
  entries: JournalEntry[],
): Promise<boolean> => {
  const json = generateJournalJson(entries);
  return writeExportFile(json, "json");
};

const getExportDateStamp = (): string => new Date().toISOString().split("T")[0];

const getEntriesNewestFirst = (entries: JournalEntry[]) =>
  [...entries].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

const writeExportFile = async (
  contents: string,
  type: ExportFileType,
): Promise<boolean> => {
  try {
    const pickedDirectory = await Directory.pickDirectoryAsync();
    const selectedDirectory = new Directory(pickedDirectory.uri);
    const exportDirectory = getOrCreateExportDirectory(selectedDirectory);
    const fileName = getExportFileName(type);
    const file = getOrCreateExportFile(exportDirectory, fileName, type);

    file.write(contents);
    return true;
  } catch (error) {
    if (isDirectoryPickerCancellation(error)) {
      return false;
    }

    throw error;
  }
};

const getOrCreateExportDirectory = (parentDirectory: Directory): Directory => {
  if (parentDirectory.name === exportDirectoryName) {
    return parentDirectory;
  }

  const existingDirectory = parentDirectory
    .list()
    .find(
      (item) => item instanceof Directory && item.name === exportDirectoryName,
    );

  if (existingDirectory instanceof Directory) {
    return existingDirectory;
  }

  return parentDirectory.createDirectory(exportDirectoryName);
};

const getOrCreateExportFile = (
  exportDirectory: Directory,
  fileName: string,
  type: ExportFileType,
): File => {
  const existingFile = exportDirectory
    .list()
    .find((item) => item instanceof File && item.name === fileName);

  if (existingFile instanceof File) {
    return existingFile;
  }

  const mimeType = type === "markdown" ? "text/markdown" : "application/json";

  return exportDirectory.createFile(fileName, mimeType);
};

const getExportFileName = (type: ExportFileType): string => {
  const extension = type === "markdown" ? "md" : "json";

  return `deardiary-export-${getExportDateStamp()}.${extension}`;
};

const isDirectoryPickerCancellation = (error: unknown): boolean => {
  if (
    !(error instanceof Error) ||
    !("code" in error) ||
    typeof error.code !== "string"
  ) {
    return false;
  }

  return directoryPickerCancellationCodes.has(error.code);
};

const formatDisplayDate = (dateValue: Date | string): string => {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};
