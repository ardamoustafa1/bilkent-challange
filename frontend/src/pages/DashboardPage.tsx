import { Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamCard } from "@/components/TeamCard";
import { BarajDagilimi, ScoreDistribution } from "@/components/Charts";
import { useAppContext } from "@/context/AppContext";

export function DashboardPage() {
  const {
    teams, sortedDash, playoff, finalFour, baraj, bins,
    tournaments, schools,
    dashTournament, setDashTournament,
    dashSchool, setDashSchool,
    dashWeek, setDashWeek,
    openTeamDetail,
  } = useAppContext();

  return (
    <div className="grid gap-4">
      <SectionTitle icon={Sparkles} title="Akış" subtitle="Filtreli seçim + skorlar + PlayOff + Final Four" />
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label className="text-xs text-slate-600">Turnuva Adı</Label>
            <Select value={dashTournament} onValueChange={setDashTournament}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {tournaments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Turnuva Okulu</Label>
            <Select value={dashSchool} onValueChange={setDashSchool}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {schools.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Turnuva Haftası</Label>
            <Select value={dashWeek} onValueChange={setDashWeek}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {[1, 2, 3, 4].map((w) => (
                  <SelectItem key={w} value={String(w)}>{w}. Hafta</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <BarajDagilimi burs={baraj.burs} odul={baraj.odul} aday={baraj.aday} havuz={baraj.havuz} />
      <ScoreDistribution data={bins} />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-[15px] font-bold text-slate-900 tracking-tight">Tüm Takımlar</div>
          <div className="mt-1 text-[13px] text-slate-500">Skora göre sıralı tam liste</div>
          <div className="mt-4 grid gap-3">
            {sortedDash.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-slate-500">
                {teams.length === 0 ? "Henüz takım yok. Yönetim panelinden takım ekleyin." : "Bu filtreye uygun takım yok."}
              </p>
            ) : sortedDash.map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-[15px] font-bold text-slate-900 tracking-tight">PlayOff</div>
          <div className="mt-1 text-[13px] text-slate-500">En yüksek puanlı 8 takım</div>
          <div className="mt-4 grid gap-3">
            {playoff.length === 0 ? <p className="py-4 text-center text-[13px] text-slate-500">-</p> : playoff.map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-[15px] font-bold text-slate-900 tracking-tight">Final Four</div>
          <div className="mt-1 text-[13px] text-slate-500">Zirvedeki ilk 4 takım</div>
          <div className="mt-4 grid gap-3">
            {finalFour.length === 0 ? <p className="py-4 text-center text-[13px] text-slate-500">-</p> : finalFour.map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)}
          </div>
        </div>
      </div>
    </div>
  );
}
