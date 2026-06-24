export type RecentEntry = {
  backgroundColor: string;
  date: string;
  emoji: string;
  excerpt: string;
  title: string;
};

export const recentEntries: RecentEntry[] = [
  {
    date: "Jun 12",
    emoji: "😊",
    title: "A Peaceful Afternoon",
    excerpt:
      "Spent the day reading by the lake and journaling my thoughts. The quiet was exactly what I needed.",
    backgroundColor: "#DDEFFF",
  },
  {
    date: "Jun 10",
    emoji: "🔥",
    title: "Big Wins Today",
    excerpt:
      "Finished the project I'd been dreading. Feeling accomplished and ready for what's next.",
    backgroundColor: "#FFDDE8",
  },
  {
    date: "Jun 08",
    emoji: "😌",
    title: "A Quiet Day",
    excerpt:
      "Nothing much happened, just taking time to rest and recharge before the busy week ahead.",
    backgroundColor: "#F4EFFA",
  },
];
