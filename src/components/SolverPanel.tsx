import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { SolverResult } from "../types";
import { Sparkles, Brain, Cpu, Send, FileCode, Play, HelpCircle, Loader2 } from "lucide-react";

interface SolverPanelProps {
  onImportToGraph: (equation: string) => void;
  calculatorExpression?: string;
}

const QUICK_TEMPLATES = [
  {
    icon: "🚀",
    title: "Kinematics",
    problem: "Solve for the maximum height and general landing range of a projectile fired at initial velocity v0 = 24 m/s at an angle of 35 degrees under standard gravity (9.81 m/s^2).",
  },
  {
    icon: "⚡",
    title: "Resistor Network",
    problem: "Calculate the output voltage (V_out) and current for a simple resistive voltage divider supplied with V_in = 15V, where R1 = 4.7k ohms, and R2 = 10k ohms.",
  },
  {
    icon: "📐",
    title: "Quadratic Roots",
    problem: "Find the roots (real or complex) of the second-order polynomial equation: 4*x^2 - 16*x + 11 = 0",
  },
];

const LOADING_STEPS = [
  "Formulating coordinates and physical equations...",
  "Consulting Nexus knowledge base...",
  "Running analytical matrix evaluations...",
  "Rendering final solution and graph patterns...",
];

