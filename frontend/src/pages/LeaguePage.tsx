import { Trophy } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamCard } from "@/components/TeamCard";
import { useAppContext } from "@/context/AppContext";
import { sortByScoreDesc } from "@/utils/scoreUtils";

export function LeaguePage() {
  const { teams, openTeamDetail } = useAppContext();

  const top16 = [...teams].sort(sortByScoreDesc).slice(0, 16);

  return (
    <div className="grid gap-4">
      <SectionTitle icon={Trophy} title="Lig" subtitle="Tüm zamanların en iyileri" />
      <div className="card p-4">
        <div className="text-sm font-semibold text-slate-800">16 Takım • Tüm turnuvalar</div>
        <div className="mt-1 text-xs text-slate-600">Tıklayarak detayları görüntüleyin.</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {teams.length === 0 ? (
          <p className="col-span-2 py-8 text-center text-sm text-slate-500">
            Henüz takım yok. Admin sayfasından Takım Ekle veya import ile ekleyin.
          </p>
        ) : top16.map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)}
      </div>
    </div>
  );
}
