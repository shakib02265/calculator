import React, { useState } from "react";
import DisplayHUD from "./components/DisplayHUD";
import Keypad from "./components/Keypad";
import GraphingCanvas from "./components/GraphingCanvas";
import SolverPanel from "./components/SolverPanel";
import ConstantsReference from "./components/ConstantsReference";
import { evaluateExpression } from "./utils/mathEvaluator";
import { ActiveTab, CalculatorState } from "./types";
import { 
  Calculator, 
  Menu, 
  Settings, 
  Binary, 
  Spline, 
  BrainCircuit, 
  Library, 
  ChevronRight, 
  Trash2,
  Cpu
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("basic");
  
  // Custom formula states
  const [state, setState] = useState<CalculatorState>({
    expression: "",
    result: "0.0",
    history: JSON.parse(localStorage.getItem("nexus_history") || "[]"),
    isRad: false, // Default to DEG mode as common
    memory: parseFloat(localStorage.getItem("nexus_memory") || "0"),
    isShift: false,
  });

  // Track the imported graph equation from AI solver
  const [importedGraphEqu, setImportedGraphEqu] = useState("sin(x)");

  // Local helper: update configuration state smoothly
  const updateState = (update: Partial<CalculatorState>) => {
    setState((prev) => {
      const next = { ...prev, ...update };
      if (update.history !== undefined) {
        localStorage.setItem("nexus_history", JSON.stringify(next.history));
      }
      if (update.memory !== undefined) {
        localStorage.setItem("nexus_memory", next.memory.toString());
      }
      return next;
    });
  };

  const handleKeyPress = (value: string) => {
    updateState({ expression: state.expression + value });
  };

  const handleAction = (
    action: "AC" | "backspace" | "evaluate" | "toggleRad" | "toggleShift" | "memorySave" | "memoryClear" | "memoryPlus" | "memoryMinus"
  ) => {
    switch (action) {
      case "AC":
        updateState({ expression: "", result: "0.0" });
        break;

      case "backspace": {
        const expr = state.expression;
        if (!expr) break;

        // Smart deletion of multi-character functions for professional feel
        const multiTokens = [
          "asin(", "acos(", "atan(", "arcsin(", "arccos(", "arctan(",
          "sin(", "cos(", "tan(", "sqrt(", "log(", "ln(", "abs(", "pi", "e"
        ];
        
        let tokenDeleted = false;
        for (const tk of multiTokens) {
          if (expr.endsWith(tk)) {
            updateState({ expression: expr.substring(0, expr.length - tk.length) });
            tokenDeleted = true;
            break;
          }
        }

        if (!tokenDeleted) {
          updateState({ expression: expr.substring(0, expr.length - 1) });
        }
        break;
      }

      case "evaluate": {
        const expr = state.expression.trim();
        if (!expr) {
          updateState({ result: "0.0" });
          break;
        }

        try {
          const evalRes = evaluateExpression(expr, {}, state.isRad);
          
          let formattedRes: string;
          if (isNaN(evalRes)) {
            formattedRes = "Undefined Value";
          } else if (!isFinite(evalRes)) {
            formattedRes = "Infinity";
          } else {
            // Precision checks
            if (Math.abs(evalRes) < 0.000001 && evalRes !== 0) {
              formattedRes = evalRes.toExponential(6);
            } else {
              formattedRes = Number(evalRes.toFixed(8)).toString(); // trim trailing decimals safely
            }
          }

          // Persist to local history array
          const nextHist = [expr + " = " + formattedRes, ...state.history].slice(0, 15);
          updateState({ result: formattedRes, history: nextHist });
        } catch (error: any) {
          updateState({ result: error.message || "Domain Error" });
        }
        break;
      }

      case "toggleRad":
        updateState({ isRad: !state.isRad });
        break;

      case "toggleShift":
        updateState({ isShift: !state.isShift });
        break;

      case "memorySave": {
        const val = parseFloat(state.result);
        if (!isNaN(val)) {
          updateState({ memory: val });
        }
        break;
      }

      case "memoryClear":
        updateState({ memory: 0 });
        break;

      case "memoryPlus": {
        const val = parseFloat(state.result);
        if (!isNaN(val)) {
          updateState({ memory: state.memory + val });
        }
        break;
      }

      case "memoryMinus": {
        const val = parseFloat(state.result);
        if (!isNaN(val)) {
          updateState({ memory: state.memory - val });
        }
        break;
      }
    }
  };

  // Switch tabs and load plotted curves instantly
  const handleImportToGraph = (equation: string) => {
    setImportedGraphEqu(equation);
    setActiveTab("graph");
  };

  const clearHistory = () => {
    updateState({ history: [] });
  };

  return (
    <div className="immersive-gradient text-on-surface flex flex-col min-h-screen relative overflow-x-hidden font-sans select-none">
      {/* Immersive space atmosphere and celestial background glow */}
      <div className="atmosphere"></div>

      {/* Primary Immersive Top Header */}
      <header className="fixed top-0 z-50 flex justify-between items-end px-6 h-20 w-full bg-black/40 backdrop-blur-md border-b border-white/5 shadow-2xl pb-4">
        <div className="flex items-center gap-3">
          <Binary className="text-[#00d9ff] uppercase animate-pulse" size={22} />
          <h1 className="logo font-sans font-extrabold text-lg md:text-xl tracking-[4px] text-[#00d9ff] drop-shadow-[0_0_12px_rgba(0,217,255,0.4)]">
            NEXUS-9
          </h1>
        </div>
        
        {/* System & calculation telemetry data widget mirroring vessel stats */}
        <div className="system-status flex gap-6 z-10">
          <div className="status-item hidden md:block">
            <div className="status-label text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Core State</div>
            <div className="status-value text-xs text-emerald-400 font-mono font-medium">98.4% NOMINAL</div>
          </div>
          <div className="status-item">
            <div className="status-label text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Compute Sync</div>
            <div className="status-value text-xs text-[#00d9ff] font-mono">00:42:12:09</div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-28 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start z-10">
        {/* Left Side: Dynamic Calculator / Selected Mode View Panel */}
        <div className={`col-span-1 ${(activeTab === "basic" || activeTab === "sci") ? "lg:col-span-7" : "lg:col-span-12"} flex flex-col gap-6 w-full max-w-xl mx-auto lg:max-w-none`}>
          {/* Display Instrument Overlay - Shared for calculation actions */}
          {(activeTab === "basic" || activeTab === "sci") && (
            <DisplayHUD
              expression={state.expression}
              result={state.result}
              isRad={state.isRad}
              onToggleRad={() => handleAction("toggleRad")}
              isShift={state.isShift}
              onToggleShift={() => handleAction("toggleShift")}
              memory={state.memory}
            />
          )}

          {/* Keypad Grid (For calculator controls) */}
          {(activeTab === "basic" || activeTab === "sci") && (
            <Keypad
              onKeyPress={handleKeyPress}
              onAction={handleAction}
              mode={activeTab}
              isShift={state.isShift}
            />
          )}

          {/* Graphing viewport container */}
          {activeTab === "graph" && (
            <div className="bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-3xl p-6 shadow-xl relative backdrop-blur-md">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                <div className="p-2.5 bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/20 rounded-xl shadow-[0_0_10px_rgba(0,217,255,0.1)]">
                  <Spline size={20} className="text-[#00d9ff]" />
                </div>
                <div>
                  <h2 className="font-sans font-semibold text-lg text-zinc-100 font-sans">Precision Cartesian Plotter</h2>
                  <p className="font-mono text-[11px] text-zinc-500">
                    Map linear models, physical waves, and coordinate calculations onto a reactive math canvas.
                  </p>
                </div>
              </div>
              <GraphingCanvas initialEquation={importedGraphEqu} />
            </div>
          )}

          {/* Scientific Constants directory view */}
          {activeTab === "constants" && (
            <div className="bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-3xl p-6 shadow-xl relative backdrop-blur-md">
              <ConstantsReference onInsertConstant={(constantVal) => updateState({ expression: state.expression + constantVal })} />
            </div>
          )}

          {/* AI Engineering Solver Frame */}
          {activeTab === "solver" && (
            <div className="bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-3xl p-6 shadow-xl relative backdrop-blur-md">
              <SolverPanel 
                onImportToGraph={handleImportToGraph} 
                calculatorExpression={state.expression} 
              />
            </div>
          )}
        </div>

        {/* Right Side Sidebar columns (Shown adjacent ONLY on Calculator layout views for Desktop HUD layout) */}
        {(activeTab === "basic" || activeTab === "sci") && (
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-6 w-full max-w-xl mx-auto lg:max-w-none">
            {/* Real-time Calculation Log Sidebar */}
            <section className="w-full bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-[#00d9ff] animate-pulse" />
                  <span className="font-mono text-xs uppercase text-zinc-300">Telemetry History Logs</span>
                </div>
                {state.history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-rose-400 transition"
                    title="Clear history logs"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {state.history.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center gap-2 select-none">
                  <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider">Empty Registry</span>
                  <span className="font-mono text-[10px] text-zinc-700 leading-relaxed max-w-[200px]">
                    Evaluated mathematical outputs will populate here.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[190px] overflow-y-auto scrollbar-none pr-1">
                  {state.history.map((hist, idx) => {
                    const parts = hist.split(" = ");
                    return (
                      <button
                        key={idx}
                        onClick={() => updateState({ expression: parts[0] || "", result: parts[1] || "0.0" })}
                        className="p-2.5 bg-[rgba(255,255,255,0.01)] border border-white/5 hover:border-[#00d9ff]/20 hover:bg-white/5 rounded-xl text-left transition font-mono text-[11px] group flex justify-between items-center gap-2 select-none cursor-pointer"
                      >
                        <span className="text-zinc-400 group-hover:text-white truncate">
                          {parts[0]}
                        </span>
                        <span className="text-[#00d9ff] font-semibold shrink-0 group-hover:drop-shadow-[0_0_4px_rgba(0,217,255,0.4)]">
                          = {parts[1]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Quick reference sidebar tool widget */}
            <section className="w-full bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col gap-3 font-mono">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-1">
                <Cpu size={14} className="text-[#00d9ff]" />
                <span className="font-sans text-xs uppercase text-zinc-300">Engineering Quick Rail</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Connect the calculations of active expression logic directly with the AI Solver to interpret algebraic formulas or evaluate physical models.
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => handleKeyPress("pi")}
                  className="p-2 bg-black/40 hover:bg-white/5 border border-white/5 rounded-xl hover:border-[#00d9ff]/30 text-center text-xs text-[#00d9ff] transition cursor-pointer font-bold"
                >
                  Insert π (pi)
                </button>
                <button
                  onClick={() => handleKeyPress("e")}
                  className="p-2 bg-black/40 hover:bg-white/5 border border-white/5 rounded-xl hover:border-[#00d9ff]/30 text-center text-xs text-[#00d9ff] transition cursor-pointer font-bold"
                >
                  Insert e
                </button>
                <button
                  onClick={() => setActiveTab("constants")}
                  className="p-2 bg-black/40 hover:bg-white/5 border border-white/5 rounded-xl hover:border-[#00d9ff]/30 text-center text-[11px] text-zinc-400 hover:text-white transition cursor-pointer col-span-2"
                >
                  Open Constants Reference →
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Console Dock */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md mx-auto z-50 flex justify-around items-center p-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Basic Tab */}
        <button
          onClick={() => setActiveTab("basic")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-full transition-all duration-300 active:scale-90 cursor-pointer ${
            activeTab === "basic"
              ? "bg-[#00d9ff]/15 text-[#00d9ff] ring-1 ring-[#00d9ff]/40 shadow-[0_0_15px_rgba(0,217,255,0.25)] font-semibold"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calculator className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-mono font-medium tracking-tight uppercase">Basic</span>
        </button>

        {/* Scientific Sci Tab */}
        <button
          onClick={() => setActiveTab("sci")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-full transition-all duration-300 active:scale-90 cursor-pointer ${
            activeTab === "sci"
              ? "bg-[#00d9ff]/15 text-[#00d9ff] ring-1 ring-[#00d9ff]/40 shadow-[0_0_15px_rgba(0,217,255,0.25)] font-semibold"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Binary className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-mono font-medium tracking-tight uppercase">Sci</span>
        </button>

        {/* Grapher Tab */}
        <button
          onClick={() => setActiveTab("graph")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-full transition-all duration-300 active:scale-90 cursor-pointer ${
            activeTab === "graph"
              ? "bg-[#00d9ff]/15 text-[#00d9ff] ring-1 ring-[#00d9ff]/40 shadow-[0_0_15px_rgba(0,217,255,0.25)] font-semibold"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Spline className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-mono font-medium tracking-tight uppercase">Graph</span>
        </button>

        {/* AI Solver Tab */}
        <button
          onClick={() => setActiveTab("solver")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-full transition-all duration-300 active:scale-90 cursor-pointer ${
            activeTab === "solver"
              ? "bg-[#00d9ff]/15 text-[#00d9ff] ring-1 ring-[#00d9ff]/40 shadow-[0_0_15px_rgba(0,217,255,0.25)] font-semibold"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <BrainCircuit className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-mono font-medium tracking-tight uppercase">Solver</span>
        </button>

        {/* Physical constants Tab */}
        <button
          onClick={() => setActiveTab("constants")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-full transition-all duration-300 active:scale-90 cursor-pointer ${
            activeTab === "constants"
              ? "bg-[#00d9ff]/15 text-[#00d9ff] ring-1 ring-[#00d9ff]/40 shadow-[0_0_15px_rgba(0,217,255,0.25)] font-semibold"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Library className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-mono font-medium tracking-tight uppercase">Const</span>
        </button>
      </nav>
    </div>
  );
}
