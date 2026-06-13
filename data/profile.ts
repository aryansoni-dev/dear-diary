import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

const accountMenuColors = {
  pinkBackground: "#FFE1EE",
  redIcon: "#FF2056",
} as const;

export type ProfileStat = {
  backgroundColor: string;
  emoji: string;
  label: string;
  value: string;
};

export type ProfileInsight = {
  emoji: string;
  label: string;
  value: string;
};

export type ProfileAchievement = {
  backgroundColor: string;
  emoji: string;
  subtitle: string;
  title: string;
};

type ProfileMenuItemBase = {
  badge?: string;
  backgroundColor: string;
  iconColor: string;
  label: string;
  subtitle?: string;
};

type FeatherMenuItem = ProfileMenuItemBase & {
  icon: ComponentProps<typeof Feather>["name"];
  iconSet?: "feather";
};

type IoniconsMenuItem = ProfileMenuItemBase & {
  icon: ComponentProps<typeof Ionicons>["name"];
  iconSet: "ionicons";
};

type MaterialCommunityMenuItem = ProfileMenuItemBase & {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconSet: "material-community";
};

export type ProfileMenuItem =
  | FeatherMenuItem
  | IoniconsMenuItem
  | MaterialCommunityMenuItem;

export const profileStats: ProfileStat[] = [
  {
    backgroundColor: "#F0DDFB",
    emoji: "📝",
    label: "Entries",
    value: "42",
  },
  {
    backgroundColor: "#FFE1EE",
    emoji: "🔥",
    label: "Streak",
    value: "7",
  },
  {
    backgroundColor: "#D8F3E2",
    emoji: "😊",
    label: "Moods",
    value: "5",
  },
];

export const profileInsights: ProfileInsight[] = [
  {
    emoji: "😌",
    label: "Most Common Mood",
    value: "Calm",
  },
  {
    emoji: "⏱️",
    label: "Average Reflection Time",
    value: "8 min/day",
  },
];

export const profileAchievements: ProfileAchievement[] = [
  {
    backgroundColor: "#D8F3E2",
    emoji: "🌱",
    subtitle: "You showed up 7 days in a row",
    title: "First Week Completed",
  },
  {
    backgroundColor: "#FFE1EE",
    emoji: "🔥",
    subtitle: "Keep the momentum going",
    title: "7 Day Streak",
  },
  {
    backgroundColor: "#F0DDFB",
    emoji: "📝",
    subtitle: "Your reflection journey grows",
    title: "25 Entries Written",
  },
];

export const preferenceItems: ProfileMenuItem[] = [
  {
    backgroundColor: "#FFE1EE",
    icon: "bell",
    iconColor: "#FF2056",
    label: "Notifications",
  },
  {
    backgroundColor: "#D8F0FE",
    icon: "lock",
    iconColor: "#51515B",
    label: "Privacy Lock",
  },
  {
    backgroundColor: "#F0DDFB",
    icon: "color-palette-outline",
    iconSet: "ionicons",
    iconColor: "#51515B",
    label: "Theme",
  },
];

export const accountItems: ProfileMenuItem[] = [
  {
    backgroundColor: "#D8F3E2",
    icon: "refresh-cw",
    iconColor: "#51515B",
    label: "Backup & Sync Data",
  },
  {
    backgroundColor: "#FFE1EE",
    badge: "PRO",
    icon: "crown-outline",
    iconSet: "material-community",
    iconColor: "#FF2056",
    label: "Premium Membership",
  },
  {
    backgroundColor: "#D8F0FE",
    icon: "download",
    iconColor: "#51515B",
    label: "Export Journal",
  },
  {
    backgroundColor: "#FFE1EE",
    icon: "trash-2",
    iconColor: "#FF2056",
    label: "Clear My Journal Data",
  },
];
