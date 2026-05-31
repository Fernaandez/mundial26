import fs from "fs";
import path from "path";
import { AppData, Participant, Match, SpecialPredictions, Phase } from "@/types";
import { TOURNAMENT_CONFIG, ALL_MATCHES } from "@/data/world-cup-2026";
import { getSupabase, useSupabase, isCloudDeploy, getStorageConfigError } from "@/lib/supabase";
import {
  PredictionWindows,
  DEFAULT_PREDICTION_WINDOWS,
  mergePredictionWindows,
  canEditSpecialPredictions,
  isKnockoutPhase,
} from "@/lib/phases";
import { canEditMatchPrediction, canEditPhasePredictions, canEditFullBracket } from "@/lib/prediction-deadlines";
import { propagateKnockoutWinner } from "@/lib/bracket-tree";
import { buildGroupPredictionsFromMatches, buildGroupStandingsActuals } from "@/lib/standings";
import { DEFAULT_MUNDIAL_FIELDS, normalizeSpecialPredictions, applyBracketPodiumToSpecial } from "@/lib/mundial";
import { computeGroupStageStats } from "@/lib/group-stats";
import { deriveAdvancementSets } from "@/lib/knockout-advancement";
import { getMatchWinner } from "@/lib/knockout";
import type { SpecialActuals } from "@/lib/scoring";

