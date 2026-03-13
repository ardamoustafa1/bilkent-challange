import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamCard } from "@/components/TeamCard";
import { useAppContext } from "@/context/AppContext";
import { sortByScoreDesc } from "@/utils/scoreUtils";
import { resolveSubMeta } from "@/utils/category";

export function LeaguePage() {
  const { teams, openTeamDetail } = useAppContext();

  // Lig filtresi: Turnuva kategorisi, seviye, proje ana/alt kategori
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [mainFilter, setMainFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(teams.map((t) => t.tournamentCategory).filter(Boolean))).sort(),
    [teams]
  );
  const tiers = useMemo(
    () => Array.from(new Set(teams.map((t) => t.tournamentTier).filter(Boolean))).sort(),
    [teams]
  );
  const mainCats = useMemo(
    () => Array.from(new Set(teams.map((t) => t.projectMainCategory).filter(Boolean))) as string[],
    [teams]
  );
  const subCats = useMemo(() => {
    const filtered = teams.filter((t) => (mainFilter === "all" ? true : t.projectMainCategory === mainFilter));
    return Array.from(new Set(filtered.map((t) => t.projectSubCategory).filter(Boolean))) as string[];
  }, [teams, mainFilter]);

  const leagueTeams = useMemo(
    () =>
      [...teams]
        .filter((t) => (categoryFilter === "all" ? true : t.tournamentCategory === categoryFilter))
        .filter((t) => (tierFilter === "all" ? true : t.tournamentTier === tierFilter))
        .filter((t) => (mainFilter === "all" ? true : t.projectMainCategory === mainFilter))
        .filter((t) => (subFilter === "all" ? true : t.projectSubCategory === subFilter))
        .sort(sortByScoreDesc),
    [teams, categoryFilter, tierFilter, mainFilter, subFilter]
  );

  const top16 = leagueTeams.slice(0, 16);

  return (
    <div className="grid gap-4">
      <SectionTitle icon={Trophy} title="Lig" subtitle="Tüm zamanların en iyileri" />
      <div className="card p-4">
        <div className="text-sm font-semibold text-slate-800">
          {top16.length} Takım • Lig filtresi
        </div>
        <div className="mt-1 text-xs text-slate-600">Turnuva ve proje kategorilerine göre filtreleyin. Tıklayarak detayları görüntüleyin.</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-xs text-slate-600">Turnuva Kategorisi</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Turnuva Türü ve Seviyesi</Label>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {tiers.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-xs text-slate-600">Proje Ana Kategori</Label>
            <Select
              value={mainFilter}
              onValueChange={(v) => {
                setMainFilter(v);
                setSubFilter("all");
              }}
            >
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {mainCats.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Proje Alt Kategori</Label>
            <Select value={subFilter} onValueChange={setSubFilter}>
              <SelectTrigger className="mt-1 rounded-xl" disabled={mainFilter === "all"}>
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {subCats.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {teams.length === 0 ? (
          <p className="col-span-2 py-8 text-center text-sm text-slate-500">
            Henüz takım yok. Admin sayfasından Takım Ekle veya import ile ekleyin.
          </p>
        ) : top16.length === 0 ? (
          <p className="col-span-2 py-8 text-center text-sm text-slate-500">
            Lig filtresine uyan takım bulunamadı.
          </p>
        ) : (
          top16.map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)
        )}
      </div>
    </div>
  );
}
