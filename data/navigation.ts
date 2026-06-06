import type { ComponentProps } from "react";
import { Feather } from "@expo/vector-icons";

export type BottomTabItem = {
  icon: ComponentProps<typeof Feather>["name"];
  label: "Today" | "Reflect" | "History" | "Insights" | "Profile";
};

export const bottomTabItems: BottomTabItem[] = [
  { icon: "book-open", label: "Today" },
  { icon: "edit-3", label: "Reflect" },
  { icon: "clock", label: "History" },
  { icon: "bar-chart-2", label: "Insights" },
  { icon: "user", label: "Profile" },
];
