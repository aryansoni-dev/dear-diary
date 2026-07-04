export const appLockColors = {
  background: "#FFF7FB",
  border: "#E4E4E7",
  danger: "#DC2626",
  disabled: "#F4F4F5",
  disabledText: "#A1A1AA",
  option: "#F8F3FC",
  primary: "#FF2056",
  primaryTint: "#FFDDE8",
  primarySoft: "#FFE1EE",
  shadow: "rgba(39, 39, 42, 0.12)",
  surface: "#FFFFFF",
  text: "#27272A",
  textMuted: "#71717B",
} as const;

export const appLockLayout = {
  cardRadius: 28,
  cardPaddingHorizontal: 20,
  cardPaddingVertical: 24,
  compactCardPaddingVertical: 20,
  optionRadius: 16,
  optionPaddingHorizontal: 12,
  screenPaddingHorizontal: 24,
} as const;

export const appLockPrivacyCover = {
  backgroundColor: appLockColors.background,
  contentGap: 16,
  iconBackgroundColor: appLockColors.primaryTint,
  iconColor: appLockColors.primary,
  iconGlyphSize: 28,
  iconRadius: 22,
  iconSize: 64,
  paddingHorizontal: 32,
  safeAreaPadding: 24,
  titleColor: appLockColors.text,
  titleFontSize: 22,
  titleLineHeight: 28,
} as const;
