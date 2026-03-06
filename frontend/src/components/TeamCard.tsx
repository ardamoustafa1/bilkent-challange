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

  return (
    <Wrap
      {...wrapProps}
      className={
        "w-full rounded-xl border border-slate-200/60 bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition " +
        (clickable ? "hover:border-slate-300/80 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-slate-300" : "")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-800">{team.name}</span>
            <Badge variant="secondary">Hafta {team.week}</Badge>
            {team.projectMainCategory ? (
              <Badge variant="secondary" className="truncate max-w-[120px]">{team.projectMainCategory}</Badge>
            ) : null}
          </div>
          <p className="mt-1 truncate text-xs text-slate-600">{team.projectTitle}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-slate-50/60 px-2 py-0.5">
              <Crown className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium">Kaptan:</span>
              <span className="truncate">{team.captain || "-"}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-slate-50/60 px-2 py-0.5">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium">Üye:</span>
              <span>{team.members.length}</span>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ScoreChip pct={pct} />
          {clickable ? <ChevronRight className="h-4 w-4 text-slate-400" /> : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {team.badges.slice(0, 3).map((b) => {
            const meta = badgeMeta(b);
            return (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-slate-50/50 px-2 py-0.5 text-xs font-medium text-slate-600"
              >
                <meta.icon className="h-3.5 w-3.5" />
                {meta.title}
              </span>
            );
          })}
          {subMeta?.sub?.sdgs?.length ? (
            <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50/50 px-2 py-0.5 text-xs font-medium text-slate-600">
              SDG {subMeta.sub.sdgs[0]}
            </span>
          ) : null}
        </div>
        <span className="text-xs text-slate-500">
          {team.school || "-"} • {team.tournament || "-"}
        </span>
      </div>
    </Wrap>
  );
}
