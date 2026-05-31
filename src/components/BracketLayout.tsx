"use client";

import type { ReactNode } from "react";

interface BracketLayoutProps {
  header?: ReactNode;
  children: ReactNode;
}

/** Contenidor responsive del quadre — sense scroll horitzontal trencat */
export function BracketLayout({ header, children }: BracketLayoutProps) {
  return (
    <div className="bracket-layout w-full min-w-0">
      {header}
      <div className="bracket-scroll">{children}</div>
    </div>
  );
}
