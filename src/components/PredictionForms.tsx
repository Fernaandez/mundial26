"use client";

import { Match, Group, SpecialPredictions, Phase } from "@/types";
import { getTeamInfo } from "@/data/world-cup-2026";
import { PHASE_LABELS } from "@/data/world-cup-2026";
import { TeamFlag } from "@/components/TeamFlag";
import { MatchKickoff } from "@/components/MatchKickoff";
import { MatchScoreboard } from "@/components/MatchScoreboard";
import { GroupStandingsTable } from "@/components/GroupStandingsTable";
import { computeGroupStanding, computeGroupStandingFromPredictions, computeThirdQualifierGroups } from "@/lib/standings";
import { derivePodiumFromPredictions, DEFAULT_MUNDIAL_FIELDS } from "@/lib/mundial";
import { FIFA_TOP_10_CODES, RULES_NOTES } from "@/data/rules-config";
import { isMatchFinished } from "@/lib/knockout";

interface MatchCardProps {
  match: Match;
  prediction?: { home: number; away: number };
  onChange: (home: number, away: number) => void;
  disabled?: boolean;
}

export function MatchCard({ match, prediction, onChange, disabled }: MatchCardProps) {
  const home = getTeamInfo(match.homeTeam);
  const away = getTeamInfo(match.awayTeam);
  const locked = match.locked || disabled;
  const finished = isMatchFinished(match);

  return (
    <div className={`card-glass rounded-xl p-3 sm:p-4 ${locked && !finished ? "opacity-60" : ""}`}>
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

      {!finished && (
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <TeamFlag code={home.code} size={26} />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={prediction?.home ?? ""}
            onChange={(e) => onChange(parseInt(e.target.value) || 0, prediction?.away ?? 0)}
            disabled={locked}
            className="score-input"
            placeholder="-"
            aria-label={`Gols ${home.name}`}
          />
          <span className="text-pitch-500 font-bold">:</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={prediction?.away ?? ""}
            onChange={(e) => onChange(prediction?.home ?? 0, parseInt(e.target.value) || 0)}
            disabled={locked}
            className="score-input"
            placeholder="-"
            aria-label={`Gols ${away.name}`}
          />
          <TeamFlag code={away.code} size={26} />
        </div>
      )}

      {finished && !locked && (
        <div className="mt-3 pt-3 border-t border-pitch-800/50">
          <div className="text-[10px] uppercase tracking-wider text-pitch-500 mb-2 text-center">La teva predicció</div>
          <div className="flex items-center justify-center gap-2">
            <TeamFlag code={home.code} size={20} />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              value={prediction?.home ?? ""}
              onChange={(e) => onChange(parseInt(e.target.value) || 0, prediction?.away ?? 0)}
              className="score-input w-12 h-10"
              placeholder="-"
            />
            <span className="text-pitch-500 font-bold">:</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              value={prediction?.away ?? ""}
              onChange={(e) => onChange(prediction?.home ?? 0, parseInt(e.target.value) || 0)}
              className="score-input w-12 h-10"
              placeholder="-"
            />
            <TeamFlag code={away.code} size={20} />
          </div>
        </div>
      )}
    </div>
  );
}

interface GroupSectionProps {
  group: Group;
  groups: Group[];
  matches: Match[];
  predictions: Record<string, { home: number; away: number }>;
  onChange: (matchId: string, home: number, away: number) => void;
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
            onChange={(h, a) => onChange(m.id, h, a)}
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
}

const SHORT_LABELS: Partial<Record<Phase, string>> = {
  special: "Especials",
  groups: "Grups",
  round32: "16ens",
  round16: "8ens",
  quarter: "Quarts",
  semi: "Semis",
  third: "3r",
  final: "Final",
};

export function PhaseTabs({ phases, active, onChange }: PhaseTabsProps) {
  return (
    <div className="phase-tabs-scroll -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-8">
      <div className="flex gap-2 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
        {phases.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              active === p ? "tab-active" : "tab-inactive"
            }`}
          >
            <span className="sm:hidden">{SHORT_LABELS[p] ?? PHASE_LABELS[p]}</span>
            <span className="hidden sm:inline">{PHASE_LABELS[p]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface MundialFormProps {
  special?: SpecialPredictions;
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

export function MundialForm({ special, allTeams, matches, predictions, onChange, disabled, readOnly, groups }: MundialFormProps) {
  const current: SpecialPredictions = {
    ...DEFAULT_MUNDIAL_FIELDS,
    ...special,
    groups: special?.groups ?? emptyGroups(groups),
  };

  const podium = derivePodiumFromPredictions(matches, predictions);

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
            Prediccions especials de la fase de grups i del torneig. Campió i 3r lloc es calculen
            de les teves prediccions d&apos;eliminatòries (pestanya Elim.).
          </p>
        </div>
      )}

      {(podium.champion || podium.runnerUp || podium.thirdPlace) && (
        <div className="card-glass rounded-2xl p-4 sm:p-6 border border-pitch-600/30">
          <h3 className="font-display text-lg text-pitch-400 mb-3">PODI (de les teves eliminatòries)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <PodiumPreview label="🏆 Campió" code={podium.champion} />
            <PodiumPreview label="🥈 Subcampió" code={podium.runnerUp} />
            <PodiumPreview label="🥉 3r lloc" code={podium.thirdPlace} />
          </div>
        </div>
      )}

      <div className="card-glass rounded-2xl p-4 sm:p-6">
        <h3 className="font-display text-xl sm:text-2xl text-gold-500 mb-2">FASE DE GRUPS</h3>
        <p className="text-xs text-pitch-500 mb-4">{RULES_NOTES.surpriseTeam.split(".")[0]}.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectTeam
            label="🚫 3r que NO passa (1 dels 8 millors 3rs)"
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
        <p className="text-xs text-pitch-500 mb-4">{RULES_NOTES.youngPlayer}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="⭐ Millor jugador (MVP)" value={current.mvp} onChange={(v) => update("mvp", v)} disabled={disabled} placeholder="Nom del jugador" />
          <TextField label="🌟 Millor jugador jove" value={current.youngMvp} onChange={(v) => update("youngMvp", v)} disabled={disabled} placeholder="Nom del jugador" />
          <TextField label="⚽ Màxim golejador" value={current.topScorer} onChange={(v) => update("topScorer", v)} disabled={disabled} placeholder="Nom del jugador" />
          <TextField label="🎯 Màxim assistent" value={current.topAssists} onChange={(v) => update("topAssists", v)} disabled={disabled} placeholder="Nom del jugador" />
          <TextField label="🧤 Millor porter" value={current.goldenGlove} onChange={(v) => update("goldenGlove", v)} disabled={disabled} placeholder="Nom del porter" />
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
            <p className="text-[10px] text-pitch-500 mt-1">Només top 10 FIFA · ha de quedar fora abans dels vuitens (8ens)</p>
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
