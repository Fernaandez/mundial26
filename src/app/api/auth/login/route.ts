import { NextResponse } from "next/server";
import { readData } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const { name, pin } = await request.json();
    if (!name?.trim() || !pin?.trim()) {
      return NextResponse.json({ error: "Nom i PIN obligatoris" }, { status: 400 });
    }

    const data = await readData();
    const participant = data.participants.find(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase() && p.pin === pin
    );

    if (!participant) {
      return NextResponse.json({ error: "Nom o PIN incorrecte" }, { status: 401 });
    }

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
