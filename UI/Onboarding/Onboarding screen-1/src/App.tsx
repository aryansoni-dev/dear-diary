import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative bg-[linear-gradient(to_bottom,#FFDDE8_0%,#FAF7F2_55%,#FAF7F2_100%)] flex px-8 pt-14 pb-10 flex-col w-100.5 h-218.5">
          <div className="flex mb-8 justify-center items-center gap-2">
            <span className="rounded-full bg-[#ff2056] w-6 h-2" />
            <span className="rounded-full bg-[#ff2056]/20 w-2 h-2" />
            <span className="rounded-full bg-[#ff2056]/20 w-2 h-2" />
            <span className="rounded-full bg-[#ff2056]/20 w-2 h-2" />
            <span className="rounded-full bg-[#ff2056]/20 w-2 h-2" />
          </div>
          <div className="flex flex-col justify-center items-center flex-1">
            <div className="relative flex mb-10 justify-center items-center">
              <div className="size-72 bg-[radial-gradient(circle,#FFDDE8_0%,#F4EFFA_45%,transparent_72%)] blur-xl rounded-full absolute" />
              <div className="relative size-64 shadow-[0_20px_60px_-15px_rgba(255,32,86,0.25)] ring-8 ring-white/60 rounded-[40px] overflow-hidden">
                <img
                  alt="Person sitting peacefully journaling"
                  className="object-cover w-full h-full"
                  data-authorname="Jasmin Chew"
                  data-authorurl="https://unsplash.com/@majestical_jasmin"
                  data-blurhash="LYKnuQR*t7o0_Nj[RjWWD%WBofoe"
                  data-photoid="YMP0JIvL3DQ"
                  src="https://images.unsplash.com/photo-1614899452830-028d1b273773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBzaXR0aW5nJTIwcGVhY2VmdWxseSUyMHJlbGF4aW5nJTIwcGFzdGVsJTIwY2FsbXxlbnwxfDF8fHwxNzgwNDI4MDUxfDA&ixlib=rb-4.1.0&q=80&w=400"
                />
              </div>
            </div>
            <h1 className="leading-tight font-bold text-center text-zinc-950 text-[32px] tracking-tight">
              Your space to reflect. 🌸
            </h1>
            <p className="leading-relaxed max-w-[280px] text-center text-zinc-500 text-[17px] mt-3">
              Reflect, understand, and grow.
            </p>
          </div>
          <div className="flex pt-6 flex-col items-center gap-4">
            <Button className="shadow-[0_12px_30px_-8px_rgba(255,32,86,0.5)] font-bold rounded-full bg-[#ff2056] text-rose-50 text-base leading-6 w-full h-14">
              Get Started
            </Button>
            <button className="font-medium text-zinc-400 text-sm leading-5">
              I already have an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
