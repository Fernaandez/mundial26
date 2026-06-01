import { Phase } from "@/types";

/** Rondes eliminatòries amb finestra admin independent */
export type KnockoutWindowPhase =
  | "round32"
  | "round16"
  | "quarter"
  | "semi"
  | "third"
  | "final";

export interface PredictionWindows {
  /** Prediccions de grups tancades — ja no es poden editar */
  groupsLocked: boolean;
  /** Override admin per ronda (marcadors; setzens també obre el quadre) */
  knockoutPhasesOpen: Record<KnockoutWindowPhase, boolean>;
  /** Mode prova: ignora finestres de calendari (admin «Obrir tot») */
  testMode?: boolean;
}

export type PredictionWindowsUpdate = Partial<Omit<PredictionWindows, "knockoutPhasesOpen">> & {
  knockoutPhasesOpen?: Partial<Record<KnockoutWindowPhase, boolean>>;
};

export const KNOCKOUT_WINDOW_PHASES: KnockoutWindowPhase[] = [
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
];

export const DEFAULT_KNOCKOUT_PHASES_OPEN: Record<KnockoutWindowPhase, boolean> = {
  round32: false,
  round16: false,
  quarter: false,
  semi: false,
  third: false,
  final: false,
};

export const DEFAULT_PREDICTION_WINDOWS: PredictionWindows = {
  groupsLocked: false,
  knockoutPhasesOpen: { ...DEFAULT_KNOCKOUT_PHASES_OPEN },
  testMode: false,
};

/** Etiquetes admin — nomenclatura FIFA + UI català */
export const KNOCKOUT_ADMIN_LABELS: Record<
  KnockoutWindowPhase,
  { title: string; hint: string }
> = {
  round32: { title: "Setzens (1/16)", hint: "Marcadors setzens + pestanya Quadre" },
  round16: { title: "Vuitens (1/8)", hint: "Marcadors vuitens" },
  quarter: { title: "Quarts (1/4)", hint: "Marcadors quarts" },
  semi: { title: "Semifinals (1/2)", hint: "Marcadors semis" },
  third: { title: "3r lloc", hint: "Marcador partit del 3r" },
  final: { title: "Final", hint: "Marcador final" },
};

const KNOCKOUT_PHASES: Phase[] = [...KNOCKOUT_WINDOW_PHASES];

export function isKnockoutPhase(phase: Phase): boolean {
  return KNOCKOUT_PHASES.includes(phase);
}

export function isGroupStagePhase(phase: Phase): boolean {
  return phase === "groups" || phase === "special";
}

export function isKnockoutWindowPhase(phase: Phase): phase is KnockoutWindowPhase {
  return KNOCKOUT_WINDOW_PHASES.includes(phase as KnockoutWindowPhase);
}

export function isKnockoutPhaseOpen(phase: Phase, w: PredictionWindows): boolean {
  if (!isKnockoutWindowPhase(phase)) return false;
  return w.knockoutPhasesOpen[phase];
}

export function canEditKnockoutPredictions(w: PredictionWindows): boolean {
  return KNOCKOUT_WINDOW_PHASES.some((p) => w.knockoutPhasesOpen[p]);
}

export function canEditSpecialPredictions(w: PredictionWindows): boolean {
  return !w.groupsLocked;
}

export function canEditGroupPredictions(w: PredictionWindows): boolean {
  return !w.groupsLocked;
}

export function canEditMatchPhase(phase: Phase, w: PredictionWindows): boolean {
  if (phase === "groups" || phase === "special") {
    return canEditGroupPredictions(w);
  }
  if (isKnockoutPhase(phase)) {
    return isKnockoutPhaseOpen(phase, w);
  }
  return false;
}

export function allKnockoutPhasesOpen(open: boolean): Record<KnockoutWindowPhase, boolean> {
  return Object.fromEntries(
    KNOCKOUT_WINDOW_PHASES.map((p) => [p, open])
  ) as Record<KnockoutWindowPhase, boolean>;
}

export function mergePredictionWindows(
  stored?: Partial<PredictionWindows> & { knockoutOpen?: boolean } | null
): PredictionWindows {
  const phases: Record<KnockoutWindowPhase, boolean> = {
    ...DEFAULT_KNOCKOUT_PHASES_OPEN,
  };

  if (stored?.knockoutPhasesOpen) {
    for (const p of KNOCKOUT_WINDOW_PHASES) {
      if (stored.knockoutPhasesOpen[p] !== undefined) {
        phases[p] = stored.knockoutPhasesOpen[p]!;
      }
    }
  } else if (stored?.knockoutOpen === true) {
    for (const p of KNOCKOUT_WINDOW_PHASES) {
      phases[p] = true;
    }
  }

  return {
    groupsLocked: stored?.groupsLocked ?? false,
    knockoutPhasesOpen: phases,
    testMode: stored?.testMode ?? false,
  };
}

export const KNOCKOUT_PHASE_LIST: Phase[] = KNOCKOUT_PHASES;

export const GROUP_STAGE_TABS: Phase[] = ["groups"];
