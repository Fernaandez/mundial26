"use client";

import type { ReactNode } from "react";
import { Phase } from "@/types";
import { R32_LEFT_IDS, R32_RIGHT_IDS } from "@/lib/round32-bracket";

interface BracketRoundMatchesProps {
  phase: Phase;
  matchIds: string[];
  renderMatch: (id: string) => ReactNode;
}

/** Setzens en dues meitats (1–8 esquerra, 9–16 dreta); altres rondes en graella 2 cols */
export function BracketRoundMatches({ phase, matchIds, renderMatch }: BracketRoundMatchesProps) {
  if (phase === "round32") {
    return (
      <div className="bracket-round-body">
        <div className="bracket-r32-halves">
          <div className="bracket-r32-side">
            {R32_LEFT_IDS.map((id) => renderMatch(id))}
          </div>
          <div className="bracket-r32-side">
            {R32_RIGHT_IDS.map((id) => renderMatch(id))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bracket-round-body">
      <div className="bracket-round-matches">
        {matchIds.map((id) => renderMatch(id))}
      </div>
    </div>
  );
}
