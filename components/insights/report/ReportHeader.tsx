import { Text, View } from "react-native";

import { getReportTitle } from "@/components/insights/report/report-formatters";
import { reportColors } from "@/constants/report-theme";
import type { AIInsightReport } from "@/types/aiInsightReport";

type ReportHeaderProps = {
  isStale: boolean;
  label: string;
  report: AIInsightReport;
};

export function ReportHeader({ isStale, label, report }: ReportHeaderProps) {
  return (
    <View>
      <Text
        allowFontScaling={false}
        className="text-[30px] font-bold leading-10 text-[#18181B]"
      >
        {label}
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-1 text-[17px] font-semibold leading-6 text-[#52525B]"
      >
        {getReportTitle(report.periodType)}
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-2 text-[15px] leading-6 text-[#71717B]"
      >
        {report.analytics.totalEntries} entries · {report.analytics.activeDays}{" "}
        active days
      </Text>
      <View
        className="mt-4 self-start rounded-full px-4 py-2"
        style={{
          backgroundColor: isStale ? reportColors.rose : reportColors.lavender,
        }}
      >
        <Text
          allowFontScaling={false}
          className="text-[13px] font-semibold leading-5"
          style={{ color: isStale ? reportColors.primary : reportColors.text }}
        >
          {isStale ? "New journal changes available" : "Up to date"}
        </Text>
      </View>
    </View>
  );
}
