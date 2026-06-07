import type { Href } from "expo-router";
import {
  BarChart3,
  Clock3,
  Sparkles,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react-native";

export type BottomTabItem = {
  href?: Href;
  Icon: LucideIcon;
  label: "Today" | "Reflect" | "History" | "Insights" | "Profile";
};

export const bottomTabItems: BottomTabItem[] = [
  { href: "/home-tab", Icon: Sun, label: "Today" },
  { href: "/reflect-tab", Icon: Sparkles, label: "Reflect" },
  { href: "/journal-history", Icon: Clock3, label: "History" },
  { Icon: BarChart3, label: "Insights" },
  { href: "/profile-tab", Icon: User, label: "Profile" },
];
