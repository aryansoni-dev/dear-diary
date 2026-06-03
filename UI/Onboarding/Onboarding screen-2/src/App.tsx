import { useEffect } from "react";
import {
  BookOpen,
  Brain,
  Sparkle,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative min-h-[874px] bg-[linear-gradient(to_bottom,#F4EFFA_0%,#FAF7F2_100%)] flex px-8 pt-12 pb-8 flex-col w-full">
          <div className="flex pt-2 justify-center items-center gap-2">
            <span className="size-2 rounded-full bg-[#ff2056]/20" />
            <span className="rounded-full bg-[#ff2056] w-6 h-2" />
            <span className="size-2 rounded-full bg-[#ff2056]/20" />
            <span className="size-2 rounded-full bg-[#ff2056]/20" />
            <span className="size-2 rounded-full bg-[#ff2056]/20" />
          </div>
          <div className="relative flex mt-6 justify-center items-center w-full h-85">
            <div className="size-56 blur-3xl opacity-80 rounded-full bg-[#F4EFFA] absolute" />
            <div className="size-12 blur-xl opacity-70 rounded-full bg-[#FFDDE8] absolute left-6 top-6" />
            <div className="size-14 blur-xl opacity-70 rounded-full bg-[#DDEFFF] absolute right-6 bottom-10" />
            <div className="size-8 blur-lg opacity-70 rounded-full bg-[#D8EEDB] absolute right-10 top-10" />
            <Sparkle className="size-5 text-[#ff2056]/60 absolute right-16 top-8" />
            <Sparkle className="size-4 text-[#ff2056]/40 absolute left-10 bottom-16" />
            <Star className="size-4 text-[#DDEFFF] absolute left-16 top-20" />
            <div className="relative size-44 backdrop-blur-md shadow-[0_20px_60px_-15px_rgba(180,150,230,0.45)] rounded-3xl bg-white/70 flex justify-center items-center">
              <BookOpen className="size-24 text-[#ff2056]" strokeWidth={1.4} />
              <div className="size-12 backdrop-blur-md shadow-md rounded-full bg-white/80 flex absolute -right-3 -top-3 justify-center items-center">
                <Sparkles className="size-6 text-[#ff2056]" />
              </div>
            </div>
          </div>
          <div className="flex mt-2 flex-col items-center gap-4">
            <h1 className="leading-tight font-semibold text-center text-zinc-950 text-3xl">
              ✨ AI-Powered Reflection
            </h1>
            <p className="leading-relaxed text-center text-zinc-500 text-base px-2">
              Discover patterns in your thoughts. DearDiary AI reads between the
              lines to help you understand yourself better.
            </p>
          </div>
          <Card className="backdrop-blur-md shadow-[0_18px_50px_-15px_rgba(180,150,230,0.4)] rounded-3xl bg-white/70 border-black/1 border-0 border-solid mt-8 p-6 gap-4 w-full">
            <CardContent className="flex p-0 justify-between items-start gap-2">
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="size-14 rounded-2xl bg-[#FFDDE8] flex justify-center items-center">
                  <Sparkles className="size-6 text-[#ff2056]" />
                </div>
                <span className="font-bold text-zinc-800 text-[13px]">
                  AI Prompts
                </span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="size-14 rounded-2xl bg-[#D8EEDB] flex justify-center items-center">
                  <TrendingUp className="size-6 text-emerald-600" />
                </div>
                <span className="font-bold text-zinc-800 text-[13px]">
                  Patterns
                </span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="size-14 rounded-2xl bg-[#DDEFFF] flex justify-center items-center">
                  <Brain className="size-6 text-sky-600" />
                </div>
                <span className="font-bold text-zinc-800 text-[13px]">
                  Insights
                </span>
              </div>
            </CardContent>
          </Card>
          <div className="flex mt-auto pt-8 flex-col items-center gap-4">
            <Button className="shadow-[0_10px_30px_-8px_rgba(255,32,86,0.5)] font-semibold rounded-full bg-[#ff2056] text-rose-50 text-[17px] w-full h-14">
              Next →
            </Button>
            <button className="font-medium text-zinc-400 text-[15px]">
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
