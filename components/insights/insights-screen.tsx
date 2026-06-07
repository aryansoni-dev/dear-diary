import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Sparkles } from "lucide-react-native";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import {
  insightCards,
  insightStats,
  moodJourney,
  type InsightCard,
  type MoodJourneyPoint,
} from "@/data/insights";

const primaryColor = "#FF2056";

const chartHeight = 198;
const chartTopPadding = 18;
const chartBottomPadding = 52;
const moodMax = 5;
const moodMin = 1;

type ChartPoint = MoodJourneyPoint & {
  x: number;
  y: number;
};

export function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;

  return (
    <View className="flex-1 bg-[#FAF7F2]">
      <StatusBar hidden />
      <ExpoLinearGradient
        colors={["#F4EFFA", "#FAF7F2", "#FAF7F2"]}
        locations={[0, 0.38, 1]}
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
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: bottomNavHeight + 28,
          paddingHorizontal: 24,
          paddingTop: Math.max(60, insets.top + 22),
        }}
      >
        <View>
          <View className="flex-row items-center gap-2">
            <Text
              allowFontScaling={false}
              className="text-[31px] font-bold leading-9 tracking-normal text-[#18181B]"
            >
              Your Insights
            </Text>
            <Text allowFontScaling={false} className="text-[31px] leading-9">
              ✨
            </Text>
          </View>
          <Text
            allowFontScaling={false}
            className="mt-1 text-[15px] leading-5 text-[#71717B]"
          >
            Powered by your journal entries
          </Text>
        </View>

        <View
          className="mt-7 rounded-[30px] bg-white/80 px-6 py-6"
          style={{ boxShadow: "0 12px 40px rgba(160, 140, 200, 0.2)" }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <Text className="text-[25px] leading-8">📈</Text>
              <Text
                className="flex-1 text-[18px] font-bold leading-5 text-[#27272A]"
                numberOfLines={1}
              >
                Weekly Mood Journey
              </Text>
            </View>
            <View className="rounded-full bg-[#F4EFFA] px-4 py-2">
              <Text className="text-[12px] font-medium leading-5 text-[#52525B]">
                This Week
              </Text>
            </View>
          </View>

          <MoodJourneyChart data={moodJourney} />
        </View>

        <View className="mt-6 flex-row gap-4">
          {insightStats.map((stat) => (
            <View
              className="h-[132px] flex-1 items-center justify-center rounded-[28px] px-2"
              key={stat.label}
              style={{
                backgroundColor: stat.backgroundColor,
                boxShadow: `0 8px 24px ${stat.shadowColor}`,
              }}
            >
              <Text className="text-[28px] leading-5">{stat.emoji}</Text>
              <Text className="mt-4 text-center text-[18px] font-bold leading-5 text-[#18181B]">
                {stat.value}
              </Text>
              <Text className="mt-2 text-center text-[12px] font-medium leading-5 text-[#71717B]">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-7 gap-4">
          {insightCards.map((card) => (
            <InsightMessageCard card={card} key={card.title} />
          ))}
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Insights" />
    </View>
  );
}

function MoodJourneyChart({ data }: { data: MoodJourneyPoint[] }) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(250, width - 96);
  const chartInset = 10;
  const usableChartWidth = chartWidth - chartInset * 2;
  const plotHeight = chartHeight - chartTopPadding - chartBottomPadding;
  const points: ChartPoint[] = data.map((item, index) => {
    const x =
      chartInset + (usableChartWidth / Math.max(1, data.length - 1)) * index;
    const moodRatio = (item.mood - moodMin) / (moodMax - moodMin);
    const y = chartTopPadding + (1 - moodRatio) * plotHeight;

    return { ...item, x, y };
  });
  const fillBottom = chartHeight - chartBottomPadding + 2;
  const linePath = getSmoothLinePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${fillBottom} L ${points[0].x} ${fillBottom} Z`;

  return (
    <View className="mt-7 items-center">
      <View style={{ height: chartHeight, width: chartWidth }}>
        {[0, 1, 2, 3, 4].map((line) => (
          <View
            className="absolute left-0 right-0 border-t border-dashed border-[#E4E4E7]"
            key={line}
            style={{ top: chartTopPadding + (plotHeight / 4) * line }}
          />
        ))}

        <Svg
          height={chartHeight}
          pointerEvents="none"
          style={{ left: 0, position: "absolute", top: 0 }}
          width={chartWidth}
        >
          <Defs>
            <SvgLinearGradient id="moodFill" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor={primaryColor} stopOpacity="0.2" />
              <Stop offset="1" stopColor={primaryColor} stopOpacity="0.02" />
            </SvgLinearGradient>
          </Defs>
          <Path d={areaPath} fill="url(#moodFill)" />
          <Path
            d={linePath}
            fill="none"
            stroke={primaryColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={4}
          />
          {points.map((point) => (
            <Circle
              cx={point.x}
              cy={point.y}
              fill="#FF2D61"
              key={point.day}
              r={4.5}
            />
          ))}
        </Svg>

        {points.map((point) => (
          <Text
            allowFontScaling={false}
            className="absolute w-11 text-center text-[13px] leading-5 text-[#71717B]"
            key={`${point.day}-label`}
            style={{
              left: point.x - 22,
              top: chartHeight - 44,
            }}
          >
            {point.day}
          </Text>
        ))}

        {points.map((point) => (
          <Text
            allowFontScaling={false}
            className="absolute w-11 text-center text-[17px] leading-6"
            key={`${point.day}-emoji`}
            style={{
              left: point.x - 22,
              top: chartHeight - 17,
            }}
          >
            {point.emoji}
          </Text>
        ))}
      </View>
    </View>
  );
}

function getSmoothLinePath(points: ChartPoint[]) {
  if (points.length < 2) {
    return "";
  }

  const commands = [`M ${points[0].x} ${points[0].y}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[Math.min(points.length - 1, index + 2)];
    const controlPointOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlPointTwo = {
      x: next.x - (afterNext.x - current.x) / 6,
      y: next.y - (afterNext.y - current.y) / 6,
    };

    commands.push(
      `C ${controlPointOne.x} ${controlPointOne.y}, ${controlPointTwo.x} ${controlPointTwo.y}, ${next.x} ${next.y}`,
    );
  }

  return commands.join(" ");
}

function InsightMessageCard({ card }: { card: InsightCard }) {
  const isAiCard = card.variant === "ai";

  return (
    <View
      className="rounded-[28px] px-7 py-6"
      style={{
        backgroundColor: card.backgroundColor,
        boxShadow: `0 10px 30px ${card.shadowColor}`,
      }}
    >
      <View className="flex-row items-center gap-4">
        {isAiCard ? (
          <View className="size-9 items-center justify-center rounded-full bg-white/70">
            <Sparkles size={19} color={primaryColor} strokeWidth={2.2} />
          </View>
        ) : (
          <Text className="w-9 text-[21px] leading-5">{card.emoji}</Text>
        )}
        <Text className="flex-1 text-[17px] font-bold leading-5 text-[#18181B]">
          {card.title}
        </Text>
      </View>
      <Text className="mt-7 text-[17px] leading-6 text-[#52525B]">
        {card.body}
      </Text>
    </View>
  );
}
