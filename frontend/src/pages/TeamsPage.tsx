import { Users, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamCard } from "@/components/TeamCard";
import { ProjectCategoryFilters } from "@/components/ProjectCategoryFilters";
import { useAppContext } from "@/context/AppContext";

export function TeamsPage() {
  const {
    teams, teamsFiltered, tournaments, schools,
    teamsTournament, setTeamsTournament,
    teamsSchool, setTeamsSchool,
    teamsWeek, setTeamsWeek,
    teamsSearch, setTeamsSearch,
    mainCat, setMainCat, subCat, setSubCat,
    openTeamDetail,
  } = useAppContext();

  return (
    <div className="grid gap-4">
      <SectionTitle icon={Users} title="Takımlar" subtitle="Hızlı özet + analitik filtreler" />
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label className="text-xs text-slate-600">Turnuva</Label>
            <Select value={teamsTournament} onValueChange={setTeamsTournament}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {tournaments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Okul</Label>
            <Select value={teamsSchool} onValueChange={setTeamsSchool}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {schools.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Hafta</Label>
            <Select value={teamsWeek} onValueChange={setTeamsWeek}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {[1, 2, 3, 4].map((w) => <SelectItem key={w} value={String(w)}>{w}. Hafta</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4"><ProjectCategoryFilters mainValue={mainCat} subValue={subCat} onMain={setMainCat} onSub={setSubCat} /></div>
        <div className="mt-4">
          <Label className="text-xs text-slate-600">Arama</Label>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input className="w-full bg-transparent text-sm outline-none" value={teamsSearch} onChange={(e) => setTeamsSearch(e.target.value)} placeholder="Takım / Kaptan / Proje / Okul" />
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {teamsFiltered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {teams.length === 0 ? "Henüz takım yok. Admin sayfasından Takım Ekle veya CSV/Excel import ile başlayın." : "Arama kriterlerine uygun takım bulunamadı."}
          </p>
        ) : teamsFiltered.map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)}
      </div>
    </div>
  );
}
