import React from "react";
import { Delete } from "lucide-react";

interface KeypadProps {
  onKeyPress: (v: string) => void;
  onAction: (act: "AC" | "backspace" | "evaluate" | "toggleRad" | "toggleShift" | "memorySave" | "memoryClear" | "memoryPlus" | "memoryMinus") => void;
  mode: "basic" | "sci";
  isShift: boolean;
}

export default function Keypad({ onKeyPress, onAction, mode, isShift }: KeypadProps) {
  // Scientific keys list
  // Each key can trigger raw expression insertions or calculations
  const sciKeys = [
    { label: isShift ? "sin⁻¹" : "sin", value: isShift ? "asin(" : "sin(" },
    { label: isShift ? "cos⁻¹" : "cos", value: isShift ? "acos(" : "cos(" },
    { label: isShift ? "tan⁻¹" : "tan", value: isShift ? "atan(" : "tan(" },
    { label: "^", value: "^" },
    { label: "√", value: "sqrt(" },
    { label: "ln", value: "ln(" },
    { label: "log", value: "log(" },
    { label: "abs", value: "abs(" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "π", value: "pi" },
    { label: "e", value: "e" },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Sci Memory and Auxiliary Quick Rails (Only visible on Scientific and Basic controls) */}
      <div className="flex gap-2 w-full overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => onAction("toggleShift")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
            isShift
              ? "bg-[#00d9ff]/20 border-[#00d9ff] text-[#00d9ff] shadow-[0_0_8px_rgba(0,217,255,0.25)]"
              : "bg-white/5 border-white/5 text-zinc-400 hover:text-[#00d9ff]"
          }`}
        >
          Shift
        </button>
        <button
          onClick={() => onAction("memorySave")}
          className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/5 text-zinc-400 hover:text-[#00d9ff] hover:border-[#00d9ff]/20 active:scale-95 transition-all"
        >
          MS
        </button>
        <button
          onClick={() => onAction("memoryClear")}
          className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/5 text-zinc-400 hover:text-[#00d9ff] hover:border-[#00d9ff]/20 active:scale-95 transition-all"
        >
          MC
        </button>
        <button
          onClick={() => onAction("memoryPlus")}
          className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/5 text-zinc-400 hover:text-[#00d9ff] hover:border-[#00d9ff]/20 active:scale-95 transition-all"
        >
          M+
        </button>
        <button
          onClick={() => onAction("memoryMinus")}
          className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/5 text-zinc-400 hover:text-[#00d9ff] hover:border-[#00d9ff]/20 active:scale-95 transition-all"
        >
          M-
        </button>
      </div>

      <div className="w-full flex gap-3 md:gap-4">
        {/* Left Side: Scientific functions column (expanded selectively in Sci Mode) */}
        {mode === "sci" && (
          <div className="grid grid-cols-2 gap-2.5 w-1/3 min-w-[120px]">
            {sciKeys.map((key) => (
              <button
                key={key.label}
                onClick={() => onKeyPress(key.value)}
                className="key-neumorphic rounded-xl flex items-center justify-center py-3.5 text-[#00d9ff]/90 font-mono text-[13px] hover:bg-[#00d9ff]/10 border border-transparent hover:border-[#00d9ff]/20 transition-all select-none cursor-pointer"
              >
                {key.label}
              </button>
            ))}
          </div>
        )}

        {/* Right Side / Primary Numeric & Operator Keypad */}
        <div className={`grid grid-cols-4 gap-2.5 md:gap-3 flex-1`}>
          {/* Row 1: Functional and Operational Overlays */}
          <button
            onClick={() => onAction("AC")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-red-400 font-sans font-semibold text-lg hover:bg-red-500/15 active:scale-95 border border-transparent hover:border-red-400/20 select-none cursor-pointer"
          >
            AC
          </button>
          <button
            onClick={() => onAction("backspace")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-amber-400 hover:bg-amber-400/10 active:scale-95 border border-transparent hover:border-amber-400/20 transition-all select-none cursor-pointer"
          >
            <Delete size={20} />
          </button>
          <button
            onClick={() => onKeyPress("%")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-300 font-sans font-medium text-lg hover:bg-white/5 active:scale-95 select-none cursor-pointer"
          >
            %
          </button>
          <button
            onClick={() => onKeyPress("/")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-[#00d9ff] font-sans font-medium text-lg border border-[#00d9ff]/15 hover:border-[#00d9ff]/30 shadow-[0_0_10px_rgba(0,217,255,0.08)] active:scale-95 select-none cursor-pointer"
          >
            /
          </button>

          {/* Row 2: 7-9 & Operator */}
          <button
            onClick={() => onKeyPress("7")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            7
          </button>
          <button
            onClick={() => onKeyPress("8")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            8
          </button>
          <button
            onClick={() => onKeyPress("9")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            9
          </button>
          <button
            onClick={() => onKeyPress("*")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-[#00d9ff] font-sans font-medium text-lg border border-[#00d9ff]/15 hover:border-[#00d9ff]/30 shadow-[0_0_10px_rgba(0,217,255,0.08)] active:scale-95 select-none cursor-pointer"
          >
            ×
          </button>

          {/* Row 3: 4-6 & Operator */}
          <button
            onClick={() => onKeyPress("4")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            4
          </button>
          <button
            onClick={() => onKeyPress("5")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            5
          </button>
          <button
            onClick={() => onKeyPress("6")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            6
          </button>
          <button
            onClick={() => onKeyPress("-")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-[#00d9ff] font-sans font-medium text-lg border border-[#00d9ff]/15 hover:border-[#00d9ff]/30 shadow-[0_0_10px_rgba(0,217,255,0.08)] active:scale-95 select-none cursor-pointer"
          >
            −
          </button>

          {/* Row 4: 1-3 & Operator */}
          <button
            onClick={() => onKeyPress("1")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            1
          </button>
          <button
            onClick={() => onKeyPress("2")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            2
          </button>
          <button
            onClick={() => onKeyPress("3")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            3
          </button>
          <button
            onClick={() => onKeyPress("+")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-[#00d9ff] font-sans font-medium text-lg border border-[#00d9ff]/15 hover:border-[#00d9ff]/30 shadow-[0_0_10px_rgba(0,217,255,0.08)] active:scale-95 select-none cursor-pointer"
          >
            +
          </button>

          {/* Row 5: 0, Dot, Equals */}
          <button
            onClick={() => onKeyPress("0")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            0
          </button>
          <button
            onClick={() => onKeyPress(".")}
            className="key-neumorphic rounded-2xl flex items-center justify-center p-4 text-zinc-100 font-sans text-xl hover:bg-white/5 active:scale-95 transition-colors select-none cursor-pointer"
          >
            .
          </button>
          <button
            onClick={() => onAction("evaluate")}
            className="col-span-2 rounded-2xl flex items-center justify-center p-4 bg-[#00d9ff] border border-[#00d9ff] text-[#020408] font-sans font-bold text-xl shadow-[0_0_20px_rgba(0,217,255,0.35)] hover:bg-[#00d9ff]/90 active:scale-95 transition-all select-none cursor-pointer"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
