/**
 * Rànquing FIFA masculí (31 maig 2026) — desempat final dels 8 millors 3rs.
 * Nombre més baix = millor posició.
 */
export const FIFA_RANKING_MAY_2026: Record<string, number> = {
  ESP: 1,
  ARG: 2,
  FRA: 3,
  ENG: 4,
  BRA: 5,
  POR: 6,
  NED: 7,
  BEL: 8,
  MAR: 9,
  GER: 10,
  CRO: 11,
  USA: 12,
  MEX: 13,
  COL: 14,
  URU: 15,
  SEN: 16,
  JPN: 17,
  SUI: 18,
  IRN: 19,
  KOR: 20,
  ECU: 21,
  AUT: 22,
  NOR: 23,
  AUS: 24,
  CAN: 25,
  EGY: 26,
  CIV: 27,
  UZB: 28,
  SCO: 29,
  SWE: 30,
  TUR: 31,
  PAR: 32,
  CZE: 33,
  ALG: 34,
  BIH: 35,
  TUN: 36,
  IRQ: 37,
  CPV: 38,
  KSA: 39,
  JOR: 40,
  COD: 41,
  GHA: 42,
  PAN: 43,
  QAT: 44,
  NZL: 45,
  RSA: 46,
  HAI: 47,
  CUW: 48,
};

export function getFifaRank(teamCode: string): number {
  return FIFA_RANKING_MAY_2026[teamCode] ?? 999;
}

/** Retorna negatiu si `a` té millor rànquing FIFA que `b` */
export function compareFifaRanking(a: string, b: string): number {
  return getFifaRank(a) - getFifaRank(b);
}
