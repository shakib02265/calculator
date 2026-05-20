import React from "react";

interface DisplayHUDProps {
  expression: string;
  result: string;
  isRad: boolean;
  onToggleRad: () => void;
  isShift: boolean;
  onToggleShift: () => void;
  memory: number;
}

export default function DisplayHUD({
  expression,
  result,
  isRad,
  onToggleRad,
  isShift,
  onToggleShift,
  memory,
}: DisplayHUDProps) {
  return (
    <section className="w-full relative glass-panel rounded-3xl overflow-hidden p-6 flex flex-col justify-end min-h-[200px] shadow-2xl transition-all duration-300 border border-white/10">
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,217,240,0.012)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
      
      {/* Dynamic Status / Context Indicators */}
      <div className="absolute top-4 left-6 right-6 flex justify-between items-center z-20">
        <div className="flex gap-2">
          {/* Shift State Badge */}
          <button
            onClick={onToggleShift}
            className={`font-mono text-[10px] tracking-widest px-2.5 py-1 rounded transition-all duration-200 uppercase cursor-pointer ${
              isShift
                ? "bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/40 shadow-[0_0_8px_rgba(0,217,255,0.4)]"
                : "bg-white/5 text-zinc-400 border border-transparent hover:bg-white/10"
            }`}
          >
            SHIFT
          </button>
          {/* Memory Registry Badge */}
          {memory !== 0 && (
            <span className="font-mono text-[10px] tracking-widest px-2.5 py-1 rounded bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/20 shadow-[0_0_6px_rgba(0,217,255,0.1)]">
              M ({memory.toLocaleString(undefined, { maximumFractionDigits: 3 })})
            </span>
          )}
        </div>

        {/* DEG / RAD toggles */}
        <div className="flex gap-1 bg-black/40 border border-white/5 p-1 rounded-lg">
          <button
            onClick={() => { if (isRad) onToggleRad(); }}
            className={`font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
              !isRad
                ? "text-[#00d9ff] border border-[#00d9ff]/30 bg-[#00d9ff]/10 font-bold shadow-[0_0_6px_rgba(0,217,255,0.25)]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            DEG
          </button>
          <button
            onClick={() => { if (!isRad) onToggleRad(); }}
            className={`font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
              isRad
                ? "text-[#00d9ff] border border-[#00d9ff]/30 bg-[#00d9ff]/10 font-bold shadow-[0_0_6px_rgba(0,217,255,0.25)]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            RAD
          </button>
        </div>
      </div>

      {/* Formula Expression Area */}
      <div className="mb-3 text-right overflow-x-auto whitespace-nowrap scrollbar-none py-1 flex items-center justify-end">
        <span 
          className="font-mono text-xl md:text-2xl text-zinc-300 tracking-tight"
          id="expression-display"
        >
          {expression || "0"}
        </span>
        {/* Blinking glowing futuristic insert cursor */}
        <span className="w-1.5 md:w-2 h-6 bg-[#00d9ff] inline-block align-middle ml-1.5 animate-pulse shadow-[0_0_8px_rgba(0,217,255,0.8)] opacity-90 rounded-sm"></span>
      </div>

      {/* Unified Calculation Value Panel */}
      <div className="text-right overflow-x-auto select-all scrollbar-none z-20">
        <span 
          className="font-sans text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#00d9ff] drop-shadow-[0_0_12px_rgba(0,217,255,0.55)]"
          id="calculation-result"
        >
          {result}
        </span>
      </div>
    </section>
  );
}
