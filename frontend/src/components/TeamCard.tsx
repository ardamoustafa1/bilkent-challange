import { Crown, Users, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@/types";
import { evolPercent } from "@/utils/scoreUtils";
import { resolveSubMeta } from "@/utils/category";
import { badgeMeta } from "@/constants/badges";
import { ScoreChip } from "./ScoreChip";

export function TeamCard({ team, onOpen, clickable = true }: { team: Team; onOpen: () => void; clickable?: boolean }) {
  const pct = evolPercent(team.scores);
  const subMeta = resolveSubMeta(team.projectMainCategory, team.projectSubCategory);
  const Wrap = clickable ? "button" : "div";
  const wrapProps = clickable ? { onClick: onOpen, type: "button" as const } : { role: "article" as const };

  const sdgLabel = subMeta?.sub?.sdgs?.[0] ?? subMeta?.main?.mainSDG ?? null;

  return (
    <Wrap
      {...wrapProps}
      className={
        "w-full rounded-[var(--radius-card)] border border-slate-100 bg-white p-5 text-left shadow-soft transition-all duration-300 " +
        (clickable ? "hover:-translate-y-1 hover:border-slate-200 hover:shadow-float focus:outline-none focus:ring-4 focus:ring-slate-100" : "")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
            {team.projectTitle || team.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-slate-100 bg-slate-50/50 px-2.5 py-1">
              <Crown className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">Kaptan:</span>
              <span className="truncate text-slate-600">{team.captain || "-"}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-slate-100 bg-slate-50/50 px-2.5 py-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">Üye:</span>
              <span className="text-slate-600">{team.members.length}</span>
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {team.badges.slice(0, 3).map((b) => {
              const meta = badgeMeta(b);
              return (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-slate-100 bg-slate-50/50 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  <meta.icon className="h-3.5 w-3.5 text-slate-400" />
                  {meta.title}
                </span>
              );
            })}
          </div>
          {sdgLabel ? (
            <div className="mt-3 rounded-[var(--radius-button)] border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800">
              SDG {sdgLabel}
            </div>
          ) : null}
          <p className="mt-3 text-xs text-slate-500">
            {team.school || "-"} • {team.tournament || "-"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary">Hafta {team.week}</Badge>
            {team.name !== (team.projectTitle || "") ? (
              <span className="truncate max-w-[100px] text-xs text-slate-500">{team.name}</span>
            ) : null}
          </div>
          <ScoreChip pct={pct} />
          {clickable ? <ChevronRight className="h-4 w-4 text-slate-400" /> : null}
        </div>
      </div>
    </Wrap>
  );
}
