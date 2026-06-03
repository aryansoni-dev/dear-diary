import { useEffect } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Lock,
  LogOut,
  Moon,
  Palette,
  RefreshCw,
  Settings,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="min-h-[874px] bg-[linear-gradient(180deg,oklch(0.96_0.03_330)_0%,oklch(0.98_0.01_300)_30%,oklch(1_0_0)_60%)] pb-28 w-full">
          <div className="flex px-6 pt-14 justify-between items-center">
            <button className="size-9 shadow-sm rounded-full bg-white/70 text-zinc-700 flex justify-center items-center">
              <ChevronLeft className="size-5" />
            </button>
            <span className="font-semibold text-zinc-900 text-base leading-6 tracking-tight">
              Profile
            </span>
            <button className="size-9 shadow-sm rounded-full bg-white/70 text-zinc-700 flex justify-center items-center">
              <Settings className="size-5" />
            </button>
          </div>
          <div className="flex px-6 pt-6 flex-col items-center">
            <div className="size-24 bg-[linear-gradient(135deg,oklch(0.94_0.05_350),oklch(0.93_0.04_310))] shadow-[0_8px_24px_-6px_oklch(0.85_0.06_350)] font-bold rounded-full text-[#ff2056] text-3xl leading-9 flex justify-center items-center">
              A
            </div>
            <h1 className="font-bold text-zinc-900 text-2xl leading-8 tracking-tight mt-4">
              Aryan
            </h1>
            <p className="text-zinc-500 text-sm leading-5 mt-1">
              Journaling since March 2026 🌸
            </p>
          </div>
          <div className="grid grid-cols-3 px-6 pt-6 gap-4">
            <div className="bg-[oklch(0.94_0.04_310)] shadow-sm rounded-3xl flex p-4 flex-col items-center gap-1">
              <span className="text-2xl leading-8">📝</span>
              <span className="font-bold text-zinc-900 text-xl leading-7">
                42
              </span>
              <span className="font-medium text-zinc-500 text-xs leading-4">
                Entries
              </span>
            </div>
            <div className="bg-[oklch(0.95_0.04_350)] shadow-sm rounded-3xl flex p-4 flex-col items-center gap-1">
              <span className="text-2xl leading-8">🔥</span>
              <span className="font-bold text-zinc-900 text-xl leading-7">
                7
              </span>
              <span className="font-medium text-zinc-500 text-xs leading-4">
                Streak
              </span>
            </div>
            <div className="bg-[oklch(0.94_0.04_160)] shadow-sm rounded-3xl flex p-4 flex-col items-center gap-1">
              <span className="text-2xl leading-8">😊</span>
              <span className="font-bold text-zinc-900 text-xl leading-7">
                5
              </span>
              <span className="font-medium text-zinc-500 text-xs leading-4">
                Moods
              </span>
            </div>
          </div>
          <div className="px-6 pt-8">
            <h2 className="font-bold text-zinc-900 text-lg leading-7 tracking-tight">
              Your Emotional Snapshot
            </h2>
            <Card className="bg-[linear-gradient(135deg,oklch(0.96_0.03_330),oklch(0.96_0.03_300))] shadow-sm rounded-3xl mt-4 p-5 gap-3">
              <CardContent className="flex p-0 justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-white/70 text-xl leading-7 flex justify-center items-center">
                    😌
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-500 text-xs leading-4">
                      Most Common Mood
                    </span>
                    <span className="font-semibold text-zinc-900 text-base leading-6">
                      Calm
                    </span>
                  </div>
                </div>
              </CardContent>
              <div className="bg-white/60 w-full h-px" />
              <CardContent className="flex p-0 justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-white/70 text-xl leading-7 flex justify-center items-center">
                    ⏱️
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-500 text-xs leading-4">
                      Average Reflection Time
                    </span>
                    <span className="font-semibold text-zinc-900 text-base leading-6">
                      8 min/day
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="px-6 pt-8">
            <h2 className="font-bold text-zinc-900 text-lg leading-7 tracking-tight">
              Achievements
            </h2>
            <div className="flex mt-4 flex-col gap-3">
              <div className="bg-[oklch(0.94_0.04_160)] shadow-sm rounded-3xl flex p-4 items-center gap-3">
                <div className="size-12 rounded-2xl bg-white/70 text-2xl leading-8 flex justify-center items-center">
                  🌱
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-900 text-sm leading-5">
                    First Week Completed
                  </span>
                  <span className="text-zinc-500 text-xs leading-4">
                    You showed up 7 days in a row
                  </span>
                </div>
              </div>
              <div className="bg-[oklch(0.95_0.04_350)] shadow-sm rounded-3xl flex p-4 items-center gap-3">
                <div className="size-12 rounded-2xl bg-white/70 text-2xl leading-8 flex justify-center items-center">
                  🔥
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-900 text-sm leading-5">
                    7 Day Streak
                  </span>
                  <span className="text-zinc-500 text-xs leading-4">
                    Keep the momentum going
                  </span>
                </div>
              </div>
              <div className="bg-[oklch(0.94_0.04_310)] shadow-sm rounded-3xl flex p-4 items-center gap-3">
                <div className="size-12 rounded-2xl bg-white/70 text-2xl leading-8 flex justify-center items-center">
                  📝
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-900 text-sm leading-5">
                    25 Entries Written
                  </span>
                  <span className="text-zinc-500 text-xs leading-4">
                    Your reflection journey grows
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 pt-8">
            <h2 className="font-bold text-zinc-900 text-lg leading-7 tracking-tight">
              Preferences
            </h2>
            <Card className="shadow-sm rounded-3xl bg-white mt-4 p-2 gap-0">
              <button className="rounded-2xl flex p-3 justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-[oklch(0.95_0.04_350)] rounded-xl text-[#ff2056] flex justify-center items-center">
                    <Bell className="size-5" />
                  </div>
                  <span className="font-medium text-zinc-900 text-sm leading-5">
                    Notifications
                  </span>
                </div>
                <ChevronRight className="size-5 text-zinc-400" />
              </button>
              <div className="bg-zinc-200 mx-3 h-px" />
              <button className="rounded-2xl flex p-3 justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-[oklch(0.94_0.04_240)] rounded-xl text-zinc-700 flex justify-center items-center">
                    <Lock className="size-5" />
                  </div>
                  <span className="font-medium text-zinc-900 text-sm leading-5">
                    Privacy Lock
                  </span>
                </div>
                <ChevronRight className="size-5 text-zinc-400" />
              </button>
              <div className="bg-zinc-200 mx-3 h-px" />
              <button className="rounded-2xl flex p-3 justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-[oklch(0.94_0.04_310)] rounded-xl text-zinc-700 flex justify-center items-center">
                    <Palette className="size-5" />
                  </div>
                  <span className="font-medium text-zinc-900 text-sm leading-5">
                    Theme
                  </span>
                </div>
                <ChevronRight className="size-5 text-zinc-400" />
              </button>
            </Card>
          </div>
          <div className="px-6 pt-8">
            <h2 className="font-bold text-zinc-900 text-lg leading-7 tracking-tight">
              Account
            </h2>
            <Card className="shadow-sm rounded-3xl bg-white mt-4 p-2 gap-0">
              <button className="rounded-2xl flex p-3 justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-[oklch(0.94_0.04_160)] rounded-xl text-zinc-700 flex justify-center items-center">
                    <RefreshCw className="size-5" />
                  </div>
                  <span className="font-medium text-zinc-900 text-sm leading-5">{`Backup & Sync`}</span>
                </div>
                <ChevronRight className="size-5 text-zinc-400" />
              </button>
              <div className="bg-zinc-200 mx-3 h-px" />
              <button className="rounded-2xl flex p-3 justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-[oklch(0.95_0.04_350)] rounded-xl text-[#ff2056] flex justify-center items-center">
                    <Crown className="size-5" />
                  </div>
                  <span className="font-medium text-zinc-900 text-sm leading-5">
                    Premium Membership
                  </span>
                </div>
                <span className="font-semibold rounded-full bg-[#ff2056] text-rose-50 text-[10px] px-2.5 py-0.5">
                  PRO
                </span>
              </button>
              <div className="bg-zinc-200 mx-3 h-px" />
              <button className="rounded-2xl flex p-3 justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-[oklch(0.94_0.04_240)] rounded-xl text-zinc-700 flex justify-center items-center">
                    <Download className="size-5" />
                  </div>
                  <span className="font-medium text-zinc-900 text-sm leading-5">
                    Export Journal
                  </span>
                </div>
                <ChevronRight className="size-5 text-zinc-400" />
              </button>
            </Card>
          </div>
          <div className="flex px-6 pt-8 justify-center">
            <button className="font-semibold text-[#ff2056] text-sm leading-5 flex items-center gap-2">
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </div>
        <div className="fixed max-w-[402px] backdrop-blur-xl bg-white/80 border-zinc-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid inset-x-0 bottom-0 mx-auto px-6 pt-3 pb-6 w-full">
          <div className="flex justify-around items-center">
            <button className="text-zinc-400 flex flex-col items-center gap-1">
              <BookOpen className="size-5" />
              <span className="font-medium text-[11px]">Today</span>
            </button>
            <button className="text-zinc-400 flex flex-col items-center gap-1">
              <Moon className="size-5" />
              <span className="font-medium text-[11px]">Reflect</span>
            </button>
            <button className="text-zinc-400 flex flex-col items-center gap-1">
              <BarChart3 className="size-5" />
              <span className="font-medium text-[11px]">Insights</span>
            </button>
            <button className="rounded-2xl bg-[#ff2056]/15 text-[#ff2056] flex px-4 py-1.5 flex-col items-center gap-1">
              <User className="size-5" />
              <span className="font-semibold text-[11px]">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
