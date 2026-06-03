import { useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  PenLine,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

export default function App() {
  return (
    <div>
      <div className="relative bg-white text-zinc-950 w-full h-fit overflow-hidden h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="bg-[linear-gradient(160deg,oklch(0.92_0.05_310)_0%,oklch(0.94_0.04_350)_55%,oklch(1_0_0)_100%)] absolute inset-x-0 top-0 h-72" />
        <div className="relative px-6 pt-14 pb-32">
          <div className="flex mb-6 justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-[#71717b] text-sm leading-5">
                Friday, June 14
              </span>
              <h1 className="font-semibold text-zinc-950/90 text-3xl leading-9 tracking-tight">
                Good Morning,
                <br />
                Aryan<span className="align-middle">☀️</span>
              </h1>
            </div>
            <div className="size-12 ring-2 ring-background shadow-md shrink-0 rounded-full overflow-hidden">
              <img
                alt="Aryan"
                className="object-cover w-full h-full"
                data-authorname="Ali Morshedlou"
                data-authorurl="https://unsplash.com/@alimorshedlou"
                data-blurhash="LEHLk~WB2yk8pyo0adR*.7kCMdnj"
                data-photoid="6anudmpILw4"
                src="https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3OTAzMTh8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGhlYWRzaG90fGVufDF8fHx8MTc4MDMzODc0Mnww&ixlib=rb-4.1.0&q=80&w=400"
              />
            </div>
          </div>
          <div className="shadow-[0_6px_20px_rgba(0,0,0,0.05)] rounded-2xl bg-[#FFDDE8] flex mb-6 px-5 py-4 items-center gap-3">
            <span className="text-2xl leading-8">🔥</span>
            <div className="flex flex-col">
              <span className="font-semibold text-zinc-950/85 text-base leading-6">
                7 Day Reflection Streak
              </span>
              <span className="font-medium text-[#71717b] text-xs leading-4">
                Keep the momentum going
              </span>
            </div>
          </div>
          <Card className="backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.07)] bg-[linear-gradient(150deg,oklch(0.94_0.05_310)_0%,oklch(0.95_0.04_350)_100%)] rounded-3xl border-black/1 border-0 border-solid mb-8 p-6 gap-4">
            <CardHeader className="p-0 gap-2">
              <div className="flex items-center gap-2">
                <div className="size-9 shrink-0 rounded-full bg-white/60 flex justify-center items-center">
                  <Sparkles className="size-4 text-[#ff2056]" />
                </div>
                <span className="font-medium uppercase text-zinc-950/50 text-xs leading-4 tracking-wide">
                  AI Reflection Prompt
                </span>
              </div>
              <p className="font-semibold text-zinc-950/90 text-xl leading-7">
                What made you smile unexpectedly today?
              </p>
            </CardHeader>
            <CardFooter className="p-0 gap-2">
              <Button className="font-semibold rounded-2xl bg-[#ff2056] text-rose-50 text-base leading-6 py-6 w-full">
                Start Writing ✨
              </Button>
            </CardFooter>
          </Card>
          <div className="flex mb-8 flex-col gap-3">
            <h2 className="font-semibold text-zinc-950/90 text-lg leading-7">
              How are you feeling today?
            </h2>
            <div className="flex flex-wrap gap-2">
              <button className="ring-1 ring-primary/30 rounded-full bg-[#ff2056]/12 flex px-4 py-2 items-center gap-2">
                <span className="text-lg leading-6">😊</span>
                <span className="font-semibold text-[#ff2056] text-sm leading-5">
                  Happy
                </span>
              </button>
              <button className="rounded-full bg-[#D8EEDB] flex px-4 py-2 items-center gap-2">
                <span className="text-lg leading-6">😌</span>
                <span className="font-medium text-zinc-950/75 text-sm leading-5">
                  Calm
                </span>
              </button>
              <button className="rounded-full bg-[#DDEFFF] flex px-4 py-2 items-center gap-2">
                <span className="text-lg leading-6">😔</span>
                <span className="font-medium text-zinc-950/75 text-sm leading-5">
                  Sad
                </span>
              </button>
              <button className="rounded-full bg-[#F4EFFA] flex px-4 py-2 items-center gap-2">
                <span className="text-lg leading-6">🔥</span>
                <span className="font-medium text-zinc-950/75 text-sm leading-5">
                  Motivated
                </span>
              </button>
              <button className="rounded-full bg-[#FFDDE8] flex px-4 py-2 items-center gap-2">
                <span className="text-lg leading-6">😰</span>
                <span className="font-medium text-zinc-950/75 text-sm leading-5">
                  Anxious
                </span>
              </button>
              <button className="rounded-full bg-[#D8EEDB] flex px-4 py-2 items-center gap-2">
                <span className="text-lg leading-6">🙏</span>
                <span className="font-medium text-zinc-950/75 text-sm leading-5">
                  Grateful
                </span>
              </button>
            </div>
          </div>
          <div className="flex mb-8 flex-col gap-3">
            <h2 className="font-semibold text-zinc-950/90 text-lg leading-7">
              Morning Intention
            </h2>
            <div className="shadow-[0_6px_20px_rgba(0,0,0,0.05)] rounded-3xl bg-[#D8EEDB] p-6">
              <div className="flex mb-3 items-center gap-3">
                <div className="size-9 shrink-0 rounded-full bg-white/70 flex justify-center items-center">
                  <Target className="size-4 text-emerald-700" />
                </div>
                <span className="font-semibold text-zinc-950/85 text-base leading-6">
                  Set your focus
                </span>
              </div>
              <p className="text-zinc-950/70 text-sm leading-5 mb-4">
                What is one thing you'd like to focus on today?
              </p>
              <div className="rounded-2xl bg-white/60 px-4 py-3">
                <span className="text-[#71717b] text-sm leading-5">
                  Tap to write your intention…
                </span>
              </div>
            </div>
          </div>
          <div className="flex mb-4 justify-between items-center">
            <h2 className="font-semibold text-zinc-950/90 text-xl leading-7">
              Recent Entries
            </h2>
            <button className="font-medium text-[#ff2056] text-sm leading-5">
              See all
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="shadow-[0_6px_20px_rgba(0,0,0,0.05)] rounded-3xl bg-[#DDEFFF] p-6">
              <div className="flex mb-2 justify-between items-center">
                <span className="font-medium text-[#71717b] text-xs leading-4">
                  Jun 12
                </span>
                <span className="text-2xl leading-8">😊</span>
              </div>
              <p className="font-semibold text-zinc-950/85 text-base leading-6 mb-1">
                A Peaceful Afternoon
              </p>
              <p className="text-zinc-950/60 text-sm leading-5">
                Spent the day reading by the lake and journaling my thoughts.
                The quiet was exactly what I needed.
              </p>
            </div>
            <div className="shadow-[0_6px_20px_rgba(0,0,0,0.05)] rounded-3xl bg-[#FFDDE8] p-6">
              <div className="flex mb-2 justify-between items-center">
                <span className="font-medium text-[#71717b] text-xs leading-4">
                  Jun 10
                </span>
                <span className="text-2xl leading-8">🔥</span>
              </div>
              <p className="font-semibold text-zinc-950/85 text-base leading-6 mb-1">
                Big Wins Today
              </p>
              <p className="text-zinc-950/60 text-sm leading-5">
                Finished the project I'd been dreading. Feeling accomplished and
                ready for what's next.
              </p>
            </div>
            <div className="shadow-[0_6px_20px_rgba(0,0,0,0.05)] rounded-3xl bg-[#F4EFFA] p-6">
              <div className="flex mb-2 justify-between items-center">
                <span className="font-medium text-[#71717b] text-xs leading-4">
                  Jun 08
                </span>
                <span className="text-2xl leading-8">😌</span>
              </div>
              <p className="font-semibold text-zinc-950/85 text-base leading-6 mb-1">
                A Quiet Day
              </p>
              <p className="text-zinc-950/60 text-sm leading-5">
                Nothing much happened, just taking time to rest and recharge
                before the busy week ahead.
              </p>
            </div>
          </div>
        </div>
        <div className="fixed backdrop-blur-xl bg-white/80 border-zinc-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid inset-x-0 bottom-0 px-4 pt-3 pb-7">
          <div className="flex flex-row justify-around items-center">
            <button className="flex flex-col items-center gap-1">
              <div className="rounded-full bg-[#ff2056]/15 flex px-5 py-1.5 justify-center items-center">
                <BookOpen className="size-5 text-[#ff2056]" />
              </div>
              <span className="font-semibold text-[#ff2056] text-[11px]">
                Today
              </span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="flex px-5 py-1.5 justify-center items-center">
                <PenLine className="size-5 text-[#71717b]" />
              </div>
              <span className="font-medium text-[#71717b] text-[11px]">
                Reflect
              </span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="flex px-5 py-1.5 justify-center items-center">
                <BarChart3 className="size-5 text-[#71717b]" />
              </div>
              <span className="font-medium text-[#71717b] text-[11px]">
                Insights
              </span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="flex px-5 py-1.5 justify-center items-center">
                <User className="size-5 text-[#71717b]" />
              </div>
              <span className="font-medium text-[#71717b] text-[11px]">
                Profile
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
