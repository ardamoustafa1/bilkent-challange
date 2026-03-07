import { useState, useMemo } from "react";
import { ShieldCheck, Plus, Download, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/SectionTitle";
import { ScoreChip } from "@/components/ScoreChip";
import { useAppContext } from "@/context/AppContext";
import { evolPercent, sortByScoreDesc } from "@/utils/scoreUtils";

const PAGE_SIZE = 10;

export function AdminPage() {
  const {
    teams, openAdminCreate, openAdminEdit,
    downloadTemplate, importFile, importErr,
  } = useAppContext();

  const [page, setPage] = useState(0);

  const sortedTeams = useMemo(() => [...teams].sort(sortByScoreDesc), [teams]);
  const totalPages = Math.max(1, Math.ceil(sortedTeams.length / PAGE_SIZE));
  const pageTeams = sortedTeams.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Sayfa silme sonrası son sayfadan öncesine git
  const safePage = page >= totalPages ? totalPages - 1 : page;
  if (safePage !== page) setPage(safePage);

  return (
    <div className="grid gap-4">
      <SectionTitle icon={ShieldCheck} title="Admin" subtitle="Takım & üye yönetimi + Excel/CSV import" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-800">Takımlar</div>
              <div className="mt-1 text-xs text-slate-600">Düzenle ile takım detaylarını açın.</div>
            </div>
            <Button className="rounded-xl" onClick={openAdminCreate}><Plus className="mr-2 h-4 w-4" /> Takım Ekle</Button>
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
        <div className="card p-4">
          <div className="text-sm font-semibold text-slate-800">Excel / CSV Import</div>
          <div className="mt-2 text-xs text-slate-600">Aynı team_id tekrar yüklenirse takım kaydı overwrite edilir, hakem skorları korunur.</div>
          <div className="mt-4 grid gap-3">
            <Button variant="outline" className="rounded-xl" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" /> Şablon indir</Button>
            <label className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-white cursor-pointer">
              <div className="flex items-center gap-2"><Upload className="h-4 w-4" /><span>.xlsx / .xls / .csv yükle</span></div>
              <input className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) { importFile(f); e.currentTarget.value = ""; } }} />
            </label>
            {importErr ? <div className="rounded-xl border border-red-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{importErr}</div> : null}
          </div>
          <div className="mt-6 card p-4">
            <div className="text-xs font-semibold text-slate-800">Not</div>
            <div className="mt-2 text-xs text-zinc-700">Import sonrası veriler anında tüm listelere yansır.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
