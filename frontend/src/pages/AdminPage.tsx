import { useState, useMemo, useEffect, useRef } from "react";
import { ShieldCheck, Plus, Download, Upload, ChevronLeft, ChevronRight, Activity, Monitor, FileText, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTCooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionTitle } from "@/components/SectionTitle";
import { ScoreChip } from "@/components/ScoreChip";
import { useAppContext } from "@/context/AppContext";
import { api } from "@/services/api";
import type { AuditLog } from "@/types";
import { evolPercent, sortByScoreDesc } from "@/utils/scoreUtils";
import { exportTeamsToCsv } from "@/utils/importExport";
import { downloadText } from "@/utils/helpers";
import type { Team } from "@/types";
import { ReportCard } from "@/components/ReportCard";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PAGE_SIZE = 10;

export function AdminPage() {
  const {
    teams,
    tournaments,
    schools,
    dashTournament,
    setDashTournament,
    dashSchool,
    setDashSchool,
    openAdminCreate,
    openAdminEdit,
    downloadTemplate, importFile, importErr,
  } = useAppContext();

  const [page, setPage] = useState(0);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [printingTeam, setPrintingTeam] = useState<Team | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const filteredTeams = useMemo(
    () =>
      teams
        .filter((t) => (dashTournament === "all" ? true : t.tournament === dashTournament))
        .filter((t) => (dashSchool === "all" ? true : t.school === dashSchool)),
    [teams, dashTournament, dashSchool]
  );

  const sortedTeams = useMemo(() => [...filteredTeams].sort(sortByScoreDesc), [filteredTeams]);
  const totalPages = Math.max(1, Math.ceil(sortedTeams.length / PAGE_SIZE));
  const pageTeams = sortedTeams.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Fetch logs on mount
  useEffect(() => {
    setLogsLoading(true);
    api.getAuditLogs().then(setLogs).catch(() => {}).finally(() => setLogsLoading(false));
  }, []);

  // PDF Generation Effect
  useEffect(() => {
    if (printingTeam && reportRef.current) {
      setTimeout(() => {
        if (!reportRef.current) return;
        html2canvas(reportRef.current, { scale: 2, useCORS: true, logging: false }).then((canvas) => {
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: [1190, 1684]
          });
          pdf.addImage(imgData, "JPEG", 0, 0, 1190, 1684);
          pdf.save(`${printingTeam.name}_Karne.pdf`);
          setPrintingTeam(null);
        }).catch(() => {
          setPrintingTeam(null);
        });
      }, 500); // Wait for fonts and styles to render
    }
  }, [printingTeam]);

  // Sayfa silme sonrası son sayfadan öncesine git
  const safePage = page >= totalPages ? totalPages - 1 : page;
  if (safePage !== page) setPage(safePage);

  // Chart Data: Categories
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    teams.forEach(t => {
      counts[t.tournamentCategory] = (counts[t.tournamentCategory] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [teams]);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

  // Chart Data: Schools Average
  const schoolData = useMemo(() => {
    const map: Record<string, { sum: number, count: number }> = {};
    teams.forEach(t => {
      if (!t.school) return;
      const s = evolPercent(t.scores);
      if (s === 0) return; // ignore un-evaluated
      if (!map[t.school]) map[t.school] = { sum: 0, count: 0 };
      map[t.school].sum += s;
      map[t.school].count++;
    });
    return Object.entries(map).map(([name, { sum, count }]) => ({
      name: name.length > 15 ? name.substring(0, 15) + "..." : name,
      avg: Math.round(sum / count)
    })).sort((a,b) => b.avg - a.avg).slice(0, 5);
  }, [teams]);

  return (
    <div className="grid gap-4">
      <SectionTitle icon={ShieldCheck} title="Admin" subtitle="Takım & üye yönetimi + Excel/CSV import" />
      
      {/* Visual Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="text-sm font-semibold text-slate-800 mb-4">Proje Kategorileri Dağılımı</div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RTCooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm font-semibold text-slate-800 mb-4">En Başarılı 5 Okul (Puan Ortalaması)</div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RTCooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="avg" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-800">Takımlar</div>
              <div className="mt-1 text-xs text-slate-600">Düzenle ile takım detaylarını açın.</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl border-cyan-500/30 text-cyan-600 hover:bg-cyan-50" onClick={() => window.open('/tv', '_blank')}>
                <Monitor className="mr-2 h-4 w-4" />
                TV Modu
              </Button>
              <Button className="rounded-xl" onClick={openAdminCreate}>
                <Plus className="mr-2 h-4 w-4" /> 
                Takım Ekle
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs text-slate-600">Turnuva Adı</Label>
              <Select value={dashTournament} onValueChange={setDashTournament}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {tournaments.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Turnuva Okulu</Label>
              <Select value={dashSchool} onValueChange={setDashSchool}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {schools.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {sortedTeams.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Henüz takım yok. Takım Ekle veya aşağıdan CSV/Excel import yapın.</p>
            ) : pageTeams.map((t) => (
              <div key={t.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800">{t.name}</div>
                    <div className="mt-1 text-xs text-slate-600">{t.projectTitle}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border bg-white px-2 py-1 text-xs">{t.tournament}</span>
                      <span className="rounded-full border bg-white px-2 py-1 text-xs">{t.school}</span>
                      <span className="rounded-full border bg-white px-2 py-1 text-xs">{`Hafta ${t.week}`}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScoreChip pct={evolPercent(t.scores)} />
                    <Button 
                      variant="outline" 
                      className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      onClick={() => setPrintingTeam(t)}
                      disabled={printingTeam !== null}
                    >
                      {printingTeam?.id === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => openAdminEdit(t.id)}>Düzenle</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" className="rounded-xl" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium text-slate-600">{page + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" className="rounded-xl" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="grid gap-4">
          <div className="card p-4">
            <div className="text-sm font-semibold text-slate-800">Excel / CSV İşlemleri</div>
            <div className="mt-2 text-xs text-slate-600">Takımları içe aktarabilir ya da mevcut durumu raporlayabilirsiniz.</div>
            <div className="mt-4 grid gap-3">
              <Button variant="outline" className="rounded-xl w-full" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" /> Şablon indir</Button>
              <label className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center justify-center">
                <div className="flex items-center gap-2"><Upload className="h-4 w-4" /><span>.xlsx/.csv yükle</span></div>
                <input className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) { importFile(f); e.currentTarget.value = ""; } }} />
              </label>
              <Button 
                variant="default" 
                className="rounded-xl w-full bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={() => {
                  const csv = exportTeamsToCsv(teams);
                  downloadText(`chall_export_${new Date().getTime()}.csv`, csv, "text/csv;charset=utf-8");
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Tüm Veriyi İndir
              </Button>
              {importErr ? <div className="rounded-xl border border-red-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{importErr}</div> : null}
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-slate-500" />
              <div className="text-sm font-semibold text-slate-800">İşlem Geçmişi (Loglar)</div>
            </div>
            {logsLoading ? (
              <div className="text-xs text-slate-500 py-4 text-center">Yükleniyor...</div>
            ) : logs.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">Kayıt bulunamadı.</div>
            ) : (
              <div className="max-h-64 overflow-y-auto pr-2 grid gap-2">
                {logs.map(log => {
                  const t = teams.find(x => x.id === log.teamId);
                  return (
                    <div key={log.id} className="p-2 border rounded-xl bg-slate-50/50 text-[11px] leading-relaxed">
                      <div className="font-semibold text-slate-800">{t ? t.name : "Silinmiş Takım"}</div>
                      <div className="text-slate-600">Hakem ID: {log.judgeId.slice(0, 8)}...</div>
                      <div className="text-slate-500 mt-1">{new Date(log.createdAt).toLocaleString("tr-TR")}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print Area */}
      {printingTeam && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px", zIndex: -9999 }}>
          <ReportCard team={printingTeam} ref={reportRef} />
        </div>
      )}
    </div>
  );
}
