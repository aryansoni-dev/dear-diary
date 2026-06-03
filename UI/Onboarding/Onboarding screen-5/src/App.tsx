import { useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Heart,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative bg-[linear-gradient(to_bottom,#F4EFFA_0%,#FFDDE8_45%,#FAF7F2_100%)] flex px-8 pt-16 pb-8 flex-col w-100.5 h-218.5 overflow-hidden">
          <div className="flex justify-center items-center gap-2">
            <span className="size-2 rounded-full bg-[#ff2056]" />
            <span className="size-2 rounded-full bg-[#ff2056]" />
            <span className="size-2 rounded-full bg-[#ff2056]" />
            <span className="size-2 rounded-full bg-[#ff2056]" />
            <span className="size-2 rounded-full bg-[#ff2056]" />
          </div>
          <div className="relative flex mt-2 justify-center items-center h-83">
            <div className="size-56 bg-[radial-gradient(circle,oklch(0.645_0.246_16.439/.35)_0%,transparent_70%)] blur-md rounded-full absolute" />
            <Star className="size-5 fill-[#ff2056]/60 text-[#ff2056] absolute left-8 top-6" />
            <Sparkles className="size-6 text-[#ff2056] absolute right-10 top-14" />
            <Heart className="size-4 fill-[#FFAEC9] text-[#FFAEC9] absolute left-4 top-24" />
            <Star className="size-4 fill-[#ff2056]/50 text-[#ff2056] absolute right-6 bottom-16" />
            <span className="left-1/2 size-2.5 rounded-full bg-[#D8EEDB] absolute top-10" />
            <span className="size-2 rounded-full bg-[#DDEFFF] absolute left-10 bottom-20" />
            <span className="size-2 ring-1 ring-white/60 rounded-full bg-[#F4EFFA] absolute right-20 top-20" />
            <span className="size-2.5 rounded-full bg-[#FFDDE8] absolute right-16 bottom-10" />
            <div className="relative size-44 backdrop-blur-md shadow-[0_20px_60px_-10px_oklch(0.645_0.246_16.439/.45)] rounded-full bg-white/70 flex justify-center items-center">
              <div className="size-32 bg-[linear-gradient(145deg,#FFDDE8,#F4EFFA)] shadow-inner rounded-3xl flex justify-center items-center">
                <BookOpenCheck className="size-16 text-[#ff2056]" />
              </div>
            </div>
          </div>
          <div className="flex -mt-2 flex-col items-center gap-2">
            <h1 className="leading-tight font-bold text-center text-zinc-950 text-[32px] tracking-tight">
              You're all set, Aryan! 🎉
            </h1>
            <p className="leading-relaxed text-center text-zinc-500 text-[17px] px-2">
              Your reflection journey begins now. Write freely, grow deeply.
            </p>
          </div>
          <Card className="backdrop-blur-md shadow-[0_12px_40px_-12px_oklch(0.645_0.246_16.439/.35)] rounded-3xl bg-white/70 border-black/1 border-0 border-solid mt-6 p-6 gap-0">
            <CardContent className="flex p-0 justify-between items-stretch gap-4">
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="size-14 rounded-2xl bg-[#FFDDE8] flex justify-center items-center">
                  <BookOpen className="size-6 text-[#ff2056]" />
                </div>
                <span className="leading-tight font-bold text-center text-zinc-700 text-[13px]">
                  Daily Prompts
                </span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="size-14 rounded-2xl bg-[#D8EEDB] flex justify-center items-center">
                  <Sparkles className="size-6 text-emerald-600" />
                </div>
                <span className="leading-tight font-bold text-center text-zinc-700 text-[13px]">
                  AI Insights
                </span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="size-14 rounded-2xl bg-[#F4EFFA] flex justify-center items-center">
                  <BarChart3 className="size-6 text-violet-500" />
                </div>
                <span className="leading-tight font-bold text-center text-zinc-700 text-[13px]">
                  Mood Trends
                </span>
              </div>
            </CardContent>
          </Card>
          <div className="flex mt-auto pt-6 flex-col items-center gap-4">
            <Button className="shadow-[0_16px_40px_-8px_oklch(0.645_0.246_16.439/.55)] font-bold rounded-full bg-[#ff2056] text-white text-[17px] w-full h-14">
              Start Writing ✨
            </Button>
            <button className="font-medium text-zinc-400 text-sm">
              Remind me later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
