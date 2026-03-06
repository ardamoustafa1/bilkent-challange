import { formatPct, scoreLabel, toneBadge } from "@/utils/scoreUtils";

export function ScoreChip({ pct }: { pct: number }) {
  const meta = scoreLabel(pct);
  return (
    <span className={"inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold " + toneBadge(meta.tone)}>
      <span>{formatPct(pct)}</span>
      <span className="opacity-70">•</span>
      <span>{meta.label}</span>
    </span>
  );
}
