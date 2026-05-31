import { NextResponse } from "next/server";
import { readData } from "@/lib/storage";
import { computeAllGroupStandings } from "@/lib/standings";

export async function GET() {
  const data = await readData();
  const { groups, matches } = data.tournament;
  const groupStandings = computeAllGroupStandings(groups, matches);
  const groupResultsCount = matches.filter(
    (m) => m.phase === "groups" && m.homeScore !== undefined
  ).length;
  const knockoutResultsCount = matches.filter(
    (m) => m.phase !== "groups" && m.phase !== "special" && m.homeScore !== undefined
  ).length;

  return NextResponse.json({
    groups,
    matches,
    groupStandings,
    stats: {
      groupResultsCount,
      groupMatchesTotal: matches.filter((m) => m.phase === "groups").length,
      knockoutResultsCount,
      knockoutMatchesTotal: matches.filter(
        (m) => m.phase !== "groups" && m.phase !== "special"
      ).length,
    },
    updatedAt: new Date().toISOString(),
  });
}
