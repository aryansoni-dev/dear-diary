import { useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  Check,
  ChevronLeft,
  Image,
  Library,
  Mic,
  Settings,
  Sparkles,
  Tag,
} from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="relative bg-white text-zinc-950 w-full h-fit overflow-hidden h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="min-h-[874px] flex pb-28 flex-col">
          <div className="flex px-6 pt-14 pb-4 justify-between items-center">
            <button className="size-11 shadow-sm rounded-full bg-zinc-100 flex justify-center items-center">
              <ChevronLeft className="size-5 text-zinc-950" />
            </button>
            <div className="flex flex-col items-center">
              <span className="font-semibold uppercase text-[#71717b] text-[11px] tracking-[3.2px]">
                Today
              </span>
              <span className="font-semibold text-zinc-950 text-base leading-6">
                Mon, Jun 16
              </span>
            </div>
            <button className="shadow-sm rounded-full bg-[#ff2056] text-rose-50 flex px-5 py-2.5 items-center gap-1.5">
              <Check className="size-4" />
              <span className="font-semibold text-sm leading-5">Save</span>
            </button>
          </div>
          <div className="px-6 pt-2">
            <div className="bg-[linear-gradient(135deg,oklch(0.95_0.03_320),oklch(0.95_0.04_20))] shadow-sm rounded-3xl p-5">
              <div className="flex mb-2 items-center gap-2">
                <div className="size-8 rounded-full bg-white/60 flex justify-center items-center">
                  <Sparkles className="size-4 text-[#ff2056]" />
                </div>
                <span className="font-semibold uppercase text-[#ff2056] text-[11px] tracking-[2.4px]">
                  Today's Reflection Prompt
                </span>
              </div>
              <p className="leading-snug font-semibold text-zinc-950 text-lg leading-7">
                What made you smile unexpectedly today?
              </p>
            </div>
          </div>
          <div className="px-6 pt-6">
            <span className="font-semibold uppercase text-[#71717b] text-[11px] tracking-[3.2px]">
              How are you feeling?
            </span>
            <div className="overflow-x-auto flex -mx-6 px-6 pt-3 pb-1 items-center gap-2">
              <button className="shrink-0 shadow-sm rounded-full bg-[#ff2056] text-rose-50 flex px-4 py-2.5 items-center gap-2">
                <span className="text-base leading-6">😊</span>
                <span className="font-semibold text-sm leading-5">Happy</span>
              </button>
              <button className="shrink-0 rounded-full bg-zinc-100 flex px-4 py-2.5 items-center gap-2">
                <span className="text-base leading-6">😌</span>
                <span className="font-medium text-zinc-950 text-sm leading-5">
                  Calm
                </span>
              </button>
              <button className="shrink-0 rounded-full bg-zinc-100 flex px-4 py-2.5 items-center gap-2">
                <span className="text-base leading-6">😔</span>
                <span className="font-medium text-zinc-950 text-sm leading-5">
                  Sad
                </span>
              </button>
              <button className="shrink-0 rounded-full bg-zinc-100 flex px-4 py-2.5 items-center gap-2">
                <span className="text-base leading-6">🔥</span>
                <span className="font-medium text-zinc-950 text-sm leading-5">
                  Motivated
                </span>
              </button>
              <button className="shrink-0 rounded-full bg-zinc-100 flex px-4 py-2.5 items-center gap-2">
                <span className="text-base leading-6">😰</span>
                <span className="font-medium text-zinc-950 text-sm leading-5">
                  Anxious
                </span>
              </button>
            </div>
          </div>
          <div className="flex px-6 pt-6 flex-col flex-1">
            <input
              className="bg-transparent outline-none font-bold text-zinc-950 text-2xl leading-8 border-black/1 border-0 border-solid mb-3 w-full"
              placeholder="What's on your mind?"
            />
            <div className="bg-zinc-200 w-full h-px" />
            <textarea
              className="min-h-[260px] resize-none bg-transparent outline-none leading-relaxed text-zinc-950 text-base leading-6 border-black/1 border-0 border-solid pt-4 flex-1 w-full"
              placeholder="Write freely... this is your safe space 🌿"
            />
          </div>
        </div>
        <div className="absolute right-6 bottom-32">
          <button className="shadow-lg shadow-primary/30 rounded-full bg-[#ff2056] text-rose-50 flex pl-5 pr-6 py-3.5 items-center gap-2">
            <Sparkles className="size-5" />
            <span className="font-semibold text-sm leading-5">
              Reflect With AI
            </span>
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <div className="backdrop-blur-xl bg-zinc-100/60 border-zinc-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex px-4 py-3 justify-around items-center">
            <button className="text-[#71717b] flex flex-col items-center gap-1">
              <Mic className="size-5" />
              <span className="font-medium text-[10px]">Voice</span>
            </button>
            <button className="text-[#71717b] flex flex-col items-center gap-1">
              <Image className="size-5" />
              <span className="font-medium text-[10px]">Photo</span>
            </button>
            <button className="text-[#71717b] flex flex-col items-center gap-1">
              <Tag className="size-5" />
              <span className="font-medium text-[10px]">Tags</span>
            </button>
          </div>
          <div className="backdrop-blur-xl bg-white/90 border-zinc-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex px-2 pt-2 pb-6 justify-around items-center">
            <button className="text-[#71717b] flex px-4 py-1.5 flex-col items-center gap-1">
              <BookOpen className="size-5" />
              <span className="font-medium text-[10px]">Today</span>
            </button>
            <button className="text-[#71717b] flex px-4 py-1.5 flex-col items-center gap-1">
              <Library className="size-5" />
              <span className="font-medium text-[10px]">Entries</span>
            </button>
            <button className="rounded-full bg-[#ff2056]/15 text-[#ff2056] flex px-4 py-1.5 flex-col items-center gap-1">
              <BarChart3 className="size-5" />
              <span className="font-semibold text-[10px]">Insights</span>
            </button>
            <button className="text-[#71717b] flex px-4 py-1.5 flex-col items-center gap-1">
              <Settings className="size-5" />
              <span className="font-medium text-[10px]">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
