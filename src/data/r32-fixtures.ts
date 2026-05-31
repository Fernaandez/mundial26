/**
 * Mapa FIFA — partits Setzens (r32-1…r32-16).
 * Slots 3r: Annex C (495 combinacions segons quins 8 grups classifiquen el 3r).
 *
 * Partits amb 3r (grups elegibles segons reglament FIFA):
 * - r32-3  (1E): A, B, C, D, F
 * - r32-6  (1I): C, D, F, G, H
 * - r32-7  (1A): C, E, F, H, I
 * - r32-8  (1L): E, H, I, J, K
 * - r32-9  (1G): A, E, H, I, J
 * - r32-10 (1D): B, E, F, I, J
 * - r32-13 (1B): E, F, G, I, J
 * - r32-16 (1K): D, E, I, J, L
 */

export type ThirdSlotKey = "A" | "B" | "D" | "E" | "G" | "I" | "K" | "L";

export interface R32FixtureDef {
  id: string;
  home: string;
  away?: string;
  /** Away = 3r segons Annex C (columna 1Xvs) */
  awayThirdSlot?: ThirdSlotKey;
}

/** Ordre = r32-1 … r32-16 (Matches FIFA 73–88) */
export const R32_FIXTURES: R32FixtureDef[] = [
  { id: "r32-1", home: "2A", away: "2B" },
  { id: "r32-2", home: "1C", away: "2F" },
  { id: "r32-3", home: "1E", awayThirdSlot: "E" },
  { id: "r32-4", home: "1F", away: "2C" },
  { id: "r32-5", home: "2E", away: "2I" },
  { id: "r32-6", home: "1I", awayThirdSlot: "I" },
  { id: "r32-7", home: "1A", awayThirdSlot: "A" },
  { id: "r32-8", home: "1L", awayThirdSlot: "L" },
  { id: "r32-9", home: "1G", awayThirdSlot: "G" },
  { id: "r32-10", home: "1D", awayThirdSlot: "D" },
  { id: "r32-11", home: "1H", away: "2J" },
  { id: "r32-12", home: "2K", away: "2L" },
  { id: "r32-13", home: "1B", awayThirdSlot: "B" },
  { id: "r32-14", home: "2D", away: "2G" },
  { id: "r32-15", home: "1J", away: "2H" },
  { id: "r32-16", home: "1K", awayThirdSlot: "K" },
];

/** Grups elegibles per slot 3r (referència reglament) */
export const THIRD_SLOT_ELIGIBLE_GROUPS: Record<ThirdSlotKey, string[]> = {
  A: ["C", "E", "F", "H", "I"],
  B: ["E", "F", "G", "I", "J"],
  D: ["B", "E", "F", "I", "J"],
  E: ["A", "B", "C", "D", "F"],
  G: ["A", "E", "H", "I", "J"],
  I: ["C", "D", "F", "G", "H"],
  K: ["D", "E", "I", "J", "L"],
  L: ["E", "H", "I", "J", "K"],
};
