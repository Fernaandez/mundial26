"use client";

import { useState, useEffect } from "react";
import { Match, Group, SpecialPredictions, Phase } from "@/types";
import { getTeamInfo } from "@/data/world-cup-2026";
import { PHASE_LABELS, PHASE_SHORT } from "@/data/phase-labels";
import { TeamFlag } from "@/components/TeamFlag";
import { MatchKickoff } from "@/components/MatchKickoff";
import { MatchScoreboard } from "@/components/MatchScoreboard";
import { GroupStandingsTable } from "@/components/GroupStandingsTable";
import { computeGroupStanding, computeGroupStandingFromPredictions, computeThirdQualifierGroups } from "@/lib/standings";
import { derivePodiumFromPredictions, DEFAULT_MUNDIAL_FIELDS, resolvePodiumPredictions } from "@/lib/mundial";
import { FIFA_TOP_10_CODES, RULES_NOTES } from "@/data/rules-config";
import { isMatchFinished } from "@/lib/knockout";

interface MatchCardProps {
  match: Match;
  prediction?: { home: number; away: number };
  onChange: (pred: { home: number; away: number } | null) => void;
  disabled?: boolean;
}

function parseScoreInput(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = parseInt(trimmed, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function ScoreInputs({
  homeCode,
  awayCode,
  homeName,
  awayName,
  prediction,
  onChange,
  disabled,
  compact,
}: {
  homeCode: string;
  awayCode: string;
  homeName: string;
  awayName: string;
  prediction?: { home: number; away: number };
  onChange: (pred: { home: number; away: number } | null) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [homeText, setHomeText] = useState(
    prediction?.home !== undefined ? String(prediction.home) : ""
  );
  const [awayText, setAwayText] = useState(
    prediction?.away !== undefined ? String(prediction.away) : ""
  );

  useEffect(() => {
    setHomeText(prediction?.home !== undefined ? String(prediction.home) : "");
    setAwayText(prediction?.away !== undefined ? String(prediction.away) : "");
  }, [prediction?.home, prediction?.away]);

  function emit(hText: string, aText: string) {
    const home = parseScoreInput(hText);
    const away = parseScoreInput(aText);
    if (home === null && away === null) {
      onChange(null);
    } else if (home !== null && away !== null) {
      onChange({ home, away });
    }
  }

  function onHomeChange(raw: string) {
    setHomeText(raw);
    emit(raw, awayText);
  }

  function onAwayChange(raw: string) {
    setAwayText(raw);
    emit(homeText, raw);
  }

  const inputClass = compact ? "score-input w-12 h-10" : "score-input";

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <TeamFlag code={homeCode} size={compact ? 20 : 26} />
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={20}
        value={homeText}
        onChange={(e) => onHomeChange(e.target.value)}
        disabled={disabled}
        className={inputClass}
        placeholder="-"
        aria-label={`Gols ${homeName}`}
      />
      <span className="text-pitch-500 font-bold text-sm shrink-0">vs</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={20}
        value={awayText}
        onChange={(e) => onAwayChange(e.target.value)}
        disabled={disabled}
        className={inputClass}
        placeholder="-"
        aria-label={`Gols ${awayName}`}
      />
      <TeamFlag code={awayCode} size={compact ? 20 : 26} />
    </div>
  );
}

export function MatchCard({ match, prediction, onChange, disabled }: MatchCardProps) {
  const home = getTeamInfo(match.homeTeam);
  const away = getTeamInfo(match.awayTeam);
  const inputDisabled = disabled;
  const finished = isMatchFinished(match);

  return (
    <div className={`card-glass rounded-xl p-3 sm:p-4 ${inputDisabled && !finished ? "opacity-60" : ""}`}>
      <MatchKickoff match={match} className="mb-2" />
      {match.label && (
        <div className="text-xs text-pitch-500 mb-2 uppercase tracking-wider truncate">{match.label}</div>
      )}

      {finished && (
        <div className="mb-3 pb-3 border-b border-pitch-800/50">
          <div className="text-[10px] uppercase tracking-wider text-gold-500 mb-2 text-center">
            Resultat oficial
          </div>
          <MatchScoreboard
            match={match}
            variant="card"
            showKickoff={false}
            prediction={prediction}
            showPrediction={!!prediction}
          />
        </div>
      )}

      <div className={finished ? "mt-0" : ""}>
        {finished && (
          <div className="text-[10px] uppercase tracking-wider text-pitch-500 mb-2 text-center">
            La teva predicció
          </div>
        )}
        <ScoreInputs
          homeCode={home.code}
          awayCode={away.code}
          homeName={home.name}
          awayName={away.name}
          prediction={prediction}
          onChange={onChange}
          disabled={inputDisabled}
          compact={finished}
        />
      </div>
      {match.locked && !inputDisabled && (
        <p className="text-[10px] text-amber-400/90 text-center mt-2">
          Resultat oficial ja introduït — la predicció no es pot desar per aquest partit.
        </p>
      )}
    </div>
  );
}

interface GroupSectionProps {
  group: Group;
  groups: Group[];
  matches: Match[];
  predictions: Record<string, { home: number; away: number }>;
  onChange: (matchId: string, pred: { home: number; away: number } | null) => void;
  disabled?: boolean;
  predictionLabel?: string;
  thirdQualifierGroups?: Set<string>;
}

export function GroupSection({
  group,
  groups,
  matches,
  predictions,
  onChange,
  disabled,
  predictionLabel = "La teva predicció",
  thirdQualifierGroups,
}: GroupSectionProps) {
  const groupMatches = matches.filter((m) => m.groupId === group.id);
  const predictedStanding = computeGroupStandingFromPredictions(group, matches, predictions);
  const liveStanding = computeGroupStanding(group, matches);
  const thirdQualifiers = thirdQualifierGroups ?? computeThirdQualifierGroups(groups, matches, predictions);

  return (
    <div className="mb-8 sm:mb-10">
      {liveStanding.playedMatches > 0 && (
        <div className="mb-4">
          <p className="text-xs text-pitch-500 mb-1.5 uppercase tracking-wider">Resultats reals</p>
          <GroupStandingsTable standing={liveStanding} />
        </div>
      )}
      <div className="mb-4">
        {liveStanding.playedMatches > 0 && (
          <p className="text-xs text-gold-500/80 mb-1.5 uppercase tracking-wider">{predictionLabel}</p>
        )}
        <GroupStandingsTable
          standing={predictedStanding}
          showThirdQualifier
          thirdQualifies={thirdQualifiers.has(group.id) && predictedStanding.playedMatches === predictedStanding.totalMatches}
        />
      </div>
      <h3 className="font-display text-xl sm:text-2xl text-pitch-400 mb-3 sm:mb-4">Partits</h3>
      <div className="grid gap-3">
        {groupMatches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            prediction={predictions[m.id]}
            onChange={(pred) => onChange(m.id, pred)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

interface PhaseTabsProps {
  phases: Phase[];
  active: Phase;
  onChange: (phase: Phase) => void;
  isOpen?: (phase: Phase) => boolean;
}

const SHORT_LABELS = PHASE_SHORT;

export function PhaseTabs({ phases, active, onChange, isOpen }: PhaseTabsProps) {
  return (
    <div className="phase-tabs-scroll -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-8">
      <div className="flex gap-2 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
        {phases.map((p) => {
          const open = isOpen?.(p) ?? true;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                active === p ? "tab-active" : open ? "tab-inactive" : "tab-inactive opacity-50"
              }`}
            >
              <span className="sm:hidden">
                {!open && "🔒 "}
                {SHORT_LABELS[p] ?? PHASE_LABELS[p]}
              </span>
              <span className="hidden sm:inline">
                {!open && "🔒 "}
                {PHASE_LABELS[p]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MundialFormProps {
  special?: SpecialPredictions;
  bracketPicks?: Record<string, string>;
  allTeams: { code: string; name: string; iso: string }[];
  matches: Match[];
  predictions: Record<string, { home: number; away: number }>;
  onChange: (special: SpecialPredictions) => void;
  disabled?: boolean;
  readOnly?: boolean;
  groups: Group[];
}

function emptyGroups(groups: Group[]) {
  return groups.map((g) => ({
    groupId: g.id,
    positions: [g.teams[0].code, g.teams[1].code, g.teams[2].code, g.teams[3].code] as [string, string, string, string],
    thirdQualifies: false,
  }));
}

export function MundialForm({
  special,
  bracketPicks = {},
  allTeams,
  matches,
  predictions,
  onChange,
  disabled,
  readOnly,
  groups,
}: MundialFormProps) {
  const current: SpecialPredictions = {
    ...DEFAULT_MUNDIAL_FIELDS,
    ...special,
    groups: special?.groups ?? emptyGroups(groups),
  };

  const savedPodium = resolvePodiumPredictions(special, bracketPicks);
  const scoreSuggestion = derivePodiumFromPredictions(matches, predictions);

  const top10Teams = allTeams.filter((t) => (FIFA_TOP_10_CODES as readonly string[]).includes(t.code));
  const revelationTeams = allTeams.filter((t) => !(FIFA_TOP_10_CODES as readonly string[]).includes(t.code));

  function update(field: keyof Omit<SpecialPredictions, "groups">, value: string | number) {
    onChange({ ...current, [field]: value });
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {!readOnly && (
        <div className="card-glass rounded-xl p-4 border border-gold-500/20">
          <p className="text-sm text-pitch-300">
            Jugadors i seleccions especials. Campió i 3r lloc es trien a la pestanya <strong className="text-pitch-100">Quadre</strong>.
          </p>
        </div>
      )}

      <div className="card-glass rounded-2xl p-4 sm:p-6">
        <h3 className="font-display text-xl sm:text-2xl text-gold-500 mb-2">PODI</h3>
        <p className="text-xs text-pitch-500 mb-4">
          {readOnly
            ? "Campió i 3r segons el quadre eliminatori guardat."
            : "Tria campió i 3r lloc a la pestanya Quadre (final i partit del 3r)."}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PodiumPreview label="🏆 Campió" code={savedPodium.champion} />
          <PodiumPreview label="🥉 3r lloc" code={savedPodium.thirdPlace} />
        </div>
        {!readOnly && (scoreSuggestion.champion || scoreSuggestion.thirdPlace) && (
          <p className="text-xs text-pitch-500 mt-3">
            Suggeriment segons marcadors (no puntua):{" "}
            {scoreSuggestion.champion && getTeamInfo(scoreSuggestion.champion).name}
            {scoreSuggestion.thirdPlace && ` · 3r: ${getTeamInfo(scoreSuggestion.thirdPlace).name}`}
          </p>
        )}
      </div>

      <div className="card-glass rounded-2xl p-4 sm:p-6">
        <h3 className="font-display text-xl sm:text-2xl text-gold-500 mb-2">FASE DE GRUPS</h3>
        <p className="text-xs text-pitch-500 mb-4">
          Prediccions sobre la fase de grups (no confondre amb el podi del torneig).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectTeam
            label="🚫 3r que NO passa (dels 4 que queden fora)"
            value={current.nonQualifyingThird}
            teams={allTeams}
            onChange={(v) => update("nonQualifyingThird", v)}
            disabled={disabled}
          />
          <SelectTeam
            label="⚽ Selecció amb més gols (GF)"
            value={current.mostGroupGoals}
            teams={allTeams}
            onChange={(v) => update("mostGroupGoals", v)}
            disabled={disabled}
          />
          <SelectTeam
            label="🥅 Selecció amb més gols encaixats (GC)"
            value={current.mostGroupGoalsConceded}
            teams={allTeams}
            onChange={(v) => update("mostGroupGoalsConceded", v)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="card-glass rounded-2xl p-4 sm:p-6">
        <h3 className="font-display text-xl sm:text-2xl text-gold-500 mb-4">MVP I JUGADORS</h3>
        <p className="text-xs text-pitch-500 mb-4">{RULES_NOTES.youngPlayer} {RULES_NOTES.topScorerTie}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="⭐ Millor jugador (MVP)" value={current.mvp} onChange={(v) => update("mvp", v)} disabled={disabled} placeholder="Nom i Cognom" />
          <TextField label="🌟 Millor jugador jove" value={current.youngMvp} onChange={(v) => update("youngMvp", v)} disabled={disabled} placeholder="Nom i Cognom" />
          <TextField label="⚽ Màxim golejador" value={current.topScorer} onChange={(v) => update("topScorer", v)} disabled={disabled} placeholder="Nom i Cognom" />
          <TextField label="🎯 Màxim assistent" value={current.topAssists} onChange={(v) => update("topAssists", v)} disabled={disabled} placeholder="Nom i Cognom" />
          <TextField label="🧤 Millor porter" value={current.goldenGlove} onChange={(v) => update("goldenGlove", v)} disabled={disabled} placeholder="Nom i Cognom" />
        </div>
      </div>

      <div className="card-glass rounded-2xl p-4 sm:p-6">
        <h3 className="font-display text-xl sm:text-2xl text-gold-500 mb-4">SELECCIONS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <SelectTeam label="🎲 Selecció revelació" value={current.surpriseTeam} teams={revelationTeams} onChange={(v) => update("surpriseTeam", v)} disabled={disabled} />
            <p className="text-[10px] text-pitch-500 mt-1">Fora del top 10 FIFA · ha d&apos;arribar com a mínim als quarts</p>
          </div>
          <div>
            <SelectTeam label="💥 Selecció decepció" value={current.disappointmentTeam} teams={top10Teams} onChange={(v) => update("disappointmentTeam", v)} disabled={disabled} />
            <p className="text-[10px] text-pitch-500 mt-1">Només top 10 FIFA · ha de quedar fora abans dels vuitens</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PodiumPreview({ label, code }: { label: string; code: string }) {
  const info = code ? getTeamInfo(code) : null;
  return (
    <div className="flex items-center gap-2 bg-pitch-950/50 rounded-xl p-3">
      {code && <TeamFlag code={code} size={20} />}
      <div>
        <div className="text-pitch-500 text-xs">{label}</div>
        <div className="text-pitch-100 font-medium">{info?.name ?? "—"}</div>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-pitch-300 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
}

function SelectTeam({
  label,
  value,
  teams,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  teams: { code: string; name: string; iso: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-pitch-300 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        {value && <TeamFlag code={value} size={22} />}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="input-field flex-1"
        >
          <option value="">— Selecciona —</option>
          {teams.map((t) => (
            <option key={t.code} value={t.code}>{t.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
