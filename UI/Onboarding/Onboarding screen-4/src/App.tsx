import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative bg-gradient-to-b from-[#FFDDE8] to-[#F4EFFA] flex px-6 pt-12 pb-8 flex-col w-full h-218.5">
          <div className="flex pt-4 justify-center items-center gap-2">
            <span className="rounded-full bg-[#ff2056]/20 w-2 h-2" />
            <span className="rounded-full bg-[#ff2056]/20 w-2 h-2" />
            <span className="rounded-full bg-[#ff2056]/20 w-2 h-2" />
            <span className="rounded-full bg-[#ff2056] w-8 h-2" />
            <span className="rounded-full bg-[#ff2056]/20 w-2 h-2" />
          </div>
          <div className="flex pt-8 flex-col items-center gap-2">
            <h1 className="leading-tight font-semibold text-center text-zinc-950 text-3xl tracking-tight">
              🌅 Build Daily Rituals
            </h1>
            <p className="max-w-[320px] leading-relaxed text-center text-zinc-500 text-base leading-6">
              Morning intentions and evening reflections — small habits that
              transform your inner world.
            </p>
          </div>
          <div className="flex mt-8 flex-col justify-center flex-1 gap-6">
            <div className="shadow-[0_12px_30px_-12px_rgba(120,180,140,0.55)] rounded-3xl bg-[#D8EEDB] flex p-6 flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 backdrop-blur-sm rounded-full bg-white/60 text-2xl leading-8 flex justify-center items-center">
                  ☀️
                </div>
                <span className="font-semibold text-zinc-900 text-lg leading-7">
                  Morning Intention ☀️
                </span>
              </div>
              <p className="leading-relaxed text-zinc-600 text-[15px]">
                Start each day with clarity. Set one focus and carry it with
                you.
              </p>
              <div className="backdrop-blur-sm rounded-2xl bg-white/60 px-4 py-3">
                <span className="text-zinc-400 text-sm leading-5">
                  What will you focus on today?
                </span>
              </div>
            </div>
            <div className="shadow-[0_12px_30px_-12px_rgba(160,140,200,0.55)] rounded-3xl bg-[#F4EFFA] flex p-6 flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 backdrop-blur-sm rounded-full bg-white/60 text-2xl leading-8 flex justify-center items-center">
                  🌙
                </div>
                <span className="font-semibold text-zinc-900 text-lg leading-7">
                  Evening Reflection 🌙
                </span>
              </div>
              <p className="leading-relaxed text-zinc-600 text-[15px]">
                End each day with gratitude. Reflect on what moved you.
              </p>
              <div className="backdrop-blur-sm rounded-2xl bg-white/60 px-4 py-3">
                <span className="text-zinc-400 text-sm leading-5">
                  How did today feel?
                </span>
              </div>
            </div>
          </div>
          <div className="flex pt-6 flex-col items-center gap-4">
            <Button className="shadow-[0_10px_24px_-8px_rgba(255,32,86,0.6)] font-semibold rounded-full bg-[#ff2056] text-white text-base leading-6 w-full h-14">
              Next →
            </Button>
            <button className="font-medium text-zinc-400 text-sm leading-5">
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
