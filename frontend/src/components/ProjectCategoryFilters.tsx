import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <Label className="text-xs text-slate-600">Proje Ana Kategori</Label>
        <Select value={mainValue} onValueChange={(v) => { onMain(v); onSub("all"); }}>
          <SelectTrigger className="mt-1 rounded-2xl">
            <SelectValue placeholder="Ana Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {mains.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-slate-600">Proje Alt Kategori</Label>
        <Select value={subValue} onValueChange={onSub}>
          <SelectTrigger className="mt-1 rounded-2xl" disabled={mainValue === "all"}>
            <SelectValue placeholder="Alt Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {subs.map((s) => (
              <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {picked ? (
        <div className="md:col-span-2 rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="text-xs font-semibold text-slate-800">Kategori Bilgisi</div>
          <div className="mt-2 text-xs text-slate-700">{picked.sub.def}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">{picked.main.mainSDG}</Badge>
            {picked.sub.sdgs.slice(0, 2).map((t) => (
              <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
