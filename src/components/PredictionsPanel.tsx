"use client";

import { useState } from "react";
import Link from "next/link";
import { Match, Group, SpecialPredictions, Phase } from "@/types";
import { MatchCard, GroupSection, PhaseTabs, MundialForm } from "@/components/PredictionForms";
import { getAllTeams, PHASE_LABELS } from "@/data/world-cup-2026";
import {
  PredictionWindows,
  KNOCKOUT_PHASE_LIST,
  canEditGroupPredictions,
  canEditKnockoutPredictions,
  canEditSpecialPredictions,
} from "@/lib/phases";
import {
  computeBestThirdsRanking,
  computeThirdQualifierGroups,
  computeAllPredictedStandings,
} from "@/lib/standings";
import { BestThirdsPanel } from "@/components/BestThirdsPanel";
import { PredictionBracket } from "@/components/PredictionBracket";
import { countMundialFilled, MUNDIAL_TOTAL_FIELDS } from "@/lib/mundial";
import { DEFAULT_PREDICTION_WINDOWS } from "@/lib/phases";

type MainSection = "groups" | "knockout" | "bracket" | "mundial";

export interface PredictionsPanelProps {
  mode: "edit" | "view";
  participantName: string;
  participantId?: string;
  matches: Match[];
  groups: Group[];
  predictions: Record<string, { home: number; away: number }>;
  special?: SpecialPredictions;
  bracketPicks?: Record<string, string>;
  windows?: PredictionWindows;
  onPredictionChange?: (matchId: string, pred: { home: number; away: number } | null) => void;
  onSpecialChange?: (special: SpecialPredictions) => void;
  onBracketChange?: (picks: Record<string, string>) => void;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
  saveWarnings?: string[];
  backHref?: string;
  backLabel?: string;
}

