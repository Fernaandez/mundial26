import { Match } from "@/types";

/** Punts fair play d'un equip en un partit (FIFA: menys punts = millor conducta) */
export function fairPlayPointsForTeamInMatch(
  match: Match,
  teamCode: string
): number {
  const isHome = match.homeTeam === teamCode;
  const isAway = match.awayTeam === teamCode;
  if (!isHome && !isAway) return 0;

  const yellow = isHome ? match.homeYellowCards ?? 0 : match.awayYellowCards ?? 0;
  const red = isHome ? match.homeRedCards ?? 0 : match.awayRedCards ?? 0;
  const redFromTwoYellows = isHome
    ? match.homeRedFromTwoYellows ?? 0
    : match.awayRedFromTwoYellows ?? 0;
  const yellowPlusDirectRed = isHome
    ? match.homeYellowPlusDirectRed ?? 0
    : match.awayYellowPlusDirectRed ?? 0;

  const directRed = Math.max(0, red - redFromTwoYellows - yellowPlusDirectRed);

  return (
    yellow +
    redFromTwoYellows * 3 +
    directRed * 4 +
    yellowPlusDirectRed * 5
  );
}
