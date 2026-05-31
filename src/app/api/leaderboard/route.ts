import { NextResponse } from "next/server";
import { readData, getSpecialActuals } from "@/lib/storage";
import { calculateAllScores, calculatePrizes } from "@/lib/scoring";

export async function GET() {
  const data = await readData();
  const specialActuals = await getSpecialActuals();
  const scores = calculateAllScores(
    data.participants,
    data.tournament.matches,
    specialActuals
  );

  const paidCount = data.participants.filter((p) => p.entryFeePaid).length;
  const count = data.participants.length;
  const prizes = calculatePrizes(
    count,
    data.tournament.entryFee,
    data.tournament.prizeSplit
  );

  return NextResponse.json({
    scores,
    prizes,
    participantCount: data.participants.length,
    paidCount,
    tournament: {
      name: data.tournament.name,
      entryFee: data.tournament.entryFee,
      maxParticipants: data.tournament.maxParticipants,
    },
  });
}
