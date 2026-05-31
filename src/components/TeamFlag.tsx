import { getTeamIso } from "@/lib/flags";

interface TeamFlagProps {
  code: string;
  size?: number;
  className?: string;
}

export function TeamFlag({ code, size = 22, className = "" }: TeamFlagProps) {
  const iso = getTeamIso(code);

  if (!iso) {
    return (
      <span
        className={`team-flag team-flag--empty ${className}`}
        style={{ fontSize: size }}
        aria-hidden
      >
        ?
      </span>
    );
  }

  return (
    <span
      className={`fi fi-${iso} team-flag ${className}`}
      style={{ fontSize: size }}
      aria-hidden
    />
  );
}
