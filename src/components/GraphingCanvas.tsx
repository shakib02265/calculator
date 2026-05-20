import React, { useState, useEffect, useRef } from "react";
import { evaluateExpression } from "../utils/mathEvaluator";
import { GraphPreset } from "../types";
import { ZoomIn, ZoomOut, RotateCcw, Activity, HelpCircle, AlertCircle, Plus } from "lucide-react";

interface GraphingCanvasProps {
  initialEquation?: string;
}

const PRESETS: GraphPreset[] = [
  {
    id: "sine",
    name: "Sine Wave",
    equation: "sin(x)",
    description: "Basic harmonic physical oscillator.",
    color: "#00d9ff",
    minX: -10,
    maxX: 10,
  },
  {
    id: "sigmoid",
    name: "Sigmoid Function",
    equation: "1 / (1 + e^(-x))",
    description: "S-curve for machine learning activation models.",
    color: "#a5b4fc",
    minX: -6,
    maxX: 6,
  },
  {
    id: "damped",
    name: "Damped Oscillation",
    equation: "exp(-0.15*x) * sin(2*x)",
    description: "Decaying spring mass physical system.",
    color: "#34d399",
    minX: 0,
    maxX: 15,
  },
  {
    id: "quadratic",
    name: "Parabolic Trajectory",
    equation: "0.2 * x^2 - 2 * x + 3",
    description: "Ballistic trajectory coordinate plotting.",
    color: "#fbbf24",
    minX: -5,
    maxX: 15,
  },
];

