import type { ReactNode } from "react";
import { Text, View } from "react-native";

type ReportSectionProps = {
  children: ReactNode;
  title: string;
};

export function ReportSection({ children, title }: ReportSectionProps) {
  return (
    <View
      className="rounded-[28px] bg-white px-5 py-5"
      style={{ boxShadow: "0 10px 30px rgba(160, 140, 200, 0.16)" }}
    >
      <Text
        allowFontScaling={false}
        className="text-[18px] font-bold leading-7 text-[#18181B]"
      >
        {title}
      </Text>
      <View className="mt-4">{children}</View>
    </View>
  );
}
