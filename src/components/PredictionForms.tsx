"use client";

import { Match, Group, SpecialPredictions, Phase } from "@/types";
import { getTeamInfo } from "@/data/world-cup-2026";
import { PHASE_LABELS } from "@/data/world-cup-2026";
import { TeamFlag } from "@/components/TeamFlag";

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

  return (
    <div className={`card-glass rounded-xl p-3 sm:p-4 ${locked ? "opacity-60" : ""}`}>
      {match.label && (
        <div className="text-xs text-pitch-500 mb-2 uppercase tracking-wider truncate">{match.label}</div>
      )}

      {/* Mobile layout */}
      <div className="sm:hidden space-y-2">
        <TeamScoreRow
          code={home.code}
          name={home.name}
          score={prediction?.home ?? ""}
          onScoreChange={(v) => onChange(v, prediction?.away ?? 0)}
          locked={locked}
        />
        <div className="text-center text-pitch-600 font-bold text-sm">VS</div>
        <TeamScoreRow
          code={away.code}
          name={away.name}
          score={prediction?.away ?? ""}
          onScoreChange={(v) => onChange(prediction?.home ?? 0, v)}
          locked={locked}
        />
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0 text-right flex items-center justify-end gap-2">
          <TeamFlag code={home.code} size={28} />
          <span className="font-medium text-base">{home.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
        </div>
        <div className="flex-1 min-w-0 text-left flex items-center gap-2">
          <span className="font-medium text-base">{away.name}</span>
          <TeamFlag code={away.code} size={28} />
        </div>
      </div>

      {match.homeScore !== undefined && match.awayScore !== undefined && (
        <div className="text-center mt-2 text-sm text-gold-400">
          Resultat real: {match.homeScore} - {match.awayScore}
        </div>
      )}
    </div>
  );
}

function TeamScoreRow({
  code,
  name,
  score,
  onScoreChange,
  locked,
}: {
  code: string;
  name: string;
  score: number | string;
  onScoreChange: (v: number) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <TeamFlag code={code} size={24} />
      <span className="font-medium text-sm flex-1 min-w-0 truncate">{name}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={20}
        value={score}
        onChange={(e) => onScoreChange(parseInt(e.target.value) || 0)}
        disabled={locked}
        className="score-input shrink-0"
        placeholder="-"
        aria-label={`Gols ${name}`}
      />
    </div>
  );
}

interface GroupSectionProps {
  group: Group;
  matches: Match[];
  predictions: Record<string, { home: number; away: number }>;
  onChange: (matchId: string, home: number, away: number) => void;
  disabled?: boolean;
}

export function GroupSection({ group, matches, predictions, onChange, disabled }: GroupSectionProps) {
  const groupMatches = matches.filter((m) => m.groupId === group.id);

  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="font-display text-xl sm:text-2xl text-pitch-400 mb-3 sm:mb-4">{group.name}</h3>
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
  round32: "32ens",
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

interface SpecialFormProps {
  groups: Group[];
  special?: SpecialPredictions;
  allTeams: { code: string; name: string; iso: string }[];
  onChange: (special: SpecialPredictions) => void;
  disabled?: boolean;
}

export function SpecialForm({ groups, special, allTeams, onChange, disabled }: SpecialFormProps) {
  const current: SpecialPredictions = special ?? {
    champion: "",
    runnerUp: "",
    thirdPlace: "",
    topScorer: "",
    totalGoals: 150,
    groups: groups.map((g) => ({
      groupId: g.id,
      positions: [g.teams[0].code, g.teams[1].code, g.teams[2].code, g.teams[3].code] as [string, string, string, string],
      thirdQualifies: false,
    })),
  };

  function update(field: keyof SpecialPredictions, value: string | number) {
    onChange({ ...current, [field]: value });
  }

  function updateGroup(groupId: string, pos: number, team: string) {
    const newGroups = current.groups.map((g) => {
      if (g.groupId !== groupId) return g;
      const positions = [...g.positions] as [string, string, string, string];
      positions[pos] = team;
      return { ...g, positions };
    });
    onChange({ ...current, groups: newGroups });
  }

  function toggleThirdQualifies(groupId: string) {
    const newGroups = current.groups.map((g) =>
      g.groupId === groupId ? { ...g, thirdQualifies: !g.thirdQualifies } : g
    );
    onChange({ ...current, groups: newGroups });
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="card-glass rounded-2xl p-4 sm:p-6">
        <h3 className="font-display text-xl sm:text-2xl text-gold-500 mb-4">PODI FINAL</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectTeam label="🏆 Campió" value={current.champion} teams={allTeams} onChange={(v) => update("champion", v)} disabled={disabled} />
          <SelectTeam label="🥈 Subcampió" value={current.runnerUp} teams={allTeams} onChange={(v) => update("runnerUp", v)} disabled={disabled} />
          <SelectTeam label="🥉 3r lloc" value={current.thirdPlace} teams={allTeams} onChange={(v) => update("thirdPlace", v)} disabled={disabled} />
        </div>
      </div>

      <div className="card-glass rounded-2xl p-4 sm:p-6">
        <h3 className="font-display text-xl sm:text-2xl text-gold-500 mb-4">BONUS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-pitch-300 mb-2">Màxim golejador</label>
            <input
              type="text"
              value={current.topScorer}
              onChange={(e) => update("topScorer", e.target.value)}
              disabled={disabled}
              placeholder="Nom del jugador"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-pitch-300 mb-2">Total gols del torneig</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={500}
              value={current.totalGoals}
              onChange={(e) => update("totalGoals", parseInt(e.target.value) || 0)}
              disabled={disabled}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="card-glass rounded-2xl p-4 sm:p-6">
        <h3 className="font-display text-xl sm:text-2xl text-gold-500 mb-4">CLASSIFICACIONS DE GRUPS</h3>
        <p className="text-sm text-pitch-400 mb-4 sm:mb-6">Selecciona l&apos;ordre de cada grup. Marca si el 3r passa.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {groups.map((group) => {
            const gp = current.groups.find((g) => g.groupId === group.id)!;
            return (
              <div key={group.id} className="bg-pitch-950/50 rounded-xl p-3 sm:p-4">
                <h4 className="font-display text-lg sm:text-xl text-pitch-400 mb-3">{group.name}</h4>
                {[0, 1, 2, 3].map((pos) => (
                  <div key={pos} className="flex items-center gap-2 mb-2">
                    <span className="w-6 text-pitch-500 font-bold shrink-0">{pos + 1}.</span>
                    <select
                      value={gp.positions[pos]}
                      onChange={(e) => updateGroup(group.id, pos, e.target.value)}
                      disabled={disabled}
                      className="flex-1 min-w-0 px-3 py-2.5 bg-pitch-900 border border-pitch-700 rounded-lg text-sm"
                    >
                      {group.teams.map((t) => (
                        <option key={t.code} value={t.code}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
                <label className="flex items-start gap-2 mt-3 text-sm text-pitch-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gp.thirdQualifies}
                    onChange={() => toggleThirdQualifies(group.id)}
                    disabled={disabled}
                    className="rounded mt-1 shrink-0"
                  />
                  <span>El 3r classificat passa d&apos;eliminatoria</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="input-field"
      >
        <option value="">— Selecciona —</option>
        {teams.map((t) => (
          <option key={t.code} value={t.code}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}