export function PredictionsPanel({
  mode,
  participantName,
  participantId,
  matches,
  groups,
  predictions,
  special,
  bracketPicks = {},
  windows = DEFAULT_PREDICTION_WINDOWS,
  onPredictionChange,
  onSpecialChange,
  onBracketChange,
  onSave,
  saving = false,
  saved = false,
  saveWarnings = [],
  backHref = "/perfil",
  backLabel = "← Perfil",
}: PredictionsPanelProps) {
  const [mainSection, setMainSection] = useState<MainSection>("groups");
  const [activePhase, setActivePhase] = useState<Phase>("round32");

  const readOnly = mode === "view";
  const groupsEditable = !readOnly && canEditGroupPredictions(windows);
  const specialEditable = !readOnly && canEditSpecialPredictions(windows);
  const knockoutEditable = !readOnly && canEditKnockoutPredictions(windows);
  const showKnockout = readOnly || knockoutEditable;

  const groupMatchIds = matches.filter((m) => m.phase === "groups").map((m) => m.id);
  const knockoutMatchIds = matches.filter((m) => KNOCKOUT_PHASE_LIST.includes(m.phase)).map((m) => m.id);
  const groupPredicted = groupMatchIds.filter((id) => predictions[id]).length;
  const knockoutPredicted = knockoutMatchIds.filter((id) => predictions[id]).length;
  const bracketFilled = Object.keys(bracketPicks).length;
  const mundialFilled = countMundialFilled(special, bracketPicks);
  const mundialTotal = MUNDIAL_TOTAL_FIELDS.length;

  const phaseMatches = matches.filter((m) => m.phase === activePhase);

  const predictedStandings = computeAllPredictedStandings(groups, matches, predictions);
  const bestThirds = computeBestThirdsRanking(predictedStandings);
  const thirdQualifierGroups = computeThirdQualifierGroups(groups, matches, predictions);

  const canSave =
    !readOnly && (
      mainSection === "groups" ? groupsEditable :
      mainSection === "knockout" ? knockoutEditable :
      mainSection === "bracket" ? knockoutEditable :
      specialEditable
    );

  const sectionLabel =
    mainSection === "groups" ? `${groupPredicted}/${groupMatchIds.length} partits` :
    mainSection === "knockout" ? `${knockoutPredicted}/${knockoutMatchIds.length} marcadors` :
    mainSection === "bracket" ? `${bracketFilled} classificats` :
    `${mundialFilled}/${mundialTotal} prediccions`;

  const noopChange = () => {};

  function handleBracketPick(matchId: string, teamCode: string) {
    onBracketChange?.({ ...bracketPicks, [matchId]: teamCode });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <Link href={backHref} className="text-sm text-pitch-400 hover:text-pitch-200">{backLabel}</Link>
          <h1 className="font-display text-3xl sm:text-4xl text-pitch-400 mt-1">
            {readOnly ? "PREDICCIONS DE" : "PREDICCIONS"}
          </h1>
          <p className="text-pitch-300 truncate">{participantName}</p>
          {readOnly ? (
            <p className="text-xs text-pitch-500 mt-1">Només lectura — no es pot editar</p>
          ) : (
            <Link href="/torneig" className="text-xs text-gold-500 hover:text-gold-400 mt-1 inline-block">
              Veure classificacions i quadre →
            </Link>
          )}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-pitch-400">{sectionLabel}</span>
          {canSave && onSave && (
            <button onClick={onSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Desant..." : "Desar"}
            </button>
          )}
        </div>
      </div>

      {readOnly && participantId && (
        <div className="card-glass rounded-xl p-4 mb-6 border border-pitch-600/40 flex flex-wrap items-center justify-between gap-2">
          <p className="text-pitch-300 text-sm">
            Això és el que ha predit <strong className="text-white">{participantName}</strong>.
          </p>
          <Link href="/prediccions/altres" className="text-sm text-gold-500 hover:text-gold-400">
            Canviar participant →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <SectionTab
          active={mainSection === "groups"}
          onClick={() => setMainSection("groups")}
          title="Grups"
          subtitle={`${groupPredicted}/${groupMatchIds.length}`}
        />
        <SectionTab
          active={mainSection === "knockout"}
          onClick={() => { setMainSection("knockout"); setActivePhase("round32"); }}
          title="Marcadors"
          subtitle={`${knockoutPredicted}/${knockoutMatchIds.length}`}
          locked={!readOnly && !knockoutEditable}
        />
        <SectionTab
          active={mainSection === "bracket"}
          onClick={() => setMainSection("bracket")}
          title="Quadre"
          subtitle={`${bracketFilled} tries`}
          locked={!readOnly && !knockoutEditable}
        />
        <SectionTab
          active={mainSection === "mundial"}
          onClick={() => setMainSection("mundial")}
          title="Mundial"
          subtitle={`${mundialFilled}/${mundialTotal}`}
          locked={!readOnly && !specialEditable}
        />
      </div>

      {saved && !readOnly && saveWarnings.length === 0 && (
        <div className="bg-pitch-700/30 border border-pitch-500 text-pitch-200 px-4 py-3 rounded-xl mb-6 text-sm">
          Prediccions desades correctament!
        </div>
      )}

      {saveWarnings.length > 0 && !readOnly && (
        <div className="bg-amber-900/20 border border-amber-700/40 text-amber-100 px-4 py-3 rounded-xl mb-6 text-sm space-y-1">
          <p className="font-medium">Desat amb avisos:</p>
          {saveWarnings.map((w) => (
            <p key={w}>• {w}</p>
          ))}
        </div>
      )}

      {mainSection === "groups" && (
        <>
          {!groupsEditable && !readOnly && (
            <div className="card-glass rounded-xl p-4 mb-6 border border-pitch-600/40">
              <p className="text-pitch-200 font-medium">Fase de grups tancada</p>
              <p className="text-pitch-400 text-sm mt-1">Només lectura.</p>
            </div>
          )}
          {!readOnly && (
            <p className="text-sm text-pitch-400 mb-4">
              La classificació s&apos;actualitza al moment en omplir cada marcador (GF, GC, DG, Pts).
            </p>
          )}
          <BestThirdsPanel entries={bestThirds} variant="prediction" />
          <div>
            {groups.map((g) => (
              <GroupSection
                key={g.id}
                group={g}
                groups={groups}
                matches={matches}
                predictions={predictions}
                onChange={onPredictionChange ?? noopChange}
                disabled={readOnly || !groupsEditable}
                predictionLabel={readOnly ? "Predicció" : "La teva predicció"}
                thirdQualifierGroups={thirdQualifierGroups}
              />
            ))}
          </div>
        </>
      )}

      {mainSection === "knockout" && (
        <>
          {!showKnockout ? (
            <div className="card-glass rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="font-display text-2xl text-pitch-300 mb-3">Eliminatòries encara tancades</h2>
              <p className="text-pitch-400 text-sm max-w-md mx-auto">
                Quan l&apos;admin obri aquesta fase podràs predir 32ens, 16ens, quarts, semis i final.
              </p>
            </div>
          ) : (
            <>
              {!readOnly && (
                <p className="text-sm text-pitch-400 mb-4">
                  Marcadors exactes abans de cada eliminatòria — sumen punts de resultat (1/X/2 i exacte).
                  Qui passa de ronda es tria al <strong className="text-pitch-200">Quadre</strong>.
                </p>
              )}
              <PhaseTabs phases={KNOCKOUT_PHASE_LIST} active={activePhase} onChange={setActivePhase} />
              <div>
                <h2 className="font-display text-xl sm:text-2xl text-pitch-400 mb-4">{PHASE_LABELS[activePhase]}</h2>
                <div className="grid gap-3">
                  {phaseMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      prediction={predictions[m.id]}
                      onChange={(pred) => (onPredictionChange ?? noopChange)(m.id, pred)}
                      disabled={readOnly || !knockoutEditable}
                    />
                  ))}
                </div>
                {readOnly && phaseMatches.length > 0 && phaseMatches.every((m) => !predictions[m.id]) && (
                  <p className="text-pitch-500 text-sm text-center mt-4">Encara no ha predit partits d&apos;aquesta fase.</p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {mainSection === "bracket" && (
        <>
          {!showKnockout ? (
            <div className="card-glass rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="font-display text-2xl text-pitch-300 mb-3">Quadre encara tancat</h2>
              <p className="text-pitch-400 text-sm max-w-md mx-auto">
                Quan l&apos;admin obri eliminatòries podràs triar qui passa cada ronda.
              </p>
            </div>
          ) : (
            <PredictionBracket
              matches={matches}
              bracketPicks={bracketPicks}
              onPick={handleBracketPick}
              disabled={!knockoutEditable}
              readOnly={readOnly}
            />
          )}
        </>
      )}

      {mainSection === "mundial" && (
        <>
          {!specialEditable && !readOnly && (
            <div className="card-glass rounded-xl p-4 mb-6 border border-pitch-600/40">
              <p className="text-pitch-200 font-medium">Prediccions especials tancades</p>
              <p className="text-pitch-400 text-sm mt-1">Només lectura.</p>
            </div>
          )}
          <MundialForm
            groups={groups}
            matches={matches}
            predictions={predictions}
            special={special}
            bracketPicks={bracketPicks}
            allTeams={getAllTeams()}
            onChange={onSpecialChange ?? noopChange}
            disabled={readOnly || !specialEditable}
            readOnly={readOnly}
          />
        </>
      )}

      {canSave && onSave && (
        <div className="mobile-save-bar">
          <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
            <span className="text-sm text-pitch-400 shrink-0">{sectionLabel}</span>
            <button
              onClick={onSave}
              disabled={saving}
              className="btn-primary flex-1 max-w-xs disabled:opacity-50"
            >
              {saving ? "Desant..." : saved ? "Desat ✓" : "Desar prediccions"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SectionTab({
  active,
  onClick,
  title,
  subtitle,
  locked,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
        active ? "tab-active" : "tab-inactive"
      }`}
    >
      <div className="font-display text-base sm:text-lg flex items-center gap-1">
        {title}
        {locked && <span className="text-sm">🔒</span>}
      </div>
      <div className="text-[10px] sm:text-xs opacity-80 mt-1">{subtitle}</div>
    </button>
  );
}
