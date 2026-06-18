import { create } from 'zustand';
import type {
  Scenario,
  CommonInput,
  InvestInput,
  PolicyFlags,
  HousingType,
  HousingInput,
} from '../types/domain';
import { DEFAULT_SCENARIO } from '../config/defaults.config';

type ScenarioId = 'A' | 'B';

function defaultHousing(type: HousingType): HousingInput {
  switch (type) {
    case 'happy':
      return {
        type: 'happy',
        deposit: 50_000_000,
        monthlyRent: 300_000,
        managementFee: 80_000,
        depositAdjustRate: 0.05,
        interestRate: 0.025,
      };
    case 'jeonse':
      return {
        type: 'jeonse',
        deposit: 400_000_000,
        loanLimit: 200_000_000,
        loanRate: 0.035,
        managementFee: 50_000,
      };
    case 'purchase':
      return {
        type: 'purchase',
        price: 600_000_000,
        loanRate: 0.04,
        loanMaturityYears: 30,
        managementFee: 150_000,
      };
  }
}

function makeDefault(label: string, type: HousingType): Scenario {
  return { ...structuredClone(DEFAULT_SCENARIO), label, housing: defaultHousing(type) };
}

interface ScenarioState {
  scenarios: Record<ScenarioId, Scenario>;
  comparisonMode: boolean;
  updateCommon: (id: ScenarioId, patch: Partial<CommonInput>) => void;
  updateInvest: (id: ScenarioId, patch: Partial<InvestInput>) => void;
  updatePolicy: (id: ScenarioId, patch: Partial<PolicyFlags>) => void;
  setHousingType: (id: ScenarioId, type: HousingType) => void;
  updateHousing: (id: ScenarioId, patch: Record<string, number>) => void;
  toggleComparison: () => void;
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  scenarios: {
    A: makeDefault('시나리오 A', 'purchase'),
    B: makeDefault('시나리오 B', 'jeonse'),
  },
  comparisonMode: false,
  updateCommon: (id, patch) =>
    set((s) => ({
      scenarios: {
        ...s.scenarios,
        [id]: { ...s.scenarios[id], common: { ...s.scenarios[id].common, ...patch } },
      },
    })),
  updateInvest: (id, patch) =>
    set((s) => ({
      scenarios: {
        ...s.scenarios,
        [id]: { ...s.scenarios[id], invest: { ...s.scenarios[id].invest, ...patch } },
      },
    })),
  updatePolicy: (id, patch) =>
    set((s) => ({
      scenarios: {
        ...s.scenarios,
        [id]: { ...s.scenarios[id], policy: { ...s.scenarios[id].policy, ...patch } },
      },
    })),
  setHousingType: (id, type) =>
    set((s) => ({
      scenarios: { ...s.scenarios, [id]: { ...s.scenarios[id], housing: defaultHousing(type) } },
    })),
  updateHousing: (id, patch) =>
    set((s) => ({
      scenarios: {
        ...s.scenarios,
        [id]: {
          ...s.scenarios[id],
          housing: { ...s.scenarios[id].housing, ...patch } as HousingInput,
        },
      },
    })),
  toggleComparison: () => set((s) => ({ comparisonMode: !s.comparisonMode })),
}));
