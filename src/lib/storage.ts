import fs from "fs";
import path from "path";
import { AppData, Participant, Match, SpecialPredictions } from "@/types";
import { TOURNAMENT_CONFIG, ALL_MATCHES } from "@/data/world-cup-2026";
import { getSupabase, useSupabase, isCloudDeploy, getStorageConfigError } from "@/lib/supabase";

const ROW_ID = 1;
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "quiniela.json");

export interface SpecialActuals {
  champion?: string;
  runnerUp?: string;
  thirdPlace?: string;
  topScorer?: string;
  totalGoals?: number;
  groupStandings?: Record<string, { order: string[]; thirdQualifies: boolean }>;
}

export interface ExtendedAppData extends AppData {
  specialActuals?: SpecialActuals;
}

function defaultData(): ExtendedAppData {
  return {
    tournament: TOURNAMENT_CONFIG,
    participants: [],
    adminPin: process.env.ADMIN_PIN || "mundial2026",
  };
}

function mergeMatches(parsed: ExtendedAppData): ExtendedAppData {
  parsed.tournament.matches = ALL_MATCHES.map((m) => {
    const existing = parsed.tournament.matches.find((x) => x.id === m.id);
    return existing
      ? {
          ...m,
          homeScore: existing.homeScore,
          awayScore: existing.awayScore,
          locked: existing.locked,
          homeTeam: existing.homeTeam !== "TBD" ? existing.homeTeam : m.homeTeam,
          awayTeam: existing.awayTeam !== "TBD" ? existing.awayTeam : m.awayTeam,
        }
      : m;
  });
  return parsed;
}

function readFileData(): ExtendedAppData {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const data = defaultData();
      writeFileData(data);
      return data;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return mergeMatches(JSON.parse(raw) as ExtendedAppData);
  } catch {
    return defaultData();
  }
}

function writeFileData(data: ExtendedAppData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function readSupabaseData(): Promise<ExtendedAppData> {
  const supabase = getSupabase();
  if (!supabase) return defaultData();

  const { data, error } = await supabase
    .from("quiniela")
    .select("data")
    .eq("id", ROW_ID)
    .maybeSingle();

  if (error) throw new Error(`Supabase: ${error.message}`);

  if (!data) {
    const initial = defaultData();
    await writeSupabaseData(initial);
    return initial;
  }

  return mergeMatches(data.data as ExtendedAppData);
}

async function writeSupabaseData(appData: ExtendedAppData): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurat");

  const { error } = await supabase
    .from("quiniela")
    .upsert({ id: ROW_ID, data: appData, updated_at: new Date().toISOString() });

  if (error) throw new Error(`Supabase: ${error.message}`);
}

export async function readData(): Promise<ExtendedAppData> {
  if (useSupabase()) {
    return await readSupabaseData();
  }
  if (isCloudDeploy()) {
    throw new Error(getStorageConfigError());
  }
  return readFileData();
}

export async function writeData(data: ExtendedAppData): Promise<void> {
  if (useSupabase()) {
    await writeSupabaseData(data);
    return;
  }
  if (isCloudDeploy()) {
    throw new Error(getStorageConfigError());
  }
  writeFileData(data);
}

export async function addParticipant(name: string, pin: string): Promise<Participant> {
  const data = await readData();
  if (data.participants.length >= data.tournament.maxParticipants) {
    throw new Error("S'ha assolit el màxim de participants");
  }
  if (data.participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("Ja existeix un participant amb aquest nom");
  }

  const participant: Participant = {
    id: crypto.randomUUID(),
    name,
    pin,
    entryFeePaid: false,
    joinedAt: new Date().toISOString(),
    matches: {},
  };

  data.participants.push(participant);
  await writeData(data);
  return participant;
}

export async function adminAddParticipant(adminPin: string, name: string, pin: string): Promise<Participant> {
  const data = await readData();
  if (data.adminPin !== adminPin) throw new Error("PIN d'admin incorrecte");
  return addParticipant(name, pin);
}

export async function getParticipant(id: string): Promise<Participant | undefined> {
  const data = await readData();
  return data.participants.find((p) => p.id === id);
}

export async function verifyPin(id: string, pin: string): Promise<boolean> {
  const p = await getParticipant(id);
  return p?.pin === pin;
}

export async function updateMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number,
  locked: boolean
): Promise<Match> {
  const data = await readData();
  const match = data.tournament.matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Partit no trobat");

  match.homeScore = homeScore;
  match.awayScore = awayScore;
  match.locked = locked;
  await writeData(data);
  return match;
}

export async function savePredictions(
  participantId: string,
  pin: string,
  matches: Record<string, { home: number; away: number }>,
  special?: SpecialPredictions
): Promise<Participant> {
  const data = await readData();
  const p = data.participants.find((x) => x.id === participantId);
  if (!p || p.pin !== pin) throw new Error("Accés denegat");

  for (const [matchId, pred] of Object.entries(matches)) {
    const match = data.tournament.matches.find((m) => m.id === matchId);
    if (!match) continue;
    if (match.locked) continue;
    p.matches[matchId] = pred;
  }

  if (special) {
    p.special = special;
  }

  await writeData(data);
  return p;
}

export async function markEntryPaid(participantId: string, adminPin: string): Promise<void> {
  const data = await readData();
  if (data.adminPin !== adminPin) throw new Error("PIN d'admin incorrecte");
  const p = data.participants.find((x) => x.id === participantId);
  if (!p) throw new Error("Participant no trobat");
  p.entryFeePaid = true;
  await writeData(data);
}

export async function saveSpecialActuals(adminPin: string, actuals: SpecialActuals): Promise<void> {
  const data = await readData();
  if (data.adminPin !== adminPin) throw new Error("PIN d'admin incorrecte");
  data.specialActuals = actuals;
  await writeData(data);
}

export async function getSpecialActuals(): Promise<SpecialActuals | undefined> {
  const data = await readData();
  return data.specialActuals;
}

export async function updateKnockoutTeams(
  matchId: string,
  homeTeam: string,
  awayTeam: string,
  adminPin: string
): Promise<void> {
  const data = await readData();
  if (data.adminPin !== adminPin) throw new Error("PIN d'admin incorrecte");
  const match = data.tournament.matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Partit no trobat");
  match.homeTeam = homeTeam;
  match.awayTeam = awayTeam;
  await writeData(data);
}
