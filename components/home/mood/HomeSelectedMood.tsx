import LottieView from "lottie-react-native";
import { Text, View } from "react-native";

import { animatedMoodEmojis } from "@/constants/animated-emojis";
import type { MoodMetadata } from "@/constants/moods";

type HomeSelectedMoodProps = {
  isLoading?: boolean;
  isSaved: boolean;
  mood: MoodMetadata | null;
  savedAt?: string | null;
};

export function HomeSelectedMood({
  isLoading = false,
  isSaved,
  mood,
  savedAt,
}: HomeSelectedMoodProps) {
  if (isLoading) {
    return (
      <View className="items-center gap-3 rounded-[22px] bg-[#FAF7F2] px-5 py-5">
        <View className="size-[72px] items-center justify-center rounded-full bg-white">
          <Text className="text-[28px] leading-6">...</Text>
        </View>
        <Text className="text-center text-[16px] font-medium leading-6 text-[#71717B]">
          Loading your saved check-in...
        </Text>
      </View>
    );
  }

  if (!mood) {
    return (
      <View className="items-center gap-3 rounded-[22px] bg-[#FAF7F2] px-5 py-5">
        <View className="size-[72px] items-center justify-center rounded-full bg-white">
          <Text className="text-[34px] leading-6">✦</Text>
        </View>
        <Text className="text-center text-[16px] font-medium leading-6 text-[#71717B]">
          Choose the feeling that feels closest.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="items-center gap-3 rounded-[22px] px-5 py-5"
      style={{ backgroundColor: mood.backgroundColor }}
    >
      <View className="size-[78px] items-center justify-center rounded-full bg-white/80">
        <LottieView
          autoPlay
          loop
          source={animatedMoodEmojis[mood.id]}
          style={{ height: 68, width: 68 }}
        />
      </View>
      <View className="items-center gap-1">
        <Text className="text-center text-[20px] font-semibold leading-6 text-[#303039]">
          {isSaved ? `Feeling ${mood.label}` : `You selected ${mood.label}`}
        </Text>
        {isSaved && savedAt ? (
          <Text className="text-center text-[13px] font-medium leading-6 text-[#71717B]">
            Logged today at {formatSavedTime(savedAt)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function formatSavedTime(timestamp: string) {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;

  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
