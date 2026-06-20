import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { reportCardShadow } from "@/constants/report-theme";

type ReportSectionProps = {
  children: ReactNode;
  title: string;
};

export function ReportSection({ children, title }: ReportSectionProps) {
  return (
    <View
      className="rounded-[28px] bg-white px-5 py-5"
      style={{ boxShadow: reportCardShadow }}
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
