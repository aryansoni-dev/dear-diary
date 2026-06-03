import { useEffect } from "react";
import { ChevronLeft, Mic, Send, Smile, Sparkles } from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative bg-gradient-to-b from-[#FBEFF5] via-[#FAF4F7] to-[#FAF7F2] flex flex-col w-full h-218.5">
          <div className="flex px-6 pt-14 pb-4 items-center gap-4">
            <button className="size-10 shadow-sm shrink-0 rounded-full bg-white flex justify-center items-center">
              <ChevronLeft className="size-5 text-zinc-700" />
            </button>
            <div className="flex items-center flex-1 gap-2">
              <div className="size-11 bg-gradient-to-br from-[#ff5c87] to-[#ff2056] shadow-md shadow-rose-200/60 rounded-full flex justify-center items-center">
                <Sparkles className="size-5 text-rose-50" />
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="leading-tight font-bold text-zinc-900 text-lg leading-7 tracking-tight">
                  DearDiary AI ✨
                </h1>
                <p className="leading-tight text-zinc-400 text-xs leading-4">
                  Your reflection companion
                </p>
              </div>
            </div>
            <div className="rounded-full bg-emerald-100 flex px-2 py-1 items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="leading-none font-semibold text-emerald-700 text-[11px]">
                Online
              </span>
            </div>
          </div>
          <div className="overflow-y-auto flex px-6 py-4 flex-col flex-1 gap-6">
            <div className="flex justify-center items-center">
              <span className="leading-none font-medium rounded-full bg-zinc-100 text-zinc-400 text-[11px] px-4 py-2">
                Today · 8:42 PM
              </span>
            </div>
            <div className="max-w-[80%] flex self-start flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="size-7 bg-gradient-to-br from-[#ff5c87] to-[#ff2056] shrink-0 rounded-full flex justify-center items-center">
                  <Sparkles className="size-4 text-rose-50" />
                </div>
                <span className="leading-none font-semibold text-zinc-400 text-[11px]">
                  DearDiary AI
                </span>
              </div>
              <div className="shadow-sm rounded-tl-lg rounded-tr-3xl rounded-bl-3xl rounded-br-3xl bg-[#F1EBFA] p-4">
                <p className="leading-relaxed text-zinc-700 text-[15px]">
                  Hi Aryan 🌸 I'm here to sit with you for a moment. No rush, no
                  judgment.
                </p>
              </div>
            </div>
            <div className="max-w-[80%] flex self-start flex-col gap-2">
              <div className="shadow-sm rounded-tl-lg rounded-tr-3xl rounded-bl-3xl rounded-br-3xl bg-[#FCE7EF] p-4">
                <p className="leading-relaxed text-zinc-700 text-[15px]">
                  What part of today felt most meaningful to you?
                </p>
              </div>
            </div>
            <div className="max-w-[80%] flex self-end flex-col items-end gap-2">
              <div className="bg-gradient-to-br from-[#ff5c87] to-[#ff2056] shadow-md shadow-rose-200/60 rounded-tl-3xl rounded-tr-lg rounded-bl-3xl rounded-br-3xl p-4">
                <p className="leading-relaxed text-rose-50 text-[15px]">
                  A long talk with an old friend over coffee. I didn't realize
                  how much I missed that.
                </p>
              </div>
              <span className="leading-none font-medium text-zinc-400 text-[11px] pr-1">
                8:43 PM
              </span>
            </div>
            <div className="max-w-[80%] flex self-start flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="size-7 bg-gradient-to-br from-[#ff5c87] to-[#ff2056] shrink-0 rounded-full flex justify-center items-center">
                  <Sparkles className="size-4 text-rose-50" />
                </div>
                <span className="leading-none font-semibold text-zinc-400 text-[11px]">
                  DearDiary AI
                </span>
              </div>
              <div className="shadow-sm rounded-tl-lg rounded-tr-3xl rounded-bl-3xl rounded-br-3xl bg-[#E7F2EB] p-4">
                <p className="leading-relaxed text-zinc-700 text-[15px]">
                  That sounds nourishing 🌿 Connection has a quiet way of
                  reminding us who we are. What about that conversation stayed
                  with you?
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <span className="leading-none font-semibold uppercase text-zinc-400 text-[11px] tracking-wide">
                Suggested replies
              </span>
              <div className="flex flex-wrap gap-2">
                <button className="shadow-sm leading-none font-medium rounded-full bg-white text-zinc-700 text-sm leading-5 border-zinc-200 border-1 border-solid px-4 py-2">
                  Tell me more
                </button>
                <button className="shadow-sm leading-none font-medium rounded-full bg-white text-zinc-700 text-sm leading-5 border-zinc-200 border-1 border-solid px-4 py-2">
                  Why do you think that?
                </button>
                <button className="shadow-sm leading-none font-medium rounded-full bg-white text-zinc-700 text-sm leading-5 border-zinc-200 border-1 border-solid px-4 py-2">
                  Explore this feeling
                </button>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-t from-[#FAF7F2] to-transparent px-6 pt-4 pb-8">
            <div className="shadow-md rounded-full bg-white border-zinc-200 border-1 border-solid flex pl-4 pr-2 py-2 items-center gap-2">
              <Smile className="size-5 shrink-0 text-zinc-400" />
              <input
                className="bg-transparent outline-none text-zinc-700 text-[15px] flex-1"
                placeholder="Share your thoughts..."
              />
              <button className="size-10 shrink-0 rounded-full bg-zinc-100 flex justify-center items-center">
                <Mic className="size-5 text-zinc-500" />
              </button>
              <button className="size-10 bg-gradient-to-br from-[#ff5c87] to-[#ff2056] shadow-md shadow-rose-200/60 shrink-0 rounded-full flex justify-center items-center">
                <Send className="size-4 text-rose-50" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
