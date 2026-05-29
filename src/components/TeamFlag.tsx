import { getTeamIso, getFlagUrl } from "@/lib/flags";

interface TeamFlagProps {
  code: string;
  size?: number;
  className?: string;
}

export function TeamFlag({ code, size = 24, className = "" }: TeamFlagProps) {
  const iso = getTeamIso(code);

  if (!iso) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded bg-pitch-800 text-pitch-400 text-xs font-bold shrink-0 ${className}`}
        style={{ width: size, height: Math.round(size * 0.75) }}
        aria-hidden
      >
        ?
      </span>
    );
  }

  const height = Math.round(size * 0.75);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getFlagUrl(iso, size * 2)}
      width={size}
      height={height}
      alt=""
      className={`inline-block rounded-sm object-cover shrink-0 border border-pitch-700/50 ${className}`}
      loading="lazy"
    />
  );
}
