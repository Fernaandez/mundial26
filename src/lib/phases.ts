import { Phase } from "@/types";

export interface PredictionWindows {
  /** Prediccions de grups tancades — ja no es poden editar */
  groupsLocked: boolean;
  /** Prediccions d'eliminatòries obertes */
  knockoutOpen: boolean;
}

export const DEFAULT_PREDICTION_WINDOWS: PredictionWindows = {
  groupsLocked: false,
  knockoutOpen: true,
};

const KNOCKOUT_PHASES: Phase[] = [
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
];

export function isKnockoutPhase(phase: Phase): boolean {
  return KNOCKOUT_PHASES.includes(phase);
}

export function isGroupStagePhase(phase: Phase): boolean {
  return phase === "groups" || phase === "special";
}

export function canEditGroupPredictions(w: PredictionWindows): boolean {
  return !w.groupsLocked;
}

export function canEditKnockoutPredictions(w: PredictionWindows): boolean {
  return w.knockoutOpen;
}

export function canEditMatchPhase(phase: Phase, w: PredictionWindows): boolean {
  if (phase === "groups" || phase === "special") {
    return canEditGroupPredictions(w);
  }
  if (isKnockoutPhase(phase)) {
    return canEditKnockoutPredictions(w);
  }
  return false;
}

export function mergePredictionWindows(
  stored?: Partial<PredictionWindows> | null
): PredictionWindows {
  return {
    ...DEFAULT_PREDICTION_WINDOWS,
    ...stored,
  };
}

export const KNOCKOUT_PHASE_LIST: Phase[] = KNOCKOUT_PHASES;

export const GROUP_STAGE_TABS: Phase[] = ["groups"];
