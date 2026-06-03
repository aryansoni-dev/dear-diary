import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative min-h-[874px] bg-[linear-gradient(to_bottom,#DDEFFF_0%,#FFDDE8_48%,#FAF7F2_100%)] flex px-8 pt-12 pb-8 flex-col w-full">
          <div className="flex pt-2 justify-center items-center gap-2">
            <span className="size-2 rounded-full bg-[#ff2056]/20" />
            <span className="size-2 rounded-full bg-[#ff2056]/20" />
            <span className="rounded-full bg-[#ff2056] w-6 h-2" />
            <span className="size-2 rounded-full bg-[#ff2056]/20" />
            <span className="size-2 rounded-full bg-[#ff2056]/20" />
          </div>
          <div className="relative bg-[linear-gradient(to_bottom,#DDEFFF,#F4EFFA_55%,#D8EEDB)] shadow-[0_20px_50px_-15px_rgba(180,160,210,0.5)] rounded-3xl mt-8 w-full h-85 overflow-hidden">
            <div className="size-20 blur-md rounded-full bg-white/40 absolute left-10 top-10" />
            <div className="size-28 blur-md rounded-full bg-[#FFDDE8]/60 absolute right-12 top-16" />
            <div className="left-1/3 size-16 blur-md rounded-full bg-white/50 absolute top-24" />
            <div className="rounded-t-[100%] bg-[#D8EEDB] absolute inset-x-0 bottom-0 h-40" />
            <div className="rounded-t-[100%] bg-[#bfe3c7] absolute inset-x-0 bottom-0 h-24" />
            <div className="rounded-t-[100%] bg-[#F4EFFA] absolute -right-10 -bottom-6 w-56 h-32" />
            <div className="drop-shadow-sm text-3xl leading-9 absolute left-8 top-12">
              😊
            </div>
            <div className="drop-shadow-sm text-2xl leading-8 absolute right-10 top-24">
              😌
            </div>
            <div className="drop-shadow-sm text-2xl leading-8 absolute left-14 top-40">
              😔
            </div>
            <div className="drop-shadow-sm text-3xl leading-9 absolute right-20 top-32">
              🔥
            </div>
            <div className="left-1/2 -translate-x-1/2 drop-shadow-sm text-2xl leading-8 absolute top-20">
              🙏
            </div>
          </div>
          <h1 className="leading-tight font-semibold text-center text-zinc-950 text-3xl tracking-tight mt-8">
            😊 Understand Your Emotions
          </h1>
          <p className="leading-relaxed text-center text-zinc-500 text-base leading-6 mt-2 px-2">
            Track how you feel every day. Visualize your emotional world and
            discover what truly moves you.
          </p>
          <div className="overflow-x-auto flex -mx-8 mt-6 px-8 pb-1 gap-2">
            <div className="shrink-0 ring-2 ring-[#ff2056] shadow-[0_8px_20px_-8px_rgba(255,32,86,0.4)] rounded-full bg-[#FFDDE8] flex px-4 py-2 items-center gap-2">
              <span className="text-lg leading-7">😊</span>
              <span className="font-semibold text-[#ff2056] text-sm leading-5">
                Happy
              </span>
            </div>
            <div className="shrink-0 shadow-[0_8px_20px_-8px_rgba(120,170,130,0.4)] rounded-full bg-[#D8EEDB] flex px-4 py-2 items-center gap-2">
              <span className="text-lg leading-7">😌</span>
              <span className="font-semibold text-zinc-700 text-sm leading-5">
                Calm
              </span>
            </div>
            <div className="shrink-0 shadow-[0_8px_20px_-8px_rgba(120,150,200,0.4)] rounded-full bg-[#DDEFFF] flex px-4 py-2 items-center gap-2">
              <span className="text-lg leading-7">😔</span>
              <span className="font-semibold text-zinc-700 text-sm leading-5">
                Sad
              </span>
            </div>
            <div className="shrink-0 shadow-[0_8px_20px_-8px_rgba(160,140,200,0.4)] rounded-full bg-[#F4EFFA] flex px-4 py-2 items-center gap-2">
              <span className="text-lg leading-7">🔥</span>
              <span className="font-semibold text-zinc-700 text-sm leading-5">
                Motivated
              </span>
            </div>
            <div className="shrink-0 shadow-[0_8px_20px_-8px_rgba(120,170,130,0.4)] rounded-full bg-[#D8EEDB] flex px-4 py-2 items-center gap-2">
              <span className="text-lg leading-7">🙏</span>
              <span className="font-semibold text-zinc-700 text-sm leading-5">
                Grateful
              </span>
            </div>
          </div>
          <div className="flex mt-auto pt-10 flex-col items-center gap-4">
            <Button className="shadow-[0_12px_30px_-8px_rgba(255,32,86,0.5)] font-semibold rounded-full bg-[#ff2056] text-white text-base leading-6 w-full h-14">
              <span className="flex items-center gap-2">
                Next
                <ArrowRight className="size-5" />
              </span>
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
