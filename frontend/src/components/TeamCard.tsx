import { Crown, Users, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@/types";
import { evolPercent, scoreLabel } from "@/utils/scoreUtils";
import { resolveSubMeta } from "@/utils/category";
import { badgeMeta } from "@/constants/badges";
import { ScoreChip } from "./ScoreChip";

export function TeamCard({ team, onOpen, clickable = true }: { team: Team; onOpen: () => void; clickable?: boolean }) {
  const pct = evolPercent(team.scores);
  const subMeta = resolveSubMeta(team.projectMainCategory, team.projectSubCategory);
  const Wrap = clickable ? "button" : "div";
  const wrapProps = clickable ? { onClick: onOpen, type: "button" as const } : { role: "article" as const };

  const sdgLabel = subMeta?.sub?.sdgs?.[0] ?? subMeta?.main?.mainSDG ?? null;
  const tone = scoreLabel(pct);

  return (
    <Wrap
      {...wrapProps}
      className={
        "w-full max-w-sm mx-auto rounded-[var(--radius-card)] border border-slate-100 bg-white p-5 text-left shadow-soft transition-shadow duration-200 " +
        (clickable ? "hover:border-slate-200 hover:shadow-float focus:outline-none focus:ring-4 focus:ring-slate-100" : "")
      }
    >
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-bold tracking-tight text-slate-900">
            {team.projectTitle || team.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px] font-medium">
              Hafta {team.week}
            </Badge>
            {team.name !== (team.projectTitle || "") ? (
              <span className="truncate max-w-[120px]">{team.name}</span>
            ) : null}
          </div>

          <div className="mt-3 inline-flex w-full items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50/60 px-3 py-2 shadow-[0_0_0_1px_rgba(250,250,249,0.4)]">
            <div className="flex min-w-0 flex-1 items-center gap-2 text-[12px] text-slate-700">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <span className="shrink-0 font-semibold">Kaptan:</span>
              <span className="truncate text-slate-800">{team.captain || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-slate-600">
              <span className="rounded-full bg-white/80 px-2 py-0.5 font-semibold text-slate-900 shadow-sm">
                {Math.round(pct)}%
              </span>
              <span className="hidden text-xs font-medium text-amber-700 sm:inline">
                {tone.label}
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium">Üye:</span>
              <span>{team.members.length}</span>
            </span>
            {team.badges.slice(0, 2).map((b) => {
              const meta = badgeMeta(b);
              return (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600"
                >
                  <meta.icon className="h-3.5 w-3.5 text-slate-400" />
                  {meta.title}
                </span>
              );
            })}
          </div>

          {sdgLabel ? (
            <div className="mt-3 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-800">
              {sdgLabel}
            </div>
          ) : null}
          <p className="mt-3 text-[11px] text-slate-500">
            {team.school || "-"} • {team.tournament || "-"}
          </p>
        </div>
        {clickable ? (
          <div className="flex items-center justify-end">
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
        ) : null}
      </div>
    </Wrap>
  );
}
