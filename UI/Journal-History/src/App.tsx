import { useEffect } from "react";
import { BarChart3, BookOpen, Moon, Plus, Search, User } from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative min-h-[874px] bg-[linear-gradient(180deg,#FAF7F2_0%,#FBF6FA_45%,#FAF7F2_100%)] flex flex-col w-full">
          <div className="px-6 pt-14 pb-3">
            <div className="flex mb-6 justify-between items-center">
              <div className="flex flex-col">
                <span className="font-medium text-zinc-400 text-[13px] tracking-wide">
                  YOUR REFLECTIONS
                </span>
                <h1 className="font-bold text-zinc-950 text-3xl tracking-tight">
                  My Journal
                </h1>
              </div>
              <button className="size-11 shadow-sm rounded-full bg-white flex justify-center items-center">
                <Plus className="size-5 text-[#ff2056]" />
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="size-[18px] top-1/2 -translate-y-1/2 text-zinc-400 absolute left-4" />
              <input
                className="shadow-sm outline-none rounded-2xl bg-white text-zinc-700 text-[15px] border-zinc-100 border-1 border-solid pl-11 pr-4 w-full h-12"
                placeholder="Search entries, moods, dates..."
              />
            </div>
            <div className="overflow-x-auto flex -mx-6 px-6 pb-1 gap-2">
              <button className="shrink-0 shadow-sm font-semibold rounded-full bg-[#ff2056] text-white text-sm px-4 h-9">
                All
              </button>
              <button className="shrink-0 font-medium rounded-full bg-[#FFDDE8] text-zinc-700 text-sm px-4 h-9">
                😊 Happy
              </button>
              <button className="shrink-0 font-medium rounded-full bg-[#D8EEDB] text-zinc-700 text-sm px-4 h-9">
                😌 Calm
              </button>
              <button className="shrink-0 font-medium rounded-full bg-[#F4EFFA] text-zinc-700 text-sm px-4 h-9">
                😰 Anxious
              </button>
              <button className="shrink-0 font-medium rounded-full bg-[#DDEFFF] text-zinc-700 text-sm px-4 h-9">
                🙏 Grateful
              </button>
            </div>
          </div>
          <div className="px-6 pb-2">
            <div className="overflow-x-auto flex -mx-6 px-6 pb-1 gap-2">
              <div className="shrink-0 shadow-sm rounded-2xl bg-white flex flex-col justify-center items-center gap-1 w-12 h-17">
                <span className="font-medium text-zinc-400 text-[11px]">
                  Mon
                </span>
                <span className="font-bold text-zinc-700 text-base">9</span>
              </div>
              <div className="shrink-0 shadow-sm rounded-2xl bg-white flex flex-col justify-center items-center gap-1 w-12 h-17">
                <span className="font-medium text-zinc-400 text-[11px]">
                  Tue
                </span>
                <span className="font-bold text-zinc-700 text-base">10</span>
              </div>
              <div className="shrink-0 shadow-sm rounded-2xl bg-white flex flex-col justify-center items-center gap-1 w-12 h-17">
                <span className="font-medium text-zinc-400 text-[11px]">
                  Wed
                </span>
                <span className="font-bold text-zinc-700 text-base">11</span>
              </div>
              <div className="shrink-0 shadow-md rounded-2xl bg-[#ff2056] flex flex-col justify-center items-center gap-1 w-12 h-17">
                <span className="font-medium text-white/80 text-[11px]">
                  Thu
                </span>
                <span className="font-bold text-white text-base">12</span>
              </div>
              <div className="shrink-0 shadow-sm rounded-2xl bg-white flex flex-col justify-center items-center gap-1 w-12 h-17">
                <span className="font-medium text-zinc-400 text-[11px]">
                  Fri
                </span>
                <span className="font-bold text-zinc-700 text-base">13</span>
              </div>
              <div className="shrink-0 shadow-sm rounded-2xl bg-white flex flex-col justify-center items-center gap-1 w-12 h-17">
                <span className="font-medium text-zinc-400 text-[11px]">
                  Sat
                </span>
                <span className="font-bold text-zinc-700 text-base">14</span>
              </div>
            </div>
          </div>
          <div className="flex px-6 pt-4 pb-32 flex-col flex-1 gap-4">
            <div className="flex mt-1 items-center gap-2">
              <span className="font-semibold text-zinc-400 text-[13px] tracking-wide">
                TODAY
              </span>
              <div className="bg-zinc-200 flex-1 h-px" />
            </div>
            <div className="relative pl-6">
              <div className="bg-zinc-200 absolute left-[5px] top-2 bottom-0 w-px" />
              <div className="size-[11px] ring-4 ring-[#FFDDE8] rounded-full bg-[#ff2056] absolute left-0 top-2" />
              <div className="shadow-sm rounded-3xl bg-white border-zinc-100 border-1 border-solid flex p-5 flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-400 text-xs">
                    Thu, June 12 · 9:24 PM
                  </span>
                  <span className="size-9 rounded-full bg-[#FFDDE8] text-base flex justify-center items-center">
                    😊
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-900 text-[17px] tracking-tight">
                  A surprisingly bright day
                </h3>
                <p className="leading-relaxed line-clamp-2 text-zinc-500 text-sm">
                  Coffee with an old friend turned into hours of laughing. I
                  forgot how much I needed that kind of connection...
                </p>
              </div>
            </div>
            <div className="relative pl-6">
              <div className="bg-zinc-200 absolute left-[5px] top-2 bottom-0 w-px" />
              <div className="size-[11px] ring-4 ring-[#D8EEDB] rounded-full bg-[#86C99B] absolute left-0 top-2" />
              <div className="shadow-sm rounded-3xl bg-white border-zinc-100 border-1 border-solid flex p-5 flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-400 text-xs">
                    Thu, June 12 · 7:10 AM
                  </span>
                  <span className="size-9 rounded-full bg-[#D8EEDB] text-base flex justify-center items-center">
                    😌
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-900 text-[17px] tracking-tight">
                  Slow morning intentions
                </h3>
                <p className="leading-relaxed line-clamp-2 text-zinc-500 text-sm">
                  Set my focus on staying present. Felt calm and steady before
                  the day even started 🌿
                </p>
              </div>
            </div>
            <div className="flex mt-3 items-center gap-2">
              <span className="font-semibold text-zinc-400 text-[13px] tracking-wide">
                YESTERDAY
              </span>
              <div className="bg-zinc-200 flex-1 h-px" />
            </div>
            <div className="relative pl-6">
              <div className="bg-zinc-200 absolute left-[5px] top-2 bottom-0 w-px" />
              <div className="size-[11px] ring-4 ring-[#DDEFFF] rounded-full bg-[#7C9FD9] absolute left-0 top-2" />
              <div className="shadow-sm rounded-3xl bg-white border-zinc-100 border-1 border-solid flex p-5 flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-400 text-xs">
                    Wed, June 11 · 10:02 PM
                  </span>
                  <span className="size-9 rounded-full bg-[#DDEFFF] text-base flex justify-center items-center">
                    😔
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-900 text-[17px] tracking-tight">
                  A heavier kind of evening
                </h3>
                <p className="leading-relaxed line-clamp-2 text-zinc-500 text-sm">
                  Work felt overwhelming today. Writing it down helped me
                  untangle what was really bothering me...
                </p>
              </div>
            </div>
            <div className="relative pl-6">
              <div className="bg-zinc-200 absolute left-[5px] top-2 w-px h-3" />
              <div className="size-[11px] ring-4 ring-[#F4EFFA] rounded-full bg-[#A98FD0] absolute left-0 top-2" />
              <div className="shadow-sm rounded-3xl bg-white border-zinc-100 border-1 border-solid flex p-5 flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-400 text-xs">
                    Wed, June 11 · 8:30 AM
                  </span>
                  <span className="size-9 rounded-full bg-[#F4EFFA] text-base flex justify-center items-center">
                    🙏
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-900 text-[17px] tracking-tight">
                  Three small gratitudes
                </h3>
                <p className="leading-relaxed line-clamp-2 text-zinc-500 text-sm">
                  Sunlight through the window, a warm cup of tea, and a kind
                  message from mom. Little things matter 🌸
                </p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/80 border-zinc-200/70 border-t-1 border-r-0 border-b-0 border-l-0 border-solid absolute inset-x-0 bottom-0 px-4 pt-3 pb-7">
            <div className="flex justify-around items-center">
              <button className="flex flex-col items-center gap-1">
                <BookOpen className="size-[22px] text-zinc-400" />
                <span className="font-medium text-zinc-400 text-[11px]">
                  Today
                </span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <Moon className="size-[22px] text-zinc-400" />
                <span className="font-medium text-zinc-400 text-[11px]">
                  Reflect
                </span>
              </button>
              <button className="rounded-full bg-[#ff2056]/15 flex px-4 py-1 flex-col items-center gap-1">
                <BarChart3 className="size-[22px] text-[#ff2056]" />
                <span className="font-semibold text-[#ff2056] text-[11px]">
                  Insights
                </span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <User className="size-[22px] text-zinc-400" />
                <span className="font-medium text-zinc-400 text-[11px]">
                  Profile
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
