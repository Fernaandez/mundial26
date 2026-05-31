import { NextResponse } from "next/server";
import {
  readData,
  updateMatchResult,
  markParticipantAcknowledged,
  deleteParticipant,
  saveSpecialActuals,
  updateKnockoutTeams,
  adminAddParticipant,
  updatePredictionWindows,
  getPredictionWindows,
} from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pin = searchParams.get("pin");
  const data = await readData();

  if (pin !== data.adminPin) {
    return NextResponse.json({ error: "PIN incorrecte" }, { status: 403 });
  }

  return NextResponse.json({
    matches: data.tournament.matches,
    participants: data.participants,
    groups: data.tournament.groups,
    predictionWindows: getPredictionWindows(data),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, adminPin } = body;

    if (action === "result") {
      const match = await updateMatchResult(body.matchId, body.homeScore, body.awayScore, body.locked ?? true);
      return NextResponse.json({ success: true, match });
    }

    if (action === "markAcknowledged" || action === "markPaid") {
      await markParticipantAcknowledged(body.participantId, adminPin);
      return NextResponse.json({ success: true });
    }

    if (action === "deleteParticipant") {
      await deleteParticipant(body.participantId, adminPin);
      return NextResponse.json({ success: true });
    }

    if (action === "addParticipant") {
      const participant = await adminAddParticipant(adminPin, body.name, body.pin);
      return NextResponse.json({ success: true, participant: { id: participant.id, name: participant.name } });
    }

    if (action === "specialActuals") {
      await saveSpecialActuals(adminPin, body.actuals);
      return NextResponse.json({ success: true });
    }

    if (action === "knockoutTeams") {
      await updateKnockoutTeams(body.matchId, body.homeTeam, body.awayTeam, adminPin);
      return NextResponse.json({ success: true });
    }

    if (action === "predictionWindows") {
      const windows = await updatePredictionWindows(adminPin, body.windows);
      return NextResponse.json({ success: true, predictionWindows: windows });
    }

    return NextResponse.json({ error: "Acció desconeguda" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconegut" },
      { status: 400 }
    );
  }
}