const ROW_ID = 1;
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "quiniela.json");

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
          knockoutWinner: existing.knockoutWinner,
          etHomeScore: existing.etHomeScore,
          etAwayScore: existing.etAwayScore,
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
  locked: boolean,
  options?: {
    knockoutWinner?: string;
    etHomeScore?: number;
    etAwayScore?: number;
  }
): Promise<Match> {
  const data = await readData();
  const match = data.tournament.matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Partit no trobat");

  match.homeScore = homeScore;
  match.awayScore = awayScore;
  match.locked = locked;

  const knockoutWinner = options?.knockoutWinner;
  const etHome = options?.etHomeScore;
  const etAway = options?.etAwayScore;
  const hasEt = etHome !== undefined && etAway !== undefined;

  if (hasEt) {
    match.etHomeScore = etHome;
    match.etAwayScore = etAway;
  } else {
    match.etHomeScore = undefined;
    match.etAwayScore = undefined;
  }

  if (isKnockoutPhase(match.phase)) {
    if (hasEt && etHome !== etAway) {
      match.knockoutWinner = etHome > etAway ? match.homeTeam : match.awayTeam;
    } else if (homeScore === awayScore) {
      if (!knockoutWinner) {
        throw new Error("En eliminatòria, indica qui passa de ronda en cas d'empat a 90 min");
      }
      if (knockoutWinner !== match.homeTeam && knockoutWinner !== match.awayTeam) {
        throw new Error("El guanyador ha de ser un dels dos equips del partit");
      }
      match.knockoutWinner = knockoutWinner;
    } else {
      match.knockoutWinner = undefined;
    }
  } else {
    match.knockoutWinner = undefined;
    match.etHomeScore = undefined;
    match.etAwayScore = undefined;
  }

  const winner = getMatchWinner(match);
  if (winner && winner !== "TBD") {
    propagateKnockoutWinner(data.tournament.matches, matchId);
  }

  if (match.phase === "groups") {
    data.specialActuals = {
      ...data.specialActuals,
      groupStandings: buildGroupStandingsActuals(data.tournament.groups, data.tournament.matches),
    };
  }

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

export interface SavePredictionsResult {
  participant: Participant;
  warnings: string[];
}

export async function savePredictions(
  participantId: string,
  pin: string,
  matches: Record<string, { home: number; away: number }>,
  special?: SpecialPredictions,
  bracketPicks?: Record<string, string>
): Promise<SavePredictionsResult> {
  const data = await readData();
  const p = data.participants.find((x) => x.id === participantId);
  if (!p || p.pin !== pin) throw new Error("Accés denegat");

  const windows = getPredictionWindows(data);
  const allMatches = data.tournament.matches;
  const warnings: string[] = [];
  let skippedLocked = 0;
  let skippedPhase = 0;

  for (const [matchId, pred] of Object.entries(matches)) {
    const match = allMatches.find((m) => m.id === matchId);
    if (!match) continue;
    if (!canEditMatchPrediction(match, allMatches, windows)) {
      if (match.locked) skippedLocked++;
      else skippedPhase++;
      continue;
    }
    p.matches[matchId] = pred;
  }

  const syncedGroups = buildGroupPredictionsFromMatches(
    data.tournament.groups,
    data.tournament.matches,
    p.matches
  );

  const defaultSpecial: SpecialPredictions = {
    ...DEFAULT_MUNDIAL_FIELDS,
    groups: syncedGroups,
  };

  const prev = p.special ?? defaultSpecial;
  let merged: SpecialPredictions = { ...prev, groups: syncedGroups };

  if (special && canEditSpecialPredictions(windows)) {
    merged = { ...merged, ...special, groups: syncedGroups };
  }

  const bracketEditable = canEditFullBracket(windows);

  if (bracketPicks !== undefined) {
    const prevPicks = p.bracketPicks ?? {};
    const mergedPicks = { ...prevPicks };
    let bracketSkipped = 0;

    for (const [matchId, pick] of Object.entries(bracketPicks)) {
      const match = allMatches.find((m) => m.id === matchId);
      if (!match || !isKnockoutPhase(match.phase)) continue;
      if (bracketEditable) {
        mergedPicks[matchId] = pick;
      } else {
        bracketSkipped++;
      }
    }

    if (Object.keys(mergedPicks).length > 0 || Object.keys(prevPicks).length > 0) {
      p.bracketPicks = mergedPicks;
      merged = applyBracketPodiumToSpecial(merged, mergedPicks);
    }

    if (bracketSkipped > 0) {
      warnings.push(`${bracketSkipped} tria/es del quadre — el quadre sencer només es pot editar durant la finestra de Setzens.`);
    }
  }

  p.special = normalizeSpecialPredictions(merged)!;

  if (skippedLocked > 0) {
    warnings.push(
      `${skippedLocked} partit(s) ja tancat(s) per resultat oficial — no s'han actualitzat.`
    );
  }
  if (skippedPhase > 0) {
    warnings.push(
      `${skippedPhase} partit(s) d'una fase tancada — no s'han actualitzat.`
    );
  }

  await writeData(data);
  return { participant: p, warnings };
}

export async function markParticipantAcknowledged(participantId: string, adminPin: string): Promise<void> {
  const data = await readData();
  if (data.adminPin !== adminPin) throw new Error("PIN d'admin incorrecte");
  const p = data.participants.find((x) => x.id === participantId);
  if (!p) throw new Error("Participant no trobat");
  p.entryFeePaid = true;
  await writeData(data);
}

/** @deprecated usa markParticipantAcknowledged */
export const markEntryPaid = markParticipantAcknowledged;

export async function deleteParticipant(participantId: string, adminPin: string): Promise<void> {
  const data = await readData();
  if (data.adminPin !== adminPin) throw new Error("PIN d'admin incorrecte");
  const index = data.participants.findIndex((x) => x.id === participantId);
  if (index === -1) throw new Error("Participant no trobat");
  data.participants.splice(index, 1);
  await writeData(data);
}

/** Grups oberts + eliminatòries obertes (mode proves) */
export async function openAllForTesting(adminPin: string): Promise<PredictionWindows> {
  return updatePredictionWindows(adminPin, { groupsLocked: false, knockoutOpen: true, testMode: true });
}

/** Esborra participants, resultats i prediccions; deixa el torneig net per compartir */
export async function resetQuinielaData(adminPin: string): Promise<void> {
  const data = await readData();
  if (data.adminPin !== adminPin) throw new Error("PIN d'admin incorrecte");

  const fresh = defaultData();
  fresh.adminPin = data.adminPin;
  await writeData(fresh);
}

export async function saveSpecialActuals(adminPin: string, actuals: SpecialActuals): Promise<void> {
  const data = await readData();
  if (data.adminPin !== adminPin) throw new Error("PIN d'admin incorrecte");
  data.specialActuals = { ...data.specialActuals, ...actuals };
  await writeData(data);
}

export async function getSpecialActuals(): Promise<SpecialActuals | undefined> {
  const data = await readData();
  const { groups, matches } = data.tournament;
  const computed = buildGroupStandingsActuals(groups, matches);
  const groupStats = computeGroupStageStats(groups, matches);
  const advancement = deriveAdvancementSets(matches);
  const finalMatch = matches.find((m) => m.id === "final");
  const thirdMatch = matches.find((m) => m.id === "third");

  const hasGroupData = Object.values(computed).some((g) => g.complete);

  if (!data.specialActuals && !hasGroupData) return undefined;

  return {
    ...data.specialActuals,
    groupStandings: computed,
    nonQualifyingThird: groupStats.nonQualifyingThirds.length
      ? groupStats.nonQualifyingThirds
      : undefined,
    mostGroupGoals: groupStats.mostGoals ?? undefined,
    mostGroupGoalsConceded: groupStats.mostGoalsConceded ?? undefined,
    advancement,
    champion: finalMatch ? getMatchWinner(finalMatch) ?? undefined : data.specialActuals?.champion,
    thirdPlace: thirdMatch ? getMatchWinner(thirdMatch) ?? undefined : data.specialActuals?.thirdPlace,
  };
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
