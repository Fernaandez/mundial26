import fs from "fs";
import path from "path";
import { AppData, Participant, Match, SpecialPredictions } from "@/types";
import { TOURNAMENT_CONFIG, ALL_MATCHES } from "@/data/world-cup-2026";
import { getSupabase, useSupabase, isCloudDeploy, getStorageConfigError } from "@/lib/supabase";
import {
  PredictionWindows,
  DEFAULT_PREDICTION_WINDOWS,
  mergePredictionWindows,
  canEditGroupPredictions,
  canEditKnockoutPredictions,
  isKnockoutPhase,
} from "@/lib/phases";
import { buildGroupPredictionsFromMatches } from "@/lib/standings";

const ROW_ID = 1;
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "quiniela.json");

export interface SpecialActuals {
  champion?: string;
  runnerUp?: string;
  thirdPlace?: string;
  topScorer?: string;
  topAssists?: string;
  totalGoals?: number;
  groupStandings?: Record<string, { order: string[]; thirdQualifies: boolean }>;
}

export interface ExtendedAppData extends AppData {
  specialActuals?: SpecialActuals;
  predictionWindows?: PredictionWindows;
}

function defaultData(): ExtendedAppData {
  return {
    tournament: {
      ...TOURNAMENT_CONFIG,
      groups: TOURNAMENT_CONFIG.groups.map((g) => ({
        ...g,
        teams: g.teams.map((t) => ({ ...t })),
      })),
      matches: ALL_MATCHES.map((m) => ({ ...m })),
      knockoutBracket: TOURNAMENT_CONFIG.knockoutBracket.map((r) => ({
        ...r,
        matchIds: [...r.matchIds],
      })),
    },
    participants: [],
    adminPin: process.env.ADMIN_PIN || "mundial2026",
    predictionWindows: { ...DEFAULT_PREDICTION_WINDOWS },
  };
}

function ensureTournament(data: ExtendedAppData): ExtendedAppData {
  const base = defaultData();
  if (!data.tournament || typeof data.tournament !== "object") {
    data.tournament = base.tournament;
  }
  if (!Array.isArray(data.tournament.groups)) {
    data.tournament.groups = base.tournament.groups;
  }
  if (!Array.isArray(data.tournament.matches)) {
    data.tournament.matches = [];
  }
  if (!Array.isArray(data.participants)) {
    data.participants = [];
  }
  return data;
}

function normalizeAppData(stored: unknown): ExtendedAppData {
  const base = defaultData();
  if (stored == null || typeof stored !== "object" || Array.isArray(stored)) {
    return base;
  }

  const parsed = stored as Partial<ExtendedAppData>;

  return mergeMatches(
    ensureTournament({
      ...base,
      adminPin: parsed.adminPin || base.adminPin,
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
      specialActuals: parsed.specialActuals,
      predictionWindows: mergePredictionWindows(parsed.predictionWindows),
      tournament: {
        ...base.tournament,
        ...(parsed.tournament && typeof parsed.tournament === "object" ? parsed.tournament : {}),
        groups: parsed.tournament?.groups ?? base.tournament.groups,
        matches: Array.isArray(parsed.tournament?.matches) ? parsed.tournament.matches : [],
      },
    })
  );
}

function mergeMatches(parsed: ExtendedAppData): ExtendedAppData {
  ensureTournament(parsed);
  const existingMatches = parsed.tournament.matches;
  parsed.tournament.matches = ALL_MATCHES.map((m) => {
    const existing = existingMatches.find((x) => x.id === m.id);
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
    return normalizeAppData(JSON.parse(raw));
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

  const normalized = normalizeAppData(data.data);
  if (!data.data || !(data.data as Partial<ExtendedAppData>).tournament) {
    await writeSupabaseData(normalized);
  }
  return normalized;
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
  const participants = data.participants ?? [];

  if (participants.length >= data.tournament.maxParticipants) {
    throw new Error("S'ha assolit el màxim de participants");
  }
  if (participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
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

  data.participants = [...participants, participant];
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

export function getPredictionWindows(data: ExtendedAppData): PredictionWindows {
  return mergePredictionWindows(data.predictionWindows);
}

export async function updatePredictionWindows(
  adminPin: string,
  updates: Partial<PredictionWindows>
): Promise<PredictionWindows> {
  const data = await readData();
  if (data.adminPin !== adminPin) throw new Error("PIN d'admin incorrecte");
  data.predictionWindows = mergePredictionWindows({
    ...getPredictionWindows(data),
    ...updates,
  });
  await writeData(data);
  return data.predictionWindows;
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

  const windows = getPredictionWindows(data);

  for (const [matchId, pred] of Object.entries(matches)) {
    const match = data.tournament.matches.find((m) => m.id === matchId);
    if (!match) continue;
    if (match.locked) continue;
    if (match.phase === "groups" && !canEditGroupPredictions(windows)) continue;
    if (isKnockoutPhase(match.phase) && !canEditKnockoutPredictions(windows)) continue;
    p.matches[matchId] = pred;
  }

  const syncedGroups = buildGroupPredictionsFromMatches(
    data.tournament.groups,
    data.tournament.matches,
    p.matches
  );

  const defaultSpecial: SpecialPredictions = {
    champion: "",
    runnerUp: "",
    thirdPlace: "",
    topScorer: "",
    topAssists: "",
    totalGoals: 150,
    groups: syncedGroups,
  };

  const prev = p.special ?? defaultSpecial;

  if (special) {
    p.special = {
      ...prev,
      ...special,
      groups: syncedGroups,
    };
  } else {
    p.special = { ...prev, groups: syncedGroups };
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