export default function SolverPanel({ onImportToGraph, calculatorExpression = "" }: SolverPanelProps) {
  const [problemText, setProblemText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  const startLoaderProgression = () => {
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= LOADING_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return interval;
  };

  const handleSolve = async (textToSolve = problemText, explainMode = false) => {
    const activeText = textToSolve.trim();
    if (!activeText) return;

    setLoading(true);
    setErrorHeader(null);
    setResult(null);
    const loaderInterval = startLoaderProgression();

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem: activeText,
          mode: explainMode ? "explain" : "solve",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nexus Server failed to retrieve an AI answer.");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorHeader(err.message || "Failed to communicate with Nexus AI solver.");
    } finally {
      clearInterval(loaderInterval);
      setLoading(false);
    }
  };

  const selectTemplate = (problem: string) => {
    setProblemText(problem);
    setErrorHeader(null);
  };

  const handleSolveCalculatorExpr = () => {
    if (calculatorExpression.trim()) {
      setProblemText(`Solve or evaluate this scientific formula: ${calculatorExpression}`);
      handleSolve(`Solve or evaluate this scientific formula: ${calculatorExpression}`, true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Description Panel header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2.5 bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/20 rounded-xl shadow-[0_0_10px_rgba(0,217,255,0.1)]">
          <Brain size={20} className="text-[#00d9ff]" />
        </div>
        <div>
          <h2 className="font-sans font-semibold text-lg text-zinc-100">Nexus AI Solver & Assistant</h2>
          <p className="font-mono text-[11px] text-zinc-500">
            Compute multi-step physical, chemical, or algebraic formulas powered by Gemini 3.5 Flash.
          </p>
        </div>
      </div>

      {calculatorExpression.trim() && (
        <div className="p-3 bg-[#00d9ff]/5 border border-[#00d9ff]/25 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#00d9ff] animate-pulse" />
            <span className="font-mono text-xs text-zinc-400">
              Active Math Input detected: <strong className="text-white font-mono">{calculatorExpression}</strong>
            </span>
          </div>
          <button
            onClick={handleSolveCalculatorExpr}
            className="px-3 py-1 bg-[#00d9ff]/10 border border-[#00d9ff]/30 hover:border-[#00d9ff]/50 hover:bg-[#00d9ff]/20 text-[#00d9ff] text-[11px] font-semibold font-mono rounded-lg transition-all cursor-pointer"
          >
            Explain Expr ✦
          </button>
        </div>
      )}

      {/* Inputs box */}
      <div className="flex flex-col gap-3">
        <textarea
          id="solver-input"
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          rows={3}
          className="w-full bg-black/40 border border-white/5 focus:border-[#00d9ff]/30 focus:outline-none p-4 rounded-2xl text-sm font-mono tracking-tight text-white placeholder:text-zinc-600 select-all transition-all"
          placeholder="E.g., Find the force required to accelerate a 1500kg vehicle at 3.5 m/s^2..."
        />
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={() => handleSolve(problemText, true)}
            disabled={loading || !problemText.trim()}
            className="px-4 py-2.5 text-xs font-mono font-semibold border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white hover:bg-white/5 active:scale-95 disabled:opacity-40 rounded-xl transition-all cursor-pointer"
          >
            Core Insight ✦
          </button>
          <button
            onClick={() => handleSolve(problemText, false)}
            disabled={loading || !problemText.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs text-black font-semibold bg-[#00d9ff] hover:bg-[#00d9ff]/90 rounded-xl shadow-[0_0_15px_rgba(0,217,255,0.25)] active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Consult Nexus AI</span>
          </button>
        </div>
      </div>

      {/* Presets/Templates */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Rapid Analytical Templates</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {QUICK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.title}
              onClick={() => selectTemplate(tpl.problem)}
              className="p-3 text-left bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-2xl hover:border-[#00d9ff]/20 hover:bg-white/5 transition-all shrink-0 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm select-none">{tpl.icon}</span>
                <span className="font-sans font-semibold text-xs text-zinc-300">{tpl.title}</span>
              </div>
              <p className="font-mono text-[10px] text-zinc-500 line-clamp-2">
                {tpl.problem}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Block Screen */}
      {loading && (
        <div className="p-8 text-center bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-3xl animate-pulse flex flex-col items-center justify-center gap-4">
          <Loader2 size={32} className="text-[#00d9ff] animate-spin" />
          <div className="flex flex-col gap-1">
            <span className="font-sans font-semibold text-sm text-zinc-200">Nexus Computations in Progress</span>
            <span className="font-mono text-[11px] text-[#00d9ff] drop-shadow-[0_0_8px_rgba(0,217,255,0.2)]">
              {LOADING_STEPS[loadingStep]}
            </span>
          </div>
        </div>
      )}

      {/* Failure HUD */}
      {errorHeader && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs rounded-2xl flex flex-col gap-1 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
          <span className="font-bold">⚠️ Nexus Solver Offline / Critical Alert:</span>
          <span>{errorHeader}</span>
        </div>
      )}

      {/* Execution Results Display */}
      {result && (
        <div className="flex flex-col gap-5 p-5 bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-3xl shadow-xl">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-white/5 pb-4">
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Final Result</span>
              <span id="final-result-card" className="font-sans font-semibold text-lg text-[#00d9ff] drop-shadow-[0_0_10px_rgba(0,217,255,0.15)] bg-[#00d9ff]/5 border border-[#00d9ff]/20 px-3 py-1.5 rounded-lg inline-block">
                {result.calculatedAnswer || "Calculated algebraically."}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Applied Scientific Formulas</span>
              <span className="font-mono text-xs text-zinc-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg inline-block truncate max-w-full">
                {result.formulaUsed || "Standard laws of mathematical physics."}
              </span>
            </div>
          </div>

          {/* Graphable Exporters link (Highly interactive) */}
          {result.graphableEqus && result.graphableEqus.length > 0 && (
            <div className="flex flex-col gap-2 bg-[#00d9ff]/5 border border-[#00d9ff]/20 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <FileCode size={14} className="text-[#00d9ff]" />
                <span className="font-sans text-xs font-semibold text-zinc-300">Graph Plotter Ready</span>
              </div>
              <p className="font-mono text-[10px] text-zinc-400">
                This solver resolved a graphable coordinate formula: <code className="text-[#00d9ff] font-semibold font-mono">{result.graphableEqus[0]}</code>
              </p>
              <button
                onClick={() => onImportToGraph(result.graphableEqus[0])}
                className="flex items-center gap-1 w-fit mt-1.5 px-3 py-1.5 bg-[#00d9ff]/10 text-[#00d9ff] text-[11px] font-semibold rounded-lg hover:bg-[#00d9ff]/20 active:scale-95 transition-all text-left cursor-pointer border border-[#00d9ff]/20"
              >
                <Play size={10} className="fill-current" />
                <span>Inject directly into Graphing Tab</span>
              </button>
            </div>
          )}

          {/* Core Markdown Breakdown */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">Step-by-Step Resolution Analysis</span>
            <div className="prose prose-invert max-w-none text-xs font-mono text-zinc-400 leading-relaxed space-y-3 bg-black/20 p-4 border border-white/5 rounded-2xl">
              <ReactMarkdown>{result.explanation}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
