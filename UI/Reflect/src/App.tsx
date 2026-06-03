import { useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Heart,
  Moon,
  Mountain,
  Sparkle,
  Sparkles,
  User,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative min-h-[874px] bg-[linear-gradient(180deg,oklch(0.96_0.02_300),oklch(0.97_0.015_330),oklch(0.99_0.005_286))] pb-32 w-full">
          <div className="px-6 pt-14 pb-4">
            <div className="flex items-center gap-2">
              <div className="size-12 backdrop-blur-md shadow-[0_8px_24px_-12px_oklch(0.5_0.1_300/0.4)] rounded-2xl bg-white/70 text-2xl leading-8 flex justify-center items-center">
                🌙
              </div>
              <div className="flex flex-col">
                <h1 className="font-semibold text-zinc-950 text-2xl leading-8 tracking-tight">
                  Evening Reflection
                </h1>
              </div>
            </div>
            <p className="font-normal text-[#71717b] text-base leading-6 mt-3">
              Slow down and check in with yourself.
            </p>
          </div>
          <div className="flex px-6 pt-2 flex-col gap-4">
            <Card className="bg-[oklch(0.94_0.025_300)] shadow-[0_10px_30px_-15px_oklch(0.5_0.1_300/0.5)] rounded-3xl border-black/1 border-0 border-solid p-6 gap-2">
              <CardHeader className="p-0 gap-2">
                <div className="size-10 backdrop-blur-md rounded-2xl bg-white/70 flex justify-center items-center">
                  <Heart className="size-5 text-[#ff2056]" />
                </div>
              </CardHeader>
              <CardContent className="p-0 gap-1">
                <p className="font-semibold text-zinc-950 text-lg leading-7">
                  How did today feel?
                </p>
                <div className="backdrop-blur-md rounded-2xl bg-white/55 flex mt-2 px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Tap to reflect…
                  </span>
                  <ChevronRight className="size-4 text-[#71717b]" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[oklch(0.95_0.02_270)] shadow-[0_10px_30px_-15px_oklch(0.5_0.1_270/0.5)] rounded-3xl border-black/1 border-0 border-solid p-6 gap-2">
              <CardHeader className="p-0 gap-2">
                <div className="size-10 backdrop-blur-md rounded-2xl bg-white/70 flex justify-center items-center">
                  <Mountain className="size-5 text-[oklch(0.55_0.12_250)]" />
                </div>
              </CardHeader>
              <CardContent className="p-0 gap-1">
                <p className="font-semibold text-zinc-950 text-lg leading-7">
                  What challenged you today?
                </p>
                <div className="backdrop-blur-md rounded-2xl bg-white/55 flex mt-2 px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Tap to reflect…
                  </span>
                  <ChevronRight className="size-4 text-[#71717b]" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[oklch(0.95_0.03_150)] shadow-[0_10px_30px_-15px_oklch(0.5_0.1_150/0.5)] rounded-3xl border-black/1 border-0 border-solid p-6 gap-2">
              <CardHeader className="p-0 gap-2">
                <div className="size-10 backdrop-blur-md rounded-2xl bg-white/70 flex justify-center items-center">
                  <Sparkle className="size-5 text-[oklch(0.5_0.12_150)]" />
                </div>
              </CardHeader>
              <CardContent className="p-0 gap-1">
                <p className="font-semibold text-zinc-950 text-lg leading-7">
                  What are you grateful for?
                </p>
                <div className="backdrop-blur-md rounded-2xl bg-white/55 flex mt-2 px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Tap to reflect…
                  </span>
                  <ChevronRight className="size-4 text-[#71717b]" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[oklch(0.96_0.025_240)] shadow-[0_10px_30px_-15px_oklch(0.5_0.1_240/0.5)] rounded-3xl border-black/1 border-0 border-solid p-6 gap-2">
              <CardHeader className="p-0 gap-2">
                <div className="size-10 backdrop-blur-md rounded-2xl bg-white/70 flex justify-center items-center">
                  <Wind className="size-5 text-[oklch(0.55_0.1_240)]" />
                </div>
              </CardHeader>
              <CardContent className="p-0 gap-1">
                <p className="font-semibold text-zinc-950 text-lg leading-7">
                  What would you like to let go of?
                </p>
                <div className="backdrop-blur-md rounded-2xl bg-white/55 flex mt-2 px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Tap to reflect…
                  </span>
                  <ChevronRight className="size-4 text-[#71717b]" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="px-6 pt-6">
            <Card className="bg-[linear-gradient(135deg,oklch(0.9_0.05_300),oklch(0.92_0.045_330))] shadow-[0_16px_40px_-18px_oklch(0.5_0.12_310/0.6)] rounded-3xl border-black/1 border-0 border-solid p-6 gap-4 overflow-hidden">
              <CardHeader className="p-0 gap-2">
                <div className="flex items-center gap-3">
                  <div className="size-11 backdrop-blur-md rounded-2xl bg-white/65 flex justify-center items-center">
                    <Sparkles className="size-5 text-[#ff2056]" />
                  </div>
                  <p className="font-semibold text-zinc-950 text-lg leading-7">
                    Reflect With DearDiary AI
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-0 gap-2">
                <div className="backdrop-blur-md rounded-2xl bg-white/55 p-4">
                  <p className="leading-relaxed italic text-zinc-950/80 text-sm leading-5">
                    \"I noticed gratitude appeared often this week…\"
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-0 gap-2">
                <Button className="shadow-[0_10px_24px_-10px_oklch(0.645_0.246_16/0.7)] font-semibold rounded-2xl bg-[#ff2056] text-rose-50 text-base leading-6 w-full h-12">
                  <Moon className="size-4" />
                  Start Reflection
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        <div className="fixed left-1/2 -translate-x-1/2 backdrop-blur-xl bg-white/80 border-zinc-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid bottom-0 px-6 pt-3 pb-6 w-100.5">
          <div className="flex justify-around items-center">
            <button className="text-[#71717b] flex flex-col items-center gap-1">
              <BookOpen className="size-5" />
              <span className="font-medium text-[11px]">Today</span>
            </button>
            <button className="rounded-2xl bg-[#ff2056]/15 text-[#ff2056] flex px-4 py-1.5 flex-col items-center gap-1">
              <Moon className="size-5" />
              <span className="font-semibold text-[11px]">Reflect</span>
            </button>
            <button className="text-[#71717b] flex flex-col items-center gap-1">
              <BarChart3 className="size-5" />
              <span className="font-medium text-[11px]">Insights</span>
            </button>
            <button className="text-[#71717b] flex flex-col items-center gap-1">
              <User className="size-5" />
              <span className="font-medium text-[11px]">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
