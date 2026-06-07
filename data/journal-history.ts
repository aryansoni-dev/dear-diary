export type JournalMoodFilter = {
  backgroundColor: string;
  emoji?: string;
  label: string;
};

export type JournalDay = {
  date: string;
  day: string;
  isSelected?: boolean;
};

export type JournalEntry = {
  dotColor: string;
  emoji: string;
  emojiBackgroundColor: string;
  excerpt: string;
  markerBackgroundColor: string;
  time: string;
  title: string;
};

export type JournalHistorySection = {
  entries: JournalEntry[];
  title: string;
};

export const journalMoodFilters: JournalMoodFilter[] = [
  { label: "All", backgroundColor: "#FF2056" },
  { emoji: "😊", label: "Happy", backgroundColor: "#FFDDE8" },
  { emoji: "😌", label: "Calm", backgroundColor: "#D8EEDB" },
  { emoji: "😰", label: "Anxious", backgroundColor: "#F4EFFA" },
  { emoji: "🙏", label: "Grateful", backgroundColor: "#DDEFFF" },
];

export const journalDays: JournalDay[] = [
  { day: "Mon", date: "9" },
  { day: "Tue", date: "10" },
  { day: "Wed", date: "11" },
  { day: "Thu", date: "12", isSelected: true },
  { day: "Fri", date: "13" },
  { day: "Sat", date: "14" },
];

export const journalHistorySections: JournalHistorySection[] = [
  {
    title: "TODAY",
    entries: [
      {
        time: "Thu, June 12 · 9:24 PM",
        title: "A surprisingly bright day",
        excerpt:
          "Coffee with an old friend turned into hours of laughing. I forgot how much I needed that kind of connection...",
        emoji: "😊",
        emojiBackgroundColor: "#FFDDE8",
        dotColor: "#FF2056",
        markerBackgroundColor: "#FFDDE8",
      },
      {
        time: "Thu, June 12 · 7:10 AM",
        title: "Slow morning intentions",
        excerpt:
          "Set my focus on staying present. Felt calm and steady before the day even started 🌿",
        emoji: "😌",
        emojiBackgroundColor: "#D8EEDB",
        dotColor: "#86C99B",
        markerBackgroundColor: "#D8EEDB",
      },
    ],
  },
  {
    title: "YESTERDAY",
    entries: [
      {
        time: "Wed, June 11 · 10:02 PM",
        title: "A heavier kind of evening",
        excerpt:
          "Work felt overwhelming today. Writing it down helped me untangle what was really bothering me...",
        emoji: "😔",
        emojiBackgroundColor: "#DDEFFF",
        dotColor: "#7C9FD9",
        markerBackgroundColor: "#DDEFFF",
      },
      {
        time: "Wed, June 11 · 8:30 AM",
        title: "Three small gratitudes",
        excerpt:
          "Sunlight through the window, a warm cup of tea, and a kind message from mom. Little things matter 🌸",
        emoji: "🙏",
        emojiBackgroundColor: "#F4EFFA",
        dotColor: "#A98FD0",
        markerBackgroundColor: "#F4EFFA",
      },
    ],
  },
];
