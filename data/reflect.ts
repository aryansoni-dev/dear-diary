import {
  Heart,
  Mountain,
  Sparkle,
  Wind,
  type LucideIcon,
} from "lucide-react-native";

export type ReflectPrompt = {
  backgroundColor: string;
  iconColor: string;
  Icon: LucideIcon;
  question: string;
};

export const reflectPrompts: ReflectPrompt[] = [
  {
    backgroundColor: "#F0E9FA",
    iconColor: "#FF2056",
    Icon: Heart,
    question: "How did today feel?",
  },
  {
    backgroundColor: "#E8EEFC",
    iconColor: "#367DBB",
    Icon: Mountain,
    question: "What challenged you today?",
  },
  {
    backgroundColor: "#DFF4E4",
    iconColor: "#1F8C50",
    Icon: Sparkle,
    question: "What are you grateful for?",
  },
  {
    backgroundColor: "#DFF2FC",
    iconColor: "#2F83B3",
    Icon: Wind,
    question: "What would you like to let go of?",
  },
];
