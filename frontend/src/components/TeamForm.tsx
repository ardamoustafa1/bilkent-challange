import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Team, TeamMember, TournamentCategory, TournamentTier } from "@/types";
import { TOURNAMENT_CATALOG } from "@/constants/catalog";
import { safeUUID } from "@/utils/helpers";
import { coerceWeek, coerceGrade } from "@/utils/coerce";
import { ProjectCategoryFilters } from "./ProjectCategoryFilters";

export function TeamForm({ value, onChange, mode }: { value: Team; onChange: (t: Team) => void; mode: "create" | "edit" }) {
  const mainValue = value.projectMainCategory ?? "all";
  const subValue = value.projectSubCategory ?? "all";

  const addMember = () => {
    const next: TeamMember = { id: safeUUID(), name: "", email: "", school: value.school, grade: 9, role: "Üye" };
    onChange({ ...value, members: [...value.members, next] });
  };

  const updateMember = (id: string, patch: Partial<TeamMember>) => {
    const nextMembers = value.members.map((m) => (m.id === id ? { ...m, ...patch } : m));
    const captain = nextMembers.find((m) => m.role === "Kaptan")?.name ?? value.captain;
    onChange({ ...value, members: nextMembers, captain });
  };

  const removeMember = (id: string) => {
    const next = value.members.filter((m) => m.id !== id);
    const ensured = next.length ? next : [{ id: safeUUID(), name: "Kaptan", email: "", school: value.school, grade: 9 as 9 | 10 | 11, role: "Kaptan" as const }];
    const anyCaptain = ensured.some((m) => m.role === "Kaptan");
    const ensured2 = anyCaptain ? ensured : [{ ...ensured[0], role: "Kaptan" }, ...ensured.slice(1)];
    const captain = ensured2.find((m) => m.role === "Kaptan")?.name ?? ensured2[0].name;
    onChange({ ...value, members: ensured2 as import("@/types").TeamMember[], captain });
  };

  const setCaptain = (id: string) => {
    const next = value.members.map((m) => (m.id === id ? { ...m, role: "Kaptan" as const } : { ...m, role: "Üye" as const }));
    const captain = next.find((m) => m.role === "Kaptan")?.name ?? value.captain;
    onChange({ ...value, members: next, captain });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="text-sm font-black text-slate-900">Takım Bilgisi</div>
        <div className="mt-4 grid gap-3">
          <div>
            <Label className="text-xs text-zinc-600">Takım Adı</Label>
            <Input className="mt-1 rounded-2xl" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs text-zinc-600">Hafta</Label>
              <Select value={String(value.week)} onValueChange={(v) => onChange({ ...value, week: coerceWeek(v) })}>
                <SelectTrigger className="mt-1 rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((w) => (
                    <SelectItem key={w} value={String(w)}>{w}. Hafta</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-zinc-600">Turnuva Kategorisi</Label>
              <Select
                value={value.tournamentCategory}
                onValueChange={(v) => {
                  const c = v as TournamentCategory;
                  const defTier = (TOURNAMENT_CATALOG.find((x) => x.category === c)?.tiers?.[0] ?? TOURNAMENT_CATALOG[0].tiers[0]) as TournamentTier;
                  onChange({ ...value, tournamentCategory: c, tournamentTier: defTier });
                }}
              >
                <SelectTrigger className="mt-1 rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TOURNAMENT_CATALOG.map((c) => (
                    <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-zinc-600">Turnuva Türü ve Seviyesi</Label>
            <Select value={value.tournamentTier} onValueChange={(v) => onChange({ ...value, tournamentTier: v as TournamentTier })}>
              <SelectTrigger className="mt-1 rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(TOURNAMENT_CATALOG.find((x) => x.category === value.tournamentCategory)?.tiers ?? TOURNAMENT_CATALOG[0].tiers).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-zinc-600">Proje Başlığı</Label>
            <Input className="mt-1 rounded-2xl" value={value.projectTitle} onChange={(e) => onChange({ ...value, projectTitle: e.target.value })} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs text-zinc-600">Turnuva</Label>
              <Input className="mt-1 rounded-2xl" value={value.tournament} onChange={(e) => onChange({ ...value, tournament: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs text-zinc-600">Okul</Label>
              <Input className="mt-1 rounded-2xl" value={value.school} onChange={(e) => onChange({ ...value, school: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="text-sm font-black text-slate-900">Proje Kategorisi</div>
        <div className="mt-4">
          <ProjectCategoryFilters
            mainValue={mainValue}
            subValue={subValue}
            onMain={(v) => onChange({ ...value, projectMainCategory: v === "all" ? undefined : v, projectSubCategory: undefined })}
            onSub={(v) => onChange({ ...value, projectSubCategory: v === "all" ? undefined : v })}
          />
        </div>
      </div>

      <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-black text-slate-900">Üyeler</div>
          <Button variant="outline" className="rounded-2xl" onClick={addMember}>
            <Plus className="mr-2 h-4 w-4" /> Üye Ekle
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          {value.members.map((m) => (
            <div key={m.id} className="rounded-xl border border-slate-200 bg-white shadow-sm p-3">
              <div className="grid gap-3 md:grid-cols-6">
                <div className="md:col-span-2">
                  <Label className="text-xs text-zinc-600">Ad Soyad</Label>
                  <Input
                    className="mt-1 rounded-2xl"
                    value={m.name}
                    onChange={(e) => updateMember(m.id, { name: e.target.value })}
                    onBlur={() => { if (m.role === "Kaptan" && m.name.trim()) onChange({ ...value, captain: m.name.trim() }); }}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs text-zinc-600">Mail</Label>
                  <Input className="mt-1 rounded-2xl" value={m.email} onChange={(e) => updateMember(m.id, { email: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs text-zinc-600">Sınıf</Label>
                  <Select value={String(m.grade)} onValueChange={(v) => updateMember(m.id, { grade: coerceGrade(v) })}>
                    <SelectTrigger className="mt-1 rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[9, 10, 11].map((g) => (
                        <SelectItem key={g} value={String(g)}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-zinc-600">Rol</Label>
                  <Select value={m.role} onValueChange={(v) => (v === "Kaptan" ? setCaptain(m.id) : updateMember(m.id, { role: "Üye" }))}>
                    <SelectTrigger className="mt-1 rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kaptan">Kaptan</SelectItem>
                      <SelectItem value="Üye">Üye</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-zinc-600">{m.school || value.school || "-"}</div>
                <Button variant="ghost" className="rounded-2xl" onClick={() => removeMember(m.id)}>
                  <Trash2 className="h-4 w-4 text-zinc-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <Label className="text-xs text-zinc-600">Hakem Notu</Label>
          <Input className="mt-1 rounded-2xl" value={value.judgeNote} onChange={(e) => onChange({ ...value, judgeNote: e.target.value })} />
        </div>

        {mode === "create" ? <div className="mt-3 text-xs text-zinc-600">Takım eklendikten sonra Hakem menüsünden puanlama yapılabilir.</div> : null}
      </div>
    </div>
  );
}
