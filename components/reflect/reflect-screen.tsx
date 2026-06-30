import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight, Sparkles } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { ScenicCardBackground } from "@/components/ui/scenic-card-background";
import { TabScreenHeader } from "@/components/ui/tab-screen-header";
import { reflectPrompts, type ReflectPrompt } from "@/data/reflect";
import {
  useJournalHydrationStore,
  useJournalStore,
} from "@/store/journal-store";
import type { JournalEntry } from "@/types/journal";

const colors = {
  body: "#71717B",
  primary: "#FF2056",
};
const reflectionCardAspectRatio = 1.9;

export function ReflectScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalHydrationStore(
    (state) => state.hasHydrated,
  );
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const reflectCardWidth = Math.max(width - 48, 0);

  function handlePromptPress(prompt: ReflectPrompt) {
    const existingEntry = hasHydrated
      ? getTodayEntryWithPrompt(entries, prompt.prompt)
      : undefined;

    if (existingEntry) {
      router.push({
        pathname: "/journal/[id]",
        params: { id: existingEntry.id, source: "reflect" },
      });
      return;
    }

    router.push({
      pathname: "/journal/new",
      params: {
        prompt: prompt.prompt,
        source: "reflect",
        type: prompt.type,
      },
    });
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <LinearGradient
        colors={["#F1EAFB", "#FCF6FC", "#FFFFFF"]}
        locations={[0, 0.76, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: bottomNavHeight + 36,
          paddingHorizontal: 24,
          paddingTop: Math.max(92, insets.top + 44),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <TabScreenHeader
          eyebrow="Reflect"
          rightAccessory={
            <View
              className="size-[50px] items-center justify-center rounded-full bg-white"
              style={{ boxShadow: "0 4px 14px rgba(39, 39, 42, 0.12)" }}
            >
              <Text allowFontScaling={false} className="text-[25px] leading-8">
                🌙
              </Text>
            </View>
          }
          subtitle="Slow down and check in with yourself."
          title="Evening Reflection"
        />

        <View className="mt-8 gap-6">
          {reflectPrompts.map((prompt) => (
            <ReflectPromptCard
              cardWidth={reflectCardWidth}
              key={prompt.title}
              entry={getTodayEntryWithPrompt(entries, prompt.prompt)}
              onPress={() => handlePromptPress(prompt)}
              prompt={prompt}
            />
          ))}
        </View>

        <View
          className="mt-9 w-full overflow-hidden rounded-[30px] border-[6px] border-white/80 bg-[#E7DAF5]"
          style={{
            aspectRatio: reflectionCardAspectRatio,
            boxShadow: "0 20px 48px -22px rgba(125, 83, 180, 0.42)",
          }}
        >
          <ScenicCardBackground
            cardWidth={reflectCardWidth}
            variant="ai"
          />

          <View className="h-full px-5 py-5">
            <View className="flex-row items-center gap-3">
              <View className="size-8 items-center justify-center rounded-full bg-white/75">
                <Sparkles size={21} color={colors.primary} strokeWidth={2.2} />
              </View>
              <Text className="flex-1 text-[18px] font-bold leading-6 text-[#18181B]">
                Reflect With DearDiary AI
              </Text>
            </View>

            <Text
              className="mt-2 text-[15px] italic leading-6 text-zinc-950/65"
              numberOfLines={2}
            >
              {"Talk to your journaling companion about your day."}
            </Text>

            <Pressable
              accessibilityRole="button"
              className="mt-auto h-12 flex-row items-center justify-center gap-3 rounded-[18px] bg-[#FF2056]"
              onPress={() => router.push("/ai-chat")}
              style={{ boxShadow: "0 12px 22px rgba(255, 32, 86, 0.28)" }}
            >
              <Ionicons name="sparkles-outline" size={22} color="#FFF1F5" />
              <Text className="text-[17px] font-bold leading-6 text-rose-50">
                Start Reflection
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Reflect" />
    </View>
  );
}

type ReflectPromptCardProps = {
  cardWidth: number;
  entry?: JournalEntry;
  onPress: () => void;
  prompt: ReflectPrompt;
};

function ReflectPromptCard({
  cardWidth,
  entry,
  onPress,
  prompt,
}: ReflectPromptCardProps) {
  const Icon = prompt.Icon;
  const previewText = entry ? getEntryPreview(entry) : "Tap to reflect...";

  return (
    <Pressable
      accessibilityLabel={prompt.title}
      accessibilityRole="button"
      className="w-full overflow-hidden rounded-[30px] border-[6px] border-white/80"
      onPress={onPress}
      style={{
        aspectRatio: reflectionCardAspectRatio,
        backgroundColor: "#E7DAF5",
        boxShadow: "0 20px 48px -22px rgba(125, 83, 180, 0.42)",
      }}
    >
      <ScenicCardBackground cardWidth={cardWidth} variant="evening" />

      <View className="h-full px-5 py-5">
        <View className="flex-row items-center gap-3">
          <View className="size-10 items-center justify-center rounded-[18px] bg-white/75">
            <Icon size={23} color={prompt.iconColor} strokeWidth={2.1} />
          </View>

          <Text
            className="flex-1 text-[18px] font-bold leading-6 text-[#18181B]"
            numberOfLines={2}
          >
            {prompt.title}
          </Text>
        </View>

        <View
          className="mt-auto h-[54px] w-full flex-row items-center rounded-[18px] bg-white/70 px-4"
        >
          <Text
            className="flex-1 text-[15px] leading-6 text-[#71717B]"
            numberOfLines={2}
          >
            {previewText}
          </Text>
          <ChevronRight size={23} color={colors.body} strokeWidth={2} />
        </View>
      </View>
    </Pressable>
  );
}

function getEntryPreview(entry: JournalEntry) {
  return entry.content.trim() || entry.title.trim() || "Tap to continue...";
}

function getTodayEntryWithPrompt(entries: JournalEntry[], prompt: string) {
  const today = new Date();
  const normalizedPrompt = prompt.trim();

  return entries.find(
    (entry) =>
      entry.prompt?.trim() === normalizedPrompt &&
      isSameDay(new Date(entry.createdAt), today),
  );
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}
