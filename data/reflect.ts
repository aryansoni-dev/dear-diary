import {
  Heart,
  Mountain,
  Sparkle,
  Wind,
  type LucideIcon,
} from "lucide-react-native";

import type { EntryType } from "@/types/journal";

export type ReflectPrompt = {
  backgroundColor: string;
  iconColor: string;
  Icon: LucideIcon;
  prompt: string;
  title: string;
  type: EntryType;
};

export const reflectPrompts: ReflectPrompt[] = [
  {
    backgroundColor: "#F0E9FA",
    iconColor: "#FF2056",
    Icon: Heart,
    prompt: "How did today feel?",
    title: "How did today feel?",
    type: "evening_reflection",
  },
  {
    backgroundColor: "#E8EEFC",
    iconColor: "#367DBB",
    Icon: Mountain,
    prompt: "What challenged you today?",
    title: "What challenged you today?",
    type: "evening_reflection",
  },
  {
    backgroundColor: "#DFF4E4",
    iconColor: "#1F8C50",
    Icon: Sparkle,
    prompt: "What are you grateful for?",
    title: "What are you grateful for?",
    type: "gratitude",
  },
  {
    backgroundColor: "#DFF2FC",
    iconColor: "#2F83B3",
    Icon: Wind,
    prompt: "What would you like to let go of?",
    title: "What would you like to let go of?",
    type: "evening_reflection",
  },
];
