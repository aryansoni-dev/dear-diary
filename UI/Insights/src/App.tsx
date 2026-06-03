import { useEffect } from "react";
import { BarChart3, BookOpen, Moon, Sparkles, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="min-h-[874px] bg-[linear-gradient(180deg,#F4EFFA_0%,#FAF7F2_38%,#FAF7F2_100%)] pb-28 w-full">
          <div className="px-6 pt-14">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-zinc-900 text-3xl leading-9 tracking-tight">
                Your Insights
              </h1>
              <span className="text-3xl leading-9">✨</span>
            </div>
            <p className="text-zinc-500 text-sm leading-5 mt-1">
              Powered by your journal entries
            </p>
          </div>
          <div className="mt-6 px-6">
            <Card className="backdrop-blur-xl shadow-[0_12px_40px_-12px_rgba(160,140,200,0.35)] rounded-3xl bg-white/70 border-black/1 border-0 border-solid p-6 gap-4">
              <CardHeader className="p-0 gap-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-7">📈</span>
                    <CardTitle className="font-semibold text-zinc-900 text-base leading-6">
                      Weekly Mood Journey
                    </CardTitle>
                  </div>
                  <span className="font-medium rounded-full bg-[#F4EFFA] text-zinc-600 text-xs leading-4 px-3 py-1">
                    This Week
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 gap-0">
                <ChartContainer
                  className="w-full h-45"
                  config={{
                    mood: { color: "oklch(0.645 0.246 16.439)", label: "Mood" },
                  }}
                >
                  <RechartsAreaChart
                    data={[
                      { day: "Mon", mood: 3 },
                      { day: "Tue", mood: 4 },
                      { day: "Wed", mood: 3.5 },
                      { day: "Thu", mood: 4.5 },
                      { day: "Fri", mood: 4 },
                      { day: "Sat", mood: 4.8 },
                      { day: "Sun", mood: 4.2 },
                    ]}
                    margin={{ bottom: 0, left: 8, right: 8, top: 10 }}
                  >
                    <defs>
                      <linearGradient id="moodFill" x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="oklch(0.645 0.246 16.439)"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="oklch(0.645 0.246 16.439)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="oklch(0.92 0.004 286.32)"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis
                      axisLine={false}
                      dataKey="day"
                      tick={{
                        fill: "oklch(0.552 0.016 285.938)",
                        fontSize: 11,
                      }}
                      tickLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip />
                    <Area
                      dataKey="mood"
                      dot={{
                        fill: "oklch(0.645 0.246 16.439)",
                        r: 3,
                        strokeWidth: 0,
                      }}
                      fill="url(#moodFill)"
                      stroke="oklch(0.645 0.246 16.439)"
                      strokeWidth={3}
                      type="natural"
                    />
                  </RechartsAreaChart>
                </ChartContainer>
                <div className="text-sm leading-5 flex mt-2 px-1 justify-between">
                  <span>😌</span>
                  <span>😊</span>
                  <span>😌</span>
                  <span>🔥</span>
                  <span>😊</span>
                  <span>🙏</span>
                  <span>😊</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-3 mt-6 px-6 gap-4">
            <div className="shadow-[0_8px_24px_-10px_rgba(255,32,86,0.25)] text-center rounded-3xl bg-[#FFDDE8] flex p-4 flex-col items-center">
              <span className="text-2xl leading-8">🌸</span>
              <span className="font-bold text-zinc-900 text-base leading-6 mt-2">
                Calm
              </span>
              <span className="font-medium text-zinc-500 text-[11px] mt-0.5">
                Top Emotion
              </span>
            </div>
            <div className="shadow-[0_8px_24px_-10px_rgba(120,160,220,0.25)] text-center rounded-3xl bg-[#DDEFFF] flex p-4 flex-col items-center">
              <span className="text-2xl leading-8">📝</span>
              <span className="font-bold text-zinc-900 text-base leading-6 mt-2">
                5
              </span>
              <span className="font-medium text-zinc-500 text-[11px] mt-0.5">
                Entries
              </span>
            </div>
            <div className="shadow-[0_8px_24px_-10px_rgba(120,200,140,0.25)] text-center rounded-3xl bg-[#D8EEDB] flex p-4 flex-col items-center">
              <span className="text-2xl leading-8">🔥</span>
              <span className="font-bold text-zinc-900 text-base leading-6 mt-2">
                7 Days
              </span>
              <span className="font-medium text-zinc-500 text-[11px] mt-0.5">
                Current Streak
              </span>
            </div>
          </div>
          <div className="mt-6 px-6">
            <Card className="bg-[linear-gradient(135deg,#F4EFFA_0%,#FFDDE8_100%)] shadow-[0_12px_40px_-12px_rgba(180,150,210,0.4)] rounded-3xl border-black/1 border-0 border-solid p-6 gap-4">
              <CardHeader className="p-0 gap-0">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-full bg-white/60 flex justify-center items-center">
                    <Sparkles className="size-4 text-[#ff2056]" />
                  </div>
                  <CardTitle className="font-bold text-zinc-900 text-sm leading-5 tracking-wide">
                    DearDiary AI Says
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 gap-0">
                <p className="leading-relaxed text-zinc-700 text-[15px]">
                  \"You've been carrying a lot lately, but gratitude appears
                  frequently throughout your entries.\"
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 px-6">
            <Card className="shadow-[0_10px_30px_-12px_rgba(120,200,140,0.3)] rounded-3xl bg-[#D8EEDB] border-black/1 border-0 border-solid p-6 gap-3">
              <CardHeader className="p-0 gap-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-7">🌱</span>
                  <CardTitle className="font-bold text-zinc-900 text-sm leading-5">
                    Pattern Found
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 gap-0">
                <p className="leading-relaxed text-zinc-700 text-[15px]">
                  You feel calmer on days you write before 10 PM.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 px-6">
            <Card className="shadow-[0_10px_30px_-12px_rgba(120,160,220,0.3)] rounded-3xl bg-[#DDEFFF] border-black/1 border-0 border-solid p-6 gap-3">
              <CardHeader className="p-0 gap-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-7">💡</span>
                  <CardTitle className="font-bold text-zinc-900 text-sm leading-5">
                    Recurring Topic
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 gap-0">
                <p className="leading-relaxed text-zinc-700 text-[15px]">
                  Friendships appeared in 34% of entries this month.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="fixed backdrop-blur-xl bg-[#FAF7F2]/80 border-[#EDE3DA] border-t-1 border-r-0 border-b-0 border-l-0 border-solid inset-x-0 bottom-0">
          <div className="flex px-2 pt-3 pb-7 flex-row justify-around items-center">
            <button className="flex px-3 py-1 flex-col items-center gap-1">
              <BookOpen className="size-5 text-zinc-400" />
              <span className="font-medium text-zinc-400 text-[11px]">
                Today
              </span>
            </button>
            <button className="flex px-3 py-1 flex-col items-center gap-1">
              <Moon className="size-5 text-zinc-400" />
              <span className="font-medium text-zinc-400 text-[11px]">
                Reflect
              </span>
            </button>
            <button className="rounded-full bg-[#ff2056]/15 flex px-4 py-1 flex-col items-center gap-1">
              <BarChart3 className="size-5 text-[#ff2056]" />
              <span className="font-semibold text-[#ff2056] text-[11px]">
                Insights
              </span>
            </button>
            <button className="flex px-3 py-1 flex-col items-center gap-1">
              <User className="size-5 text-zinc-400" />
              <span className="font-medium text-zinc-400 text-[11px]">
                Profile
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
