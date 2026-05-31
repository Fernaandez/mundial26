"use client";

import type { ReactNode } from "react";

interface BracketLayoutProps {
  header?: ReactNode;
  children: ReactNode;
}

/** Contenidor del quadre — mateix layout horitzontal a PC i mòbil (scroll lateral si cal) */
export function BracketLayout({ header, children }: BracketLayoutProps) {
  return (
    <div className="bracket-layout w-full min-w-0">
      {header}
      <div className="bracket-scroll-outer">
        <div className="bracket-scroll">{children}</div>
      </div>
    </div>
  );
}
