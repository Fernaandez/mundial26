/** Horaris oficials FIFA WC 2026 (hora d'estiu nord-americana → ISO EDT UTC-4) */

export interface MatchScheduleEntry {
  kickoff: string;
  city: string;
}

const E = "-04:00";

function s(date: string, time: string, city: string): MatchScheduleEntry {
  return { kickoff: `${date}T${time}:00${E}`, city };
}

/** Horari per id de partit (72 grups + 32 eliminatòries) */
export const MATCH_SCHEDULE: Record<string, MatchScheduleEntry> = {
  // Grup A
  "A-m1": s("2026-06-11", "15:00", "Ciutat de Mèxic"),
  "A-m2": s("2026-06-11", "22:00", "Guadalajara"),
  "A-m3": s("2026-06-18", "21:00", "Guadalajara"),
  "A-m4": s("2026-06-18", "12:00", "Atlanta"),
  "A-m5": s("2026-06-24", "21:00", "Ciutat de Mèxic"),
  "A-m6": s("2026-06-24", "21:00", "Monterrey"),
  // Grup B
  "B-m1": s("2026-06-12", "15:00", "Toronto"),
  "B-m2": s("2026-06-13", "15:00", "San Francisco"),
  "B-m3": s("2026-06-18", "18:00", "Vancouver"),
  "B-m4": s("2026-06-18", "15:00", "Los Angeles"),
  "B-m5": s("2026-06-24", "15:00", "Vancouver"),
  "B-m6": s("2026-06-24", "15:00", "Seattle"),
  // Grup C
  "C-m1": s("2026-06-13", "18:00", "New York"),
  "C-m2": s("2026-06-13", "21:00", "Boston"),
  "C-m3": s("2026-06-19", "21:00", "Philadelphia"),
  "C-m4": s("2026-06-19", "18:00", "Boston"),
  "C-m5": s("2026-06-24", "18:00", "Miami"),
  "C-m6": s("2026-06-24", "18:00", "Atlanta"),
  // Grup D
  "D-m1": s("2026-06-12", "21:00", "Los Angeles"),
  "D-m2": s("2026-06-13", "00:00", "Vancouver"),
  "D-m3": s("2026-06-19", "15:00", "Seattle"),
  "D-m4": s("2026-06-19", "23:00", "San Francisco"),
  "D-m5": s("2026-06-25", "22:00", "Los Angeles"),
  "D-m6": s("2026-06-25", "22:00", "San Francisco"),
  // Grup E
  "E-m1": s("2026-06-14", "13:00", "Houston"),
  "E-m2": s("2026-06-14", "19:00", "Philadelphia"),
  "E-m3": s("2026-06-20", "16:00", "Toronto"),
  "E-m4": s("2026-06-20", "20:00", "Kansas City"),
  "E-m5": s("2026-06-25", "16:00", "Philadelphia"),
  "E-m6": s("2026-06-25", "16:00", "New York"),
  // Grup F
  "F-m1": s("2026-06-14", "16:00", "Dallas"),
  "F-m2": s("2026-06-14", "22:00", "Monterrey"),
  "F-m3": s("2026-06-20", "13:00", "Houston"),
  "F-m4": s("2026-06-20", "00:00", "Monterrey"),
  "F-m5": s("2026-06-25", "19:00", "Dallas"),
  "F-m6": s("2026-06-25", "19:00", "Kansas City"),
  // Grup G
  "G-m1": s("2026-06-15", "15:00", "Seattle"),
  "G-m2": s("2026-06-15", "21:00", "Los Angeles"),
  "G-m3": s("2026-06-21", "15:00", "Los Angeles"),
  "G-m4": s("2026-06-21", "21:00", "Vancouver"),
  "G-m5": s("2026-06-26", "23:00", "Vancouver"),
  "G-m6": s("2026-06-26", "23:00", "Seattle"),
  // Grup H
  "H-m1": s("2026-06-15", "12:00", "Atlanta"),
  "H-m2": s("2026-06-15", "18:00", "Miami"),
  "H-m3": s("2026-06-21", "12:00", "Atlanta"),
  "H-m4": s("2026-06-21", "18:00", "Miami"),
  "H-m5": s("2026-06-26", "20:00", "Houston"),
  "H-m6": s("2026-06-26", "20:00", "Guadalajara"),
  // Grup I
  "I-m1": s("2026-06-16", "15:00", "New York"),
  "I-m2": s("2026-06-16", "18:00", "Boston"),
  "I-m3": s("2026-06-22", "17:00", "Philadelphia"),
  "I-m4": s("2026-06-22", "20:00", "New York"),
  "I-m5": s("2026-06-26", "15:00", "Boston"),
  "I-m6": s("2026-06-26", "15:00", "Toronto"),
  // Grup J
  "J-m1": s("2026-06-16", "21:00", "Kansas City"),
  "J-m2": s("2026-06-16", "00:00", "San Francisco"),
  "J-m3": s("2026-06-22", "13:00", "Dallas"),
  "J-m4": s("2026-06-22", "23:00", "San Francisco"),
  "J-m5": s("2026-06-27", "22:00", "Kansas City"),
  "J-m6": s("2026-06-27", "22:00", "Dallas"),
  // Grup K
  "K-m1": s("2026-06-17", "13:00", "Houston"),
  "K-m2": s("2026-06-17", "22:00", "Ciutat de Mèxic"),
  "K-m3": s("2026-06-23", "13:00", "Houston"),
  "K-m4": s("2026-06-23", "22:00", "Guadalajara"),
  "K-m5": s("2026-06-27", "19:30", "Miami"),
  "K-m6": s("2026-06-27", "19:30", "Atlanta"),
  // Grup L
  "L-m1": s("2026-06-17", "16:00", "Dallas"),
  "L-m2": s("2026-06-17", "19:00", "Toronto"),
  "L-m3": s("2026-06-23", "16:00", "Boston"),
  "L-m4": s("2026-06-23", "19:00", "Toronto"),
  "L-m5": s("2026-06-27", "17:00", "New York"),
  "L-m6": s("2026-06-27", "17:00", "Philadelphia"),
  // 16ens
  "r32-1": s("2026-06-28", "15:00", "Los Angeles"),
  "r32-2": s("2026-06-29", "13:00", "Houston"),
  "r32-3": s("2026-06-29", "16:30", "Boston"),
  "r32-4": s("2026-06-29", "21:00", "Monterrey"),
  "r32-5": s("2026-06-30", "13:00", "Dallas"),
  "r32-6": s("2026-06-30", "17:00", "New York"),
  "r32-7": s("2026-06-30", "21:00", "Ciutat de Mèxic"),
  "r32-8": s("2026-07-01", "12:00", "Atlanta"),
  "r32-9": s("2026-07-01", "16:00", "Seattle"),
  "r32-10": s("2026-07-01", "20:00", "San Francisco"),
  "r32-11": s("2026-07-02", "15:00", "Los Angeles"),
  "r32-12": s("2026-07-02", "19:00", "Toronto"),
  "r32-13": s("2026-07-02", "23:00", "Vancouver"),
  "r32-14": s("2026-07-03", "14:00", "Dallas"),
  "r32-15": s("2026-07-03", "18:00", "Miami"),
  "r32-16": s("2026-07-03", "21:30", "Kansas City"),
  // 8ens
  "r16-1": s("2026-07-04", "13:00", "Houston"),
  "r16-2": s("2026-07-04", "17:00", "Philadelphia"),
  "r16-3": s("2026-07-05", "16:00", "New York"),
  "r16-4": s("2026-07-05", "20:00", "Ciutat de Mèxic"),
  "r16-5": s("2026-07-06", "15:00", "Dallas"),
  "r16-6": s("2026-07-06", "20:00", "Seattle"),
  "r16-7": s("2026-07-07", "12:00", "Atlanta"),
  "r16-8": s("2026-07-07", "16:00", "Vancouver"),
  // Quarts
  "qf-1": s("2026-07-09", "16:00", "Boston"),
  "qf-2": s("2026-07-10", "15:00", "Los Angeles"),
  "qf-3": s("2026-07-11", "17:00", "Miami"),
  "qf-4": s("2026-07-11", "21:00", "Kansas City"),
  // Semis
  "sf-1": s("2026-07-14", "15:00", "Dallas"),
  "sf-2": s("2026-07-15", "15:00", "Atlanta"),
  // 3r lloc i final
  "third": s("2026-07-18", "17:00", "Miami"),
  "final": s("2026-07-19", "15:00", "New York"),
};

export function applyScheduleToMatch<T extends { id: string; date?: string; city?: string }>(match: T): T {
  const entry = MATCH_SCHEDULE[match.id];
  if (!entry) return match;
  return { ...match, date: entry.kickoff, city: entry.city };
}

export function applyScheduleToMatches<T extends { id: string; date?: string; city?: string }>(matches: T[]): T[] {
  return matches.map(applyScheduleToMatch);
}
