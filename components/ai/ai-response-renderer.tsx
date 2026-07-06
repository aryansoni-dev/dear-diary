import {
  Component,
  memo,
  useEffect,
  useMemo,
  type ErrorInfo,
  type ReactNode,
} from "react";
import {
  Linking,
  ScrollView,
  Text,
  View,
  type TextStyle,
} from "react-native";

import { logAITextIntegrity } from "@/lib/ai/log-ai-text-integrity";
import { addSafeBreakOpportunities } from "@/lib/text/add-safe-break-opportunities";
import {
  parseAITextBlocks,
  type AITextBlock,
} from "@/lib/text/parse-ai-markdown";

export type AIResponseVariant = "chat" | "reflection" | "report" | "insight";

type AIResponseRendererProps = {
  accessibilityLabel?: string;
  content: string;
  diagnosticLabel?: string;
  isStreaming?: boolean;
  selectable?: boolean;
  testID?: string;
  textClassName?: string;
  variant?: AIResponseVariant;
};

const variantClasses: Record<
  AIResponseVariant,
  { body: string; heading: string; muted: string }
> = {
  chat: {
    body: "text-[16px] leading-6 text-[#51515B]",
    heading: "text-[18px] font-bold leading-6 text-[#27272A]",
    muted: "text-[15px] leading-6 text-[#71717B]",
  },
  insight: {
    body: "text-[17px] leading-6 text-[#52525B]",
    heading: "text-[18px] font-bold leading-6 text-[#18181B]",
    muted: "text-[16px] leading-6 text-[#71717B]",
  },
  reflection: {
    body: "text-[16px] leading-6 text-[#3F3F46]",
    heading: "text-[18px] font-bold leading-6 text-[#27272A]",
    muted: "text-[15px] leading-6 text-[#71717B]",
  },
  report: {
    body: "text-[16px] leading-6 text-[#52525B]",
    heading: "text-[18px] font-bold leading-6 text-[#18181B]",
    muted: "text-[15px] leading-6 text-[#71717B]",
  },
};

const safeTextStyle = {
  includeFontPadding: true,
  minWidth: 0,
  overflow: "visible",
} as const;

export const AIResponseRenderer = memo(function AIResponseRenderer({
  accessibilityLabel,
  content,
  diagnosticLabel,
  isStreaming = false,
  selectable = true,
  testID,
  textClassName,
  variant = "chat",
}: AIResponseRendererProps) {
  useEffect(() => {
    if (!diagnosticLabel) {
      return;
    }

    logAITextIntegrity({
      length: content.length,
      stage: "render_source",
      surface: diagnosticLabel,
    });
  }, [content, diagnosticLabel]);

  return (
    <AIResponseErrorBoundary content={content} selectable={selectable} variant={variant}>
      <AIResponseContent
        accessibilityLabel={accessibilityLabel}
        content={content}
        isStreaming={isStreaming}
        selectable={selectable}
        testID={testID}
        textClassName={textClassName}
        variant={variant}
      />
    </AIResponseErrorBoundary>
  );
});

function AIResponseContent({
  accessibilityLabel,
  content,
  isStreaming,
  selectable,
  testID,
  textClassName,
  variant,
}: Required<
  Pick<
    AIResponseRendererProps,
    "content" | "isStreaming" | "selectable" | "variant"
  >
> &
  Pick<
    AIResponseRendererProps,
    "accessibilityLabel" | "testID" | "textClassName"
  >) {
  const blocks = useMemo(
    () =>
      isStreaming
        ? [{ content, type: "paragraph" } satisfies AITextBlock]
        : parseAITextBlocks(content),
    [content, isStreaming],
  );

  // Keep the Yoga and native text layouts on the same explicit width. This
  // prevents Android from measuring fewer lines than it ultimately draws.
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className="w-full min-w-0 gap-3"
      testID={testID}
    >
      {blocks.map((block, index) => (
        <AIResponseBlock
          block={block}
          index={index}
          key={`${block.type}-${index}`}
          selectable={selectable}
          textClassName={textClassName}
          variant={variant}
        />
      ))}
    </View>
  );
}

