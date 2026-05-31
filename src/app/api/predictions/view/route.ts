import { NextResponse } from "next/server";
import { readData, getParticipant, verifyPin } from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const viewerId = searchParams.get("viewerId");
  const viewerPin = searchParams.get("viewerPin");
  const targetId = searchParams.get("targetId");

  if (!viewerId || !viewerPin || !targetId) {
    return NextResponse.json({ error: "Paràmetres obligatoris" }, { status: 400 });
  }

  if (!(await verifyPin(viewerId, viewerPin))) {
    return NextResponse.json({ error: "Sessió invàlida" }, { status: 403 });
  }

  const target = await getParticipant(targetId);
  if (!target) {
    return NextResponse.json({ error: "Participant no trobat" }, { status: 404 });
  }

  const data = await readData();

  return NextResponse.json({
    participant: {
      id: target.id,
      name: target.name,
      matches: target.matches ?? {},
      special: target.special,
      bracketPicks: target.bracketPicks ?? {},
    },
    matches: data.tournament.matches,
    groups: data.tournament.groups,
  });
}
