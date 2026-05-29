import { NextResponse } from "next/server";
import { readData, addParticipant } from "@/lib/storage";

export async function GET() {
  const data = await readData();
  return NextResponse.json({
    participants: data.participants.map((p) => ({
      id: p.id,
      name: p.name,
      entryFeePaid: p.entryFeePaid,
      joinedAt: p.joinedAt,
      predictionsCount: Object.keys(p.matches ?? {}).length,
      hasSpecial: !!p.special,
    })),
    tournament: {
      name: data.tournament.name,
      entryFee: data.tournament.entryFee,
      maxParticipants: data.tournament.maxParticipants,
      minParticipants: data.tournament.minParticipants,
    },
  });
}

export async function POST(request: Request) {
  try {
    const { name, pin } = await request.json();
    if (!name?.trim() || !pin?.trim()) {
      return NextResponse.json({ error: "Nom i PIN obligatoris" }, { status: 400 });
    }
    if (pin.length < 4) {
      return NextResponse.json({ error: "El PIN ha de tenir mínim 4 caràcters" }, { status: 400 });
    }
    const participant = await addParticipant(name.trim(), pin);
    return NextResponse.json({
      id: participant.id,
      name: participant.name,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconegut" },
      { status: 400 }
    );
  }
}
