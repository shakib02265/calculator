export type ActiveTab = "basic" | "sci" | "graph" | "solver" | "constants";

export interface CalculatorState {
  expression: string;
  result: string;
  history: string[];
  isRad: boolean; // DEG vs RAD mode
  memory: number; // MS, MR, M+, M- state
  isShift: boolean; // Shift toggle for alternate functions (arcsin, arccos, etc.)
}

export interface ConstantItem {
  symbol: string;
  name: string;
  value: string; // Scientific notation of value
  description: string;
  unit: string;
}

export interface GraphPreset {
  id: string;
  name: string;
  equation: string;
  description: string;
  color: string;
  minX: number;
  maxX: number;
}

export interface SolverResult {
  explanation: string;
  calculatedAnswer: string;
  formulaUsed: string;
  graphableEqus: string[];
}

export interface UnitCategory {
  name: string;
  icon: string;
  units: { name: string; factor: number; offset?: number }[];
}
