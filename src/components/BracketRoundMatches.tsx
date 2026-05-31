"use client";

import type { ReactNode } from "react";
import { Phase } from "@/types";

interface BracketRoundMatchesProps {
  phase: Phase;
  matchIds: string[];
  renderMatch: (id: string) => ReactNode;
}

/** Totes les rondes en una columna vertical (Setzens: 16 partits) */
export function BracketRoundMatches({ matchIds, renderMatch }: BracketRoundMatchesProps) {
  return (
    <div className="bracket-round-body">
      <div className="bracket-round-matches">
        {matchIds.map((id) => renderMatch(id))}
      </div>
    </div>
  );
}