export default function GraphingCanvas({ initialEquation = "sin(x)" }: GraphingCanvasProps) {
  const [equationInput, setEquationInput] = useState(initialEquation);
  const [activeEquation, setActiveEquation] = useState(initialEquation);
  const [plotColor, setPlotColor] = useState("#00d9ff");
  
  // Graph domain state
  const [rangeX, setRangeX] = useState({ min: -10, max: 10 });
  const [rangeY, setRangeY] = useState({ min: -6, max: 6 });

  // Hover tracker coordinate state
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; px: number; py: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize incoming formula changes
  useEffect(() => {
    if (initialEquation) {
      setEquationInput(initialEquation);
      setActiveEquation(initialEquation);
    }
  }, [initialEquation]);

  // Handle preset selection
  const handleSelectPreset = (preset: GraphPreset) => {
    setEquationInput(preset.equation);
    setActiveEquation(preset.equation);
    setPlotColor(preset.color);
    setRangeX({ min: preset.minX, max: preset.maxX });
    // Scale Y gracefully based on defaults
    setRangeY({ min: -6, max: 6 });
    setErrorMsg(null);
  };

  // Run customized plotting action
  const handlePlot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!equationInput.trim()) return;
    setActiveEquation(equationInput);
    setErrorMsg(null);
  };

  // Zoom factor mapping
  const handleZoom = (direction: "in" | "out") => {
    const factor = direction === "in" ? 0.7 : 1.4;
    
    const centerX = (rangeX.min + rangeX.max) / 2;
    const centerY = (rangeY.min + rangeY.max) / 2;
    
    const halfSpanX = ((rangeX.max - rangeX.min) * factor) / 2;
    const halfSpanY = ((rangeY.max - rangeY.min) * factor) / 2;

    setRangeX({ min: centerX - halfSpanX, max: centerX + halfSpanX });
    setRangeY({ min: centerY - halfSpanY, max: centerY + halfSpanY });
  };

  const handleReset = () => {
    setRangeX({ min: -10, max: 10 });
    setRangeY({ min: -6, max: 6 });
    setErrorMsg(null);
  };

  // Render mathematical system on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI retina screen configurations
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 400;
    
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    // Coordinate conversion mapping
    const toScreenX = (x: number) => {
      const pct = (x - rangeX.min) / (rangeX.max - rangeX.min);
      return pct * width;
    };

    const toScreenY = (y: number) => {
      const pct = (y - rangeY.min) / (rangeY.max - rangeY.min);
      return height - pct * height; // reverse Y coordinate index
    };

    const toMathX = (px: number) => {
      return rangeX.min + (px / width) * (rangeX.max - rangeX.min);
    };

    const toMathY = (py: number) => {
      const pct = (height - py) / height;
      return rangeY.min + pct * (rangeY.max - rangeY.min);
    };

    // 1. Draw grid layout and tick labels
    ctx.strokeStyle = "rgba(0, 217, 255, 0.04)";
    ctx.lineWidth = 1;

    // Calculate dynamic grids mapping
    const spanX = rangeX.max - rangeX.min;
    let gridStepX = 1;
    if (spanX > 50) gridStepX = 10;
    else if (spanX > 20) gridStepX = 5;
    else if (spanX < 3) gridStepX = 0.2;
    else if (spanX < 8) gridStepX = 0.5;

    const startGridX = Math.floor(rangeX.min / gridStepX) * gridStepX;
    ctx.fillStyle = "rgba(100, 116, 139, 0.7)";
    ctx.font = "10px JetBrains Mono";

    for (let x = startGridX; x <= rangeX.max; x += gridStepX) {
      if (Math.abs(x) < 0.0001) continue; // Axis drawn separately
      const sx = toScreenX(x);
      
      // vertical grid line
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      // text marker
      const axisY = toScreenY(0);
      let textPy = axisY + 12;
      if (textPy > height - 10) textPy = height - 6;
      if (textPy < 15) textPy = 15;
      
      ctx.fillText(x.toFixed(x % 1 === 0 ? 0 : 2), sx - 8, textPy);
    }

    const spanY = rangeY.max - rangeY.min;
    let gridStepY = 1;
    if (spanY > 50) gridStepY = 10;
    else if (spanY > 20) gridStepY = 5;
    else if (spanY < 3) gridStepY = 0.2;
    else if (spanY < 8) gridStepY = 0.5;

    const startGridY = Math.floor(rangeY.min / gridStepY) * gridStepY;
    for (let y = startGridY; y <= rangeY.max; y += gridStepY) {
      if (Math.abs(y) < 0.0001) continue;
      const sy = toScreenY(y);

      // horizontal line
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      // marker text
      const axisX = toScreenX(0);
      let textPx = axisX + 6;
      if (textPx > width - 35) textPx = width - 35;
      if (textPx < 6) textPx = 6;

      ctx.fillText(y.toFixed(y % 1 === 0 ? 0 : 2), textPx, sy + 3);
    }

    // 2. Draw Main Axes lines (y = 0, x = 0)
    ctx.strokeStyle = "rgba(0, 217, 255, 0.18)";
    ctx.lineWidth = 1.6;

    const zeroX = toScreenX(0);
    const zeroY = toScreenY(0);

    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(width, zeroY);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(zeroX, 0);
    ctx.lineTo(zeroX, height);
    ctx.stroke();

    // Axis Origin "0" label
    ctx.fillStyle = "rgba(0, 217, 255, 0.45)";
    ctx.fillText("0", zeroX - 10, zeroY + 12);

    // 3. Draw Plot Equation Line Function
    ctx.strokeStyle = plotColor;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 6;
    ctx.shadowColor = plotColor;

    ctx.beginPath();
    let isDrawing = false;
    let erroredPointsCount = 0;

    for (let px = 0; px <= width; px += 2) {
      const mx = toMathX(px);
      try {
        const my = evaluateExpression(activeEquation, { x: mx }, true);
        
        if (isNaN(my) || !isFinite(my)) {
          isDrawing = false;
          continue;
        }

        const sy = toScreenY(my);

        // Limit drawing bounds to shield canvas spikes
        if (sy >= -height && sy <= height * 2) {
          if (!isDrawing) {
            ctx.moveTo(px, sy);
            isDrawing = true;
          } else {
            ctx.lineTo(px, sy);
          }
        } else {
          isDrawing = false;
        }
      } catch (err) {
        erroredPointsCount++;
        isDrawing = false; // skip curve link
      }
    }
    ctx.stroke();

    // Reset shadow values for future redraws
    ctx.shadowBlur = 0;

    if (erroredPointsCount > width * 0.95 && activeEquation.trim()) {
      setErrorMsg("Syntax error or invalid mathematical coordinate range.");
    } else {
      setErrorMsg(null);
    }
  }, [activeEquation, rangeX, rangeY, plotColor]);

  // Read mouse tracking movements
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const mathX = rangeX.min + (px / rect.width) * (rangeX.max - rangeX.min);
    try {
      const mathY = evaluateExpression(activeEquation, { x: mathX }, true);
      if (!isNaN(mathY) && isFinite(mathY)) {
        const toScreenY = (y: number) => {
          const pct = (y - rangeY.min) / (rangeY.max - rangeY.min);
          return rect.height - pct * rect.height;
        };
        setHoverCoord({
          x: mathX,
          y: mathY,
          px,
          py: toScreenY(mathY),
        });
      } else {
        setHoverCoord(null);
      }
    } catch {
      setHoverCoord(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  return (
    <div className="w-full flex flex-col gap-6" ref={containerRef}>
      {/* Input Plot Form */}
      <form onSubmit={handlePlot} className="flex gap-2.5 items-center w-full">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[#00d9ff] select-none">y =</span>
          <input
            type="text"
            value={equationInput}
            onChange={(e) => setEquationInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[rgba(255,255,255,0.02)] border border-white/5 focus:border-[#00d9ff]/30 rounded-xl focus:outline-none font-mono text-sm tracking-tight text-zinc-100 select-all transition-all"
            placeholder="sin(x) * cos(x/2)"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] font-semibold hover:bg-[#00d9ff]/20 active:scale-95 transition-all text-sm cursor-pointer"
        >
          Plot
        </button>
      </form>

      {/* Preset Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`p-3 rounded-2xl text-left bg-[rgba(255,255,255,0.01)] border hover:border-white/10 transition-all cursor-pointer ${
              activeEquation === preset.equation
                ? "border-[#00d9ff]/40 shadow-[0_0_10px_rgba(0,217,255,0.05)] bg-[#00d9ff]/5"
                : "border-white/5"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-xs font-semibold text-zinc-300 truncate pr-1">
                {preset.name}
              </span>
              <Activity size={12} style={{ color: preset.color }} />
            </div>
            <p className="font-mono text-[10px] text-zinc-500 truncate">
              {preset.equation}
            </p>
          </button>
        ))}
      </div>

      {/* Interactive Render Box */}
      <div className="w-full relative glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        {/* Plotting Canvas */}
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-[320px] bg-[#020509] block cursor-crosshair"
        />

        {/* Floating Controls HUD */}
        <div className="absolute top-4 right-4 flex gap-1.5 z-20">
          <button
            onClick={() => handleZoom("in")}
            title="Zoom In"
            className="p-2 rounded-lg bg-black/60 border border-white/5 text-zinc-400 hover:text-[#00d9ff] transition-colors active:scale-90 cursor-pointer"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => handleZoom("out")}
            title="Zoom Out"
            className="p-2 rounded-lg bg-black/60 border border-white/5 text-zinc-400 hover:text-[#00d9ff] transition-colors active:scale-90 cursor-pointer"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleReset}
            title="Autofit Scope"
            className="p-2 rounded-lg bg-black/60 border border-white/5 text-zinc-400 hover:text-[#00d9ff] transition-colors active:scale-90 cursor-pointer"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Grid Boundaries indicators */}
        <div className="absolute bottom-3 left-4 select-none pointer-events-none text-[10px] font-mono text-zinc-600">
          X: [{rangeX.min.toFixed(1)}, {rangeX.max.toFixed(1)}] · Y: [{rangeY.min.toFixed(1)}, {rangeY.max.toFixed(1)}]
        </div>

        {/* Hover Coordinate Tracker Overlay */}
        {hoverCoord && (
          <div
            className="absolute bg-[#03070d]/95 border border-[#00d9ff]/30 text-[#00d9ff] text-[10px] p-2 rounded-lg pointer-events-none shadow-lg z-30 font-mono transition-all"
            style={{
              left: `${Math.min(hoverCoord.px + 12, (canvasRef.current?.getBoundingClientRect().width || 600) - 100)}px`,
              top: `${Math.min(hoverCoord.py + 12, (canvasRef.current?.getBoundingClientRect().height || 400) - 60)}px`,
            }}
          >
            <div className="font-semibold text-[11px] border-b border-[#00d9ff]/10 pb-0.5 mb-1 truncate max-w-[90px]">
              y = {activeEquation}
            </div>
            <div>X: <span className="text-white">{hoverCoord.x.toFixed(4)}</span></div>
            <div>Y: <span className="text-white">{hoverCoord.y.toFixed(4)}</span></div>
          </div>
        )}

        {/* Error Flag Alert */}
        {errorMsg && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 font-mono text-xs text-rose-400 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl max-w-xs text-center">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
