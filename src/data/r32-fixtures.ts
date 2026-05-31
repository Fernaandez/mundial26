/** Mapa FIFA — partits Setzens (r32-1…r32-16) alineats amb match-schedule.ts */

export type ThirdSlotKey = "A" | "B" | "D" | "E" | "G" | "I" | "K" | "L";

export interface R32FixtureDef {
  id: string;
  /** 1X o 2X — guanyador o segon del grup X */
  home: string;
  /** 2X fix (sense 3r) */
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
