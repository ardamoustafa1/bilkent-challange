import { useMemo, useState } from "react";
import { Users, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamCard } from "@/components/TeamCard";
import { ProjectCategoryFilters } from "@/components/ProjectCategoryFilters";
import { useAppContext } from "@/context/AppContext";
import { evolPercent } from "@/utils/scoreUtils";
import { resolveSubMeta } from "@/utils/category";
import { PROJECT_CATEGORIES } from "@/constants/projectCategories";

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

  // Ek filtreler: Turnuva kategorisi, seviye, baraj seviyesi, SDG kategorisi
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [barajFilter, setBarajFilter] = useState("all");
  const [sdgFilter, setSdgFilter] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(teams.map((t) => t.tournamentCategory).filter(Boolean))).sort(),
    [teams]
  );
  const tiers = useMemo(
    () => Array.from(new Set(teams.map((t) => t.tournamentTier).filter(Boolean))).sort(),
    [teams]
  );
  const sdgOptions = useMemo(() => {
    const set = new Set<string>();
    PROJECT_CATEGORIES.forEach((cat) => {
      set.add(cat.mainSDG);
      cat.subs.forEach((s) => s.sdgs.forEach((x) => set.add(x)));
    });
    return Array.from(set).sort();
  }, []);

  const viewTeams = useMemo(
    () =>
      teamsFiltered
        .filter((t) => (categoryFilter === "all" ? true : t.tournamentCategory === categoryFilter))
        .filter((t) => (tierFilter === "all" ? true : t.tournamentTier === tierFilter))
        .filter((t) => {
          if (barajFilter === "all") return true;
          const p = evolPercent(t.scores);
          if (barajFilter === "burs") return p >= 90;
          if (barajFilter === "odul") return p >= 80 && p < 90;
          if (barajFilter === "aday") return p >= 70 && p < 80;
          if (barajFilter === "havuz") return p < 70;
          return true;
        })
        .filter((t) => {
          if (sdgFilter === "all") return true;
          const meta = resolveSubMeta(t.projectMainCategory, t.projectSubCategory);
          if (!meta) return false;
          const sdgs = [meta.main.mainSDG, ...meta.sub.sdgs];
          return sdgs.includes(sdgFilter);
        }),
    [teamsFiltered, categoryFilter, tierFilter, barajFilter, sdgFilter]
  );

  return (
    <div className="grid gap-4">
      <SectionTitle icon={Users} title="Takımlar" subtitle="Hızlı özet + analitik filtreler" />
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label className="text-xs text-slate-600">Turnuva Adı</Label>
            <Select value={teamsTournament} onValueChange={setTeamsTournament}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {tournaments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Turnuva Okulu</Label>
            <Select value={teamsSchool} onValueChange={setTeamsSchool}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {schools.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Turnuva Haftası</Label>
            <Select value={teamsWeek} onValueChange={setTeamsWeek}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {[1, 2, 3, 4].map((w) => <SelectItem key={w} value={String(w)}>{w}. Hafta</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-xs text-slate-600">Turnuva Kategorisi</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Turnuva Türü ve Seviyesi</Label>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {tiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4"><ProjectCategoryFilters mainValue={mainCat} subValue={subCat} onMain={setMainCat} onSub={setSubCat} /></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label className="text-xs text-slate-600">Proje Adı / Genel Arama</Label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input className="w-full bg-transparent text-sm outline-none" value={teamsSearch} onChange={(e) => setTeamsSearch(e.target.value)} placeholder="Takım / Kaptan / Proje / Okul" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Baraj Seviyesi</Label>
            <Select value={barajFilter} onValueChange={setBarajFilter}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="burs">Ödül + Burs (≥ 90)</SelectItem>
                <SelectItem value="odul">Ödül (80–89)</SelectItem>
                <SelectItem value="aday">Performans Aday (70–79)</SelectItem>
                <SelectItem value="havuz">Gelişim Havuzu (&lt; 70)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Label className="text-xs text-slate-600">SDG Kategorisi</Label>
          <Select value={sdgFilter} onValueChange={setSdgFilter}>
            <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {sdgOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {viewTeams.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {teams.length === 0 ? "Henüz takım yok. Admin sayfasından Takım Ekle veya CSV/Excel import ile başlayın." : "Arama kriterlerine uygun takım bulunamadı."}
          </p>
        ) : viewTeams.map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)}
      </div>
    </div>
  );
}
