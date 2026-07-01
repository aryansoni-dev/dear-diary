import { Link } from "expo-router";
import {
  ArrowDown,
  CheckCircle2,
  CircleDot,
  PenLine,
  Sparkles,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { AIResponseRenderer } from "@/components/ai/ai-response-renderer";
import { reportCardShadow, reportColors } from "@/constants/report-theme";

const reportBodyTextStyle = {
  fontSize: 15,
  fontWeight: "500" as const,
  includeFontPadding: true,
  lineHeight: 25,
};

const reportHeadingTextStyle = {
  fontSize: 16,
  fontWeight: "700" as const,
  includeFontPadding: true,
  lineHeight: 25,
};

type ListBlockProps = {
  emptyText?: string;
  items: string[];
  title?: string;
  variant?: "plain" | "success" | "challenge";
};

export function SimpleListBlock({
  emptyText,
  items,
  title,
  variant = "plain",
}: ListBlockProps) {
  if (items.length === 0) {
    return emptyText ? (
      <Text
        allowFontScaling={false}
        className="text-[#71717B]"
        maxFontSizeMultiplier={1}
        style={reportBodyTextStyle}
      >
        {emptyText}
      </Text>
    ) : null;
  }

  return (
    <View className="gap-4">
      {title ? (
        <Text
          allowFontScaling={false}
          className="text-[#18181B]"
          maxFontSizeMultiplier={1}
          style={reportHeadingTextStyle}
        >
          {title}
        </Text>
      ) : null}
      {items.map((item) => (
        <View className="flex-row items-start gap-3" key={item}>
          <View
            className="mt-0.5 size-7 items-center justify-center rounded-full"
            style={{ backgroundColor: getIconBackground(variant) }}
          >
            {variant === "success" ? (
              <CheckCircle2 color={reportColors.primary} size={16} />
            ) : (
              <CircleDot color={reportColors.primary} size={15} />
            )}
          </View>
          <View className="min-w-0 flex-1">
            <AIResponseRenderer
              content={item}
              diagnosticLabel="insight_report_list_item"
              variant="report"
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export function EmotionalFlowCard({ stages }: { stages: string[] }) {
  if (stages.length === 0) {
    return null;
  }

  return (
    <View className="items-center gap-3">
      {stages.map((stage, index) => (
        <View className="items-center gap-3" key={`${stage}-${index}`}>
          <View
            className="rounded-full px-5 py-3"
            style={{ backgroundColor: reportColors.lavender }}
          >
            <AIResponseRenderer
              content={stage}
              diagnosticLabel="insight_report_emotional_flow"
              textClassName="text-center font-bold text-[#3F3F46]"
              variant="report"
            />
          </View>
          {index < stages.length - 1 ? (
            <ArrowDown color={reportColors.primary} size={18} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function PatternCards({ items }: { items: string[] }) {
  if (items.length === 0) {
    return (
      <Text
        allowFontScaling={false}
        className="text-[#71717B]"
        maxFontSizeMultiplier={1}
        style={reportBodyTextStyle}
      >
        Patterns will become clearer as more journal evidence builds up.
      </Text>
    );
  }

  return (
    <View className="gap-4">
      {items.map((item) => (
        <View className="flex-row items-start gap-3" key={item}>
          <View
            className="mt-0.5 size-7 items-center justify-center rounded-full"
            style={{ backgroundColor: getIconBackground("plain") }}
          >
            <CircleDot color={reportColors.primary} size={15} />
          </View>
          <View className="min-w-0 flex-1">
            <AIResponseRenderer
              content={item}
              diagnosticLabel="insight_report_pattern"
              variant="report"
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export function NextFocusCard({ focus }: { focus: string }) {
  return (
    <View
      className="rounded-[28px] px-5 py-5"
      style={{
        backgroundColor: reportColors.primary,
        boxShadow: reportCardShadow,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View className="size-10 items-center justify-center rounded-full bg-white/20">
          <Sparkles color="white" size={20} />
        </View>
        <Text
          allowFontScaling={false}
          className="flex-1 text-white"
          maxFontSizeMultiplier={1}
          style={{
            fontSize: 18,
            fontWeight: "700",
            includeFontPadding: true,
            lineHeight: 28,
          }}
        >
          Focus for Next Period
        </Text>
      </View>
      <View className="mt-4 min-w-0">
        <AIResponseRenderer
          content={focus}
          diagnosticLabel="insight_report_next_focus"
          textClassName="font-medium text-white"
          variant="report"
        />
      </View>
    </View>
  );
}

export function ReflectionPromptCard({ prompt }: { prompt: string | null }) {
  if (!prompt) {
    return null;
  }

  return (
    <View
      className="rounded-[28px] bg-white px-5 py-5"
      style={{ boxShadow: reportCardShadow }}
    >
      <Text
        allowFontScaling={false}
        className="text-[#18181B]"
        maxFontSizeMultiplier={1}
        style={{
          fontSize: 18,
          fontWeight: "700",
          includeFontPadding: true,
          lineHeight: 28,
        }}
      >
        Continue Reflecting
      </Text>
      <View className="mt-4 min-w-0">
        <AIResponseRenderer
          content={`“${prompt}”`}
          diagnosticLabel="insight_report_reflection_prompt"
          variant="report"
        />
      </View>
      <Link
        asChild
        href={{
          pathname: "/journal/new",
          params: { prompt, source: "insights", type: "daily_prompt" },
        }}
      >
        <Pressable
          accessibilityRole="button"
          className="mt-5 h-12 flex-row items-center justify-center gap-2 rounded-full"
          style={{ backgroundColor: reportColors.primary }}
        >
          <PenLine color="white" size={18} />
          <Text
            allowFontScaling={false}
            className="text-white"
            maxFontSizeMultiplier={1}
            style={{
              fontSize: 15,
              fontWeight: "700",
              includeFontPadding: true,
              lineHeight: 22,
            }}
          >
            Reflect on This
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}

function getIconBackground(variant: ListBlockProps["variant"]) {
  if (variant === "challenge") {
    return reportColors.ivory;
  }

  return reportColors.rose;
}
