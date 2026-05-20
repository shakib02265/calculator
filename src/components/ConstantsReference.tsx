import React, { useState } from "react";
import { ConstantItem, UnitCategory } from "../types";
import { BookOpen, RefreshCw, Plus, Cpu, HelpCircle } from "lucide-react";

interface ConstantsReferenceProps {
  onInsertConstant: (value: string) => void;
}

const PHYSICAL_CONSTANTS: ConstantItem[] = [
  {
    symbol: "c",
    name: "Speed of Light",
    value: "299792458",
    description: "Speed of electromagnetic waves in vacuum.",
    unit: "m/s",
  },
  {
    symbol: "h",
    name: "Planck Constant",
    value: "6.62607015e-34",
    description: "Quantum of electromagnetic action relating energy to frequency.",
    unit: "J·s",
  },
  {
    symbol: "G",
    name: "Gravitational Constant",
    value: "6.6743e-11",
    description: "Key coefficient in Newtonian gravity equations.",
    unit: "m³/(kg·s²)",
  },
  {
    symbol: "N_A",
    name: "Avogadro Constant",
    value: "6.02214076e23",
    description: "Number of constituent particles per mole of substance.",
    unit: "mol⁻¹",
  },
  {
    symbol: "R",
    name: "Gas Constant",
    value: "8.314462618",
    description: "Molar gas constant of thermodynamic equations.",
    unit: "J/(mol·K)",
  },
  {
    symbol: "k_B",
    name: "Boltzmann Constant",
    value: "1.380649e-23",
    description: "Relates thermodynamic temperature to kinetic energy.",
    unit: "J/K",
  },
  {
    symbol: "e",
    name: "Elementary Charge",
    value: "1.602176634e-19",
    description: "Electric charge carried by a single proton vacuum.",
    unit: "C",
  },
  {
    symbol: "ε_0",
    name: "Vacuum Permittivity",
    value: "8.8541878128e-12",
    description: "Measure of electrical resistance of absolute vacuum space.",
    unit: "F/m",
  },
];

const UNIT_CATEGORIES: UnitCategory[] = [
  {
    name: "Length",
    icon: "📏",
    units: [
      { name: "Meter (m)", factor: 1 },
      { name: "Kilometer (km)", factor: 1000 },
      { name: "Mile (mi)", factor: 1609.344 },
      { name: "Foot (ft)", factor: 0.3048 },
      { name: "Inch (in)", factor: 0.0254 },
    ],
  },
  {
    name: "Mass",
    icon: "⚖️",
    units: [
      { name: "Kilogram (kg)", factor: 1 },
      { name: "Gram (g)", factor: 0.001 },
      { name: "Pound (lb)", factor: 0.45359237 },
      { name: "Ounce (oz)", factor: 0.0283495231 },
    ],
  },
  {
    name: "Energy",
    icon: "🔥",
    units: [
      { name: "Joule (J)", factor: 1 },
      { name: "Kilojoule (kJ)", factor: 1000 },
      { name: "Calorie (cal)", factor: 4.184 },
      { name: "Kilocalorie (kcal)", factor: 4184 },
      { name: "Watt-hour (Wh)", factor: 3600 },
      { name: "Electron-volt (eV)", factor: 1.602176634e-19 },
    ],
  },
  {
    name: "Pressure",
    icon: "💨",
    units: [
      { name: "Pascal (Pa)", factor: 1 },
      { name: "Kilopascal (kPa)", factor: 1000 },
      { name: "Atmosphere (atm)", factor: 101325 },
      { name: "Bar (bar)", factor: 100000 },
      { name: "PSI (psi)", factor: 6894.757 },
    ],
  },
];