function AIResponseBlock({
  block,
  index,
  selectable,
  textClassName,
  variant,
}: {
  block: AITextBlock;
  index: number;
  selectable: boolean;
  textClassName?: string;
  variant: AIResponseVariant;
}) {
  const classes = variantClasses[variant];

  if (block.type === "code" || block.type === "table") {
    const label =
      block.type === "code"
        ? block.language
          ? `${block.language} code block`
          : "Code block"
        : "Table";

    return (
      <View className="min-w-0 overflow-visible rounded-[16px] bg-[#27272A]">
        <Text className="px-4 pt-3 text-[11px] font-semibold uppercase leading-6 text-[#D4D4D8]">
          {label}
        </Text>
        <ScrollView
          accessibilityLabel={label}
          contentContainerStyle={{ paddingBottom: 14, paddingHorizontal: 16 }}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
        >
          <Text
            className="text-[13px] leading-6 text-[#FAFAFA]"
            selectable={selectable}
            style={{ fontFamily: "monospace", includeFontPadding: true }}
          >
            {block.content}
          </Text>
        </ScrollView>
      </View>
    );
  }

  if (block.type === "heading") {
    const headingClassName =
      block.level === 1
        ? classes.heading
        : block.level === 2
          ? `${classes.heading} text-[17px]`
          : `${classes.heading} text-[16px]`;

    return (
      <InlineMarkdownText
        accessibilityRole="header"
        className={`w-full ${headingClassName} ${textClassName ?? ""}`}
        selectable={selectable}
        style={safeTextStyle}
        text={block.content}
      />
    );
  }

  if (block.type === "blockquote") {
    return (
      <View className="min-w-0 border-l-4 border-[#D8C5EF] bg-[#F7F2FC] px-4 py-3">
        <InlineMarkdownText
          className={`w-full ${classes.muted} ${textClassName ?? ""}`}
          selectable={selectable}
          style={safeTextStyle}
          text={block.content}
        />
      </View>
    );
  }

  if (block.type === "list") {
    return (
      <View className="min-w-0 gap-2">
        {block.items.map((item, itemIndex) => (
          <View
            className="min-w-0 flex-row items-start gap-2"
            key={`${index}-${itemIndex}`}
            style={{ paddingLeft: item.depth * 16 }}
          >
            <Text
              accessibilityElementsHidden
              className="w-6 text-right text-[15px] leading-6 text-[#71717B]"
            >
              {item.marker}
            </Text>
            <View className="min-w-0 flex-1 basis-0">
              <InlineMarkdownText
                className={`w-full ${classes.body} ${textClassName ?? ""}`}
                selectable={selectable}
                style={safeTextStyle}
                text={item.content}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (block.type === "horizontal-rule") {
    return <View className="h-px w-full bg-[#E4E4E7]" />;
  }

  return (
    <InlineMarkdownText
      className={`w-full ${classes.body} ${textClassName ?? ""}`}
      selectable={selectable}
      style={safeTextStyle}
      text={block.content}
    />
  );
}

function InlineMarkdownText({
  accessibilityRole,
  className,
  selectable,
  style,
  text,
}: {
  accessibilityRole?: "header";
  className: string;
  selectable: boolean;
  style: TextStyle;
  text: string;
}) {
  const parts = useMemo(() => parseInlineMarkdown(text), [text]);
  const getRenderedContent = (content: string) =>
    selectable ? content : addSafeBreakOpportunities(content);

  return (
    <Text
      accessibilityRole={accessibilityRole}
      android_hyphenationFrequency="normal"
      className={className}
      selectable={selectable}
      style={style}
      textBreakStrategy="highQuality"
    >
      {parts.map((part, index) => {
        if (part.type === "bold") {
          return (
            <Text className="font-bold" key={index}>
              {getRenderedContent(part.content)}
            </Text>
          );
        }

        if (part.type === "italic") {
          return (
            <Text className="italic" key={index}>
              {getRenderedContent(part.content)}
            </Text>
          );
        }

        if (part.type === "code") {
          return (
            <Text
              className="bg-[#F4F4F5] text-[#3F3F46]"
              key={index}
              style={{ fontFamily: "monospace" }}
            >
              {getRenderedContent(part.content)}
            </Text>
          );
        }

        if (part.type === "link") {
          return (
            <Text
              accessibilityRole="link"
              className="text-[#C9184A] underline"
              key={index}
              onPress={() => openSafeLink(part.url)}
            >
              {getRenderedContent(part.content)}
            </Text>
          );
        }

        return getRenderedContent(part.content);
      })}
    </Text>
  );
}

type InlinePart =
  | { content: string; type: "bold" | "code" | "italic" | "text" }
  | { content: string; type: "link"; url: string };

function parseInlineMarkdown(value: string): InlinePart[] {
  const pattern = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`\n]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|_([^_\n]+)_)/gi;
  const parts: InlinePart[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(pattern)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      parts.push({ content: value.slice(lastIndex, matchIndex), type: "text" });
    }

    if (match[2] && match[3]) {
      parts.push({ content: match[2], type: "link", url: match[3] });
    } else if (match[4]) {
      parts.push({ content: match[4], type: "code" });
    } else if (match[5] || match[6]) {
      parts.push({ content: match[5] ?? match[6], type: "bold" });
    } else {
      parts.push({ content: match[7] ?? match[8] ?? match[0], type: "italic" });
    }

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push({ content: value.slice(lastIndex), type: "text" });
  }

  return parts.length > 0 ? parts : [{ content: value, type: "text" }];
}

function openSafeLink(url: string) {
  if (!/^https?:\/\//i.test(url)) {
    return;
  }

  void Linking.openURL(url).catch(() => undefined);
}

class AIResponseErrorBoundary extends Component<
  {
    children: ReactNode;
    content: string;
    selectable: boolean;
    variant: AIResponseVariant;
  },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    if (__DEV__) {
      console.warn("AI response rendering failed; using complete plain-text fallback.");
    }
  }

  componentDidUpdate(previousProps: Readonly<{ content: string }>) {
    if (this.state.failed && previousProps.content !== this.props.content) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <Text
          android_hyphenationFrequency="normal"
          className={`w-full ${variantClasses[this.props.variant].body}`}
          selectable={this.props.selectable}
          style={safeTextStyle}
          textBreakStrategy="highQuality"
        >
          {this.props.selectable
            ? this.props.content
            : addSafeBreakOpportunities(this.props.content)}
        </Text>
      );
    }

    return this.props.children;
  }
}
