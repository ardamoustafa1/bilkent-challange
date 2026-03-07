import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROJECT_CATEGORIES } from "@/constants/projectCategories";

function resolveSubMeta(main?: string, sub?: string) {
  if (!main || !sub) return null;
  const m = PROJECT_CATEGORIES.find((x) => x.main === main);
  const s = m?.subs.find((y) => y.name === sub);
  if (!m || !s) return null;
  return { main: m, sub: s };
}

export function ProjectCategoryFilters({
  mainValue,
  subValue,
  onMain,
  onSub,
}: {
  mainValue: string;
  subValue: string;
  onMain: (v: string) => void;
  onSub: (v: string) => void;
}) {
  const mains = PROJECT_CATEGORIES.map((c) => c.main);
  const subs = mainValue === "all" ? [] : PROJECT_CATEGORIES.find((c) => c.main === mainValue)?.subs ?? [];
  const picked = resolveSubMeta(mainValue === "all" ? undefined : mainValue, subValue === "all" ? undefined : subValue);

  return (
    <div className="relative z-[1] grid gap-4 md:grid-cols-2">
      <div>
        <Label className="text-xs font-semibold text-slate-700" htmlFor="proje-ana-kategori">Proje Ana Kategori</Label>
        <Select
          value={mainValue}
          onValueChange={(v) => {
            onMain(v);
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Ana Kategori seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Ana Kategori seçin</SelectItem>
            {mains.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs font-semibold text-slate-700">Proje Alt Kategori</Label>
        <Select
          value={subValue}
          onValueChange={(v) => onSub(v)}
        >
          <SelectTrigger disabled={mainValue === "all"} className="mt-1">
            <SelectValue placeholder="Alt kategori seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alt kategori seçin</SelectItem>
            {subs.map((s) => (
              <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {picked ? (
        <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors">
          <div className="text-sm font-semibold text-slate-900 tracking-tight">Kategori Bilgisi</div>
          <div className="mt-2 text-[13px] leading-relaxed text-slate-600">{picked.sub.def}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full bg-white border border-slate-200 text-slate-700">{picked.main.mainSDG}</Badge>
            {picked.sub.sdgs.slice(0, 2).map((t) => (
              <Badge key={t} variant="secondary" className="rounded-full bg-white border border-slate-200 text-slate-700">{t}</Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