export default function ConstantsReference({ onInsertConstant }: ConstantsReferenceProps) {
  // Conversion state
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [inputValue, setInputValue] = useState("1.0");
  const [fromUnitIndex, setFromUnitIndex] = useState(0);
  const [toUnitIndex, setToUnitIndex] = useState(1);

  // Active category mapping
  const activeCategory = UNIT_CATEGORIES[activeCategoryIndex];

  // Perform unit calculation safely
  const calculateConversion = (): string => {
    const valObj = parseFloat(inputValue);
    if (isNaN(valObj)) return "0.0";

    const fromUnitObj = activeCategory.units[fromUnitIndex] || activeCategory.units[0];
    const toUnitObj = activeCategory.units[toUnitIndex] || activeCategory.units[1] || activeCategory.units[0];

    // Convert from current unit to base unit, and then from base to target
    const valueInBase = valObj * fromUnitObj.factor;
    const valueInTarget = valueInBase / toUnitObj.factor;

    // Beautiful precision handling
    if (Math.abs(valueInTarget) < 0.00001 || Math.abs(valueInTarget) > 10000000) {
      return valueInTarget.toExponential(5);
    }
    return valueInTarget.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const handleInsertValueToCalc = () => {
    const computed = calculateConversion().replace(/,/g, "");
    onInsertConstant(computed);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Tab: Physical Reference constants */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1.5">
          <BookOpen size={16} className="text-[#00d9ff]" />
          <span className="font-sans font-semibold text-sm text-zinc-200">Physical & Quantum Constants</span>
        </div>
        
        <p className="font-mono text-[11px] text-zinc-500 -mt-1">
          Tap absolute constants to inject their scientific values directly into the active calculation buffer.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
          {PHYSICAL_CONSTANTS.map((c) => (
            <button
              onClick={() => onInsertConstant(c.value)}
              key={c.symbol}
              className="p-4 bg-[rgba(255,255,255,0.01)] border border-white/5 hover:border-[#00d9ff]/30 hover:bg-white/5 text-left rounded-2xl transition-all group cursor-pointer flex justify-between items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-[#00d9ff] bg-[#00d9ff]/10 border border-[#00d9ff]/20 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,217,255,0.1)] select-all">
                    {c.symbol}
                  </span>
                  <span className="font-sans font-semibold text-xs text-zinc-300 truncate">
                    {c.name}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-zinc-500 line-clamp-2">
                  {c.description}
                </p>
              </div>
              
              <div className="text-right shrink-0">
                <div className="font-mono text-[11px] font-medium text-white group-hover:text-[#00d9ff] select-all">
                  {parseFloat(c.value) > 1000000 || parseFloat(c.value) < 0.0001
                    ? parseFloat(c.value).toExponential(4)
                    : c.value}
                </div>
                <div className="font-mono text-[9px] text-zinc-600">
                  {c.unit}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Direct Unit Convert Tool */}
      <div className="flex flex-col gap-3.5 border-t border-white/5 pt-5">
        <div className="flex items-center gap-2 mb-1">
          <RefreshCw size={16} className="text-[#00d9ff]" />
          <span className="font-sans font-semibold text-sm text-zinc-200">Engineering Unit Converter</span>
        </div>

        {/* Selected matrices slider tabs */}
        <div className="flex gap-2 w-full overflow-x-auto scrollbar-none pb-1">
          {UNIT_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategoryIndex(idx);
                setFromUnitIndex(0);
                setToUnitIndex(cat.units.length > 1 ? 1 : 0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer whitespace-nowrap select-none ${
                activeCategoryIndex === idx
                  ? "bg-[#00d9ff]/10 border-[#00d9ff] text-[#00d9ff] shadow-[0_0_8px_rgba(0,217,255,0.15)]"
                  : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <span className="mr-1.5">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Form converter */}
        <div className="p-4 bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-3xl flex flex-col md:flex-row gap-4 items-center w-full">
          <div className="w-full md:w-1/4">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Input Velocity</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-2.5 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-white focus:border-[#00d9ff]/30 focus:outline-none focus:ring-0 select-all"
            />
          </div>

          <div className="w-full md:w-1/4">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">From Unit</span>
            <select
              value={fromUnitIndex}
              onChange={(e) => setFromUnitIndex(parseInt(e.target.value))}
              className="w-full p-2.5 bg-black/40 border border-white/5 rounded-xl font-mono text-xs text-zinc-300 focus:outline-none hover:bg-white/5 cursor-pointer"
            >
              {activeCategory.units.map((u, i) => (
                <option key={u.name} value={i} className="bg-zinc-900 border-none text-xs text-white">
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center items-center py-2 shrink-0 text-zinc-600">
            →
          </div>

          <div className="w-full md:w-1/4">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">To Unit</span>
            <select
              value={toUnitIndex}
              onChange={(e) => setToUnitIndex(parseInt(e.target.value))}
              className="w-full p-2.5 bg-black/40 border border-white/5 rounded-xl font-mono text-xs text-zinc-300 focus:outline-none hover:bg-white/5 cursor-pointer"
            >
              {activeCategory.units.map((u, i) => (
                <option key={u.name} value={i} className="bg-zinc-900 border-none text-xs text-white">
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Computed value display */}
          <div className="w-full md:flex-1 text-center md:text-right">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Converted Sum</span>
            <div className="font-mono text-sm font-semibold text-[#00d9ff] drop-shadow-[0_0_8px_rgba(0,217,255,0.15)] bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-center md:text-right select-all">
              {calculateConversion()}
            </div>
          </div>
        </div>

        {/* Converted injection button */}
        <button
          onClick={handleInsertValueToCalc}
          className="flex items-center justify-center gap-1.5 w-full md:w-max md:self-end px-4 py-2 bg-[#00d9ff]/10 text-[#00d9ff] text-xs font-semibold rounded-xl hover:bg-[#00d9ff]/20 active:scale-95 transition-all text-center border border-[#00d9ff]/20 cursor-pointer"
        >
          <Cpu size={14} />
          <span>Insert Converted Result into Active Expression</span>
        </button>
      </div>
    </div>
  );
}
