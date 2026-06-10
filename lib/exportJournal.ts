import * as FileSystem from "expo-file-system/legacy";
import { requireOptionalNativeModule } from "expo-modules-core";
import { Share } from "react-native";

import type { JournalEntry } from "@/types/journal";

type ExportFileType = "json" | "markdown";

type SharingOptions = {
  UTI?: string;
  dialogTitle?: string;
  mimeType?: string;
};

type NativeSharingModule = {
  isAvailableAsync?: () => Promise<boolean>;
  shareAsync?: (url: string, options?: SharingOptions) => Promise<void>;
};

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
): Promise<void> => {
  const markdown = generateJournalMarkdown(entries);
  await writeAndShareExportFile(markdown, "markdown");
};

export const exportJournalAsJson = async (
  entries: JournalEntry[],
): Promise<void> => {
  const json = generateJournalJson(entries);
  await writeAndShareExportFile(json, "json");
};

const getExportDateStamp = (): string => new Date().toISOString().split("T")[0];

const getEntriesNewestFirst = (entries: JournalEntry[]) =>
  [...entries].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

const writeAndShareExportFile = async (
  contents: string,
  type: ExportFileType,
): Promise<void> => {
  if (!FileSystem.documentDirectory) {
    throw new JournalExportError(
      "file-system-unavailable",
      "File storage is not available on this device.",
    );
  }

  const extension = type === "markdown" ? "md" : "json";
  const fileUri = `${FileSystem.documentDirectory}deardiary-export-${getExportDateStamp()}.${extension}`;

  await FileSystem.writeAsStringAsync(fileUri, contents);

  const Sharing = getNativeSharingModule();

  if (Sharing) {
    const sharingAvailable = await Sharing.isAvailableAsync();

    if (sharingAvailable) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Share DearDiary export",
        mimeType: type === "markdown" ? "text/markdown" : "application/json",
        UTI:
          type === "markdown" ? "net.daringfireball.markdown" : "public.json",
      });
      return;
    }
  }

  await Share.share(
    {
      message: contents,
      title: getShareTitle(type),
      url: fileUri,
    },
    {
      dialogTitle: "Share DearDiary export",
      subject: getShareTitle(type),
    },
  );
};

const getNativeSharingModule = (): Required<NativeSharingModule> | null => {
  const Sharing =
    requireOptionalNativeModule<NativeSharingModule>("ExpoSharing");

  if (!Sharing?.isAvailableAsync || !Sharing.shareAsync) {
    return null;
  }

  return {
    isAvailableAsync: Sharing.isAvailableAsync,
    shareAsync: Sharing.shareAsync,
  };
};

const getShareTitle = (type: ExportFileType): string =>
  type === "markdown" ? "DearDiary Markdown Export" : "DearDiary JSON Export";

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
