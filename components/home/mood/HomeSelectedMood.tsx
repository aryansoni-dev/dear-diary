import { Feather } from "@expo/vector-icons";
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
      className="relative overflow-hidden rounded-[22px] border px-5 py-5"
      style={{
        backgroundColor: mood.backgroundColor,
        borderColor: mood.dotColor,
        borderWidth: 1,
      }}
    >
      <View
        pointerEvents="none"
        className="absolute rounded-full bg-white/55"
        style={{
          bottom: -52,
          height: 138,
          left: -24,
          width: 184,
        }}
      />
      <View
        pointerEvents="none"
        className="absolute rounded-full bg-white/30"
        style={{
          height: 78,
          right: -26,
          top: -22,
          width: 78,
        }}
      />
      <Text
        allowFontScaling={false}
        pointerEvents="none"
        className="absolute leading-6 text-white/80"
        style={{ fontSize: 20, left: 78, top: 28 }}
      >
        ✦
      </Text>
      <Text
        allowFontScaling={false}
        pointerEvents="none"
        className="absolute leading-6 text-white/75"
        style={{ bottom: 16, fontSize: 16, right: 18 }}
      >
        ✦
      </Text>

      <View className="flex-row items-center gap-4">
        <View className="size-[86px] items-center justify-center rounded-full bg-white/70">
          <LottieView
            autoPlay
            loop
            source={animatedMoodEmojis[mood.id]}
            style={{ height: 76, width: 76 }}
          />
        </View>
        <View className="min-w-0 flex-1 gap-2">
          <Text
            adjustsFontSizeToFit
            className="font-semibold leading-6 text-[#303039]"
            minimumFontScale={0.86}
            numberOfLines={1}
            style={{ fontSize: 22 }}
          >
            {isSaved ? `Feeling ${mood.label}` : `You selected ${mood.label}`}
          </Text>
          {isSaved ? (
            <View className="flex-row items-center gap-2">
              <Feather name="clock" size={16} color="#71717B" />
              <Text
                adjustsFontSizeToFit
                className="flex-1 text-[13px] font-medium leading-6 text-[#71717B]"
                minimumFontScale={0.86}
                numberOfLines={1}
              >
                Logged today{savedAt ? ` at ${formatSavedTime(savedAt)}` : ""}
              </Text>
            </View>
          ) : (
            <Text
              adjustsFontSizeToFit
              className="text-[13px] font-medium leading-6 text-[#71717B]"
              minimumFontScale={0.86}
              numberOfLines={2}
            >
              Save this as today&apos;s check-in.
            </Text>
          )}
        </View>
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
