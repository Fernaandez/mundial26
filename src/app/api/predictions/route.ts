import { NextResponse } from "next/server";
import { readData, savePredictions, getParticipant, verifyPin } from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const pin = searchParams.get("pin");

  if (!id || !pin) {
    return NextResponse.json({ error: "ID i PIN obligatoris" }, { status: 400 });
  }

  if (!(await verifyPin(id, pin))) {
    return NextResponse.json({ error: "PIN incorrecte" }, { status: 403 });
  }

  const participant = await getParticipant(id);
  const data = await readData();

  return NextResponse.json({
    participant,
    matches: data.tournament.matches,
    groups: data.tournament.groups,
  });
}

export async function POST(request: Request) {
  try {
    const { participantId, pin, matches, special } = await request.json();
    const participant = await savePredictions(participantId, pin, matches, special);
    return NextResponse.json({ success: true, participant });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconegut" },
      { status: 400 }
    );
  }
}
