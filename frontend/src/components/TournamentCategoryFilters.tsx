import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TOURNAMENT_CATALOG } from "@/constants/catalog";
import type { TournamentCategory, TournamentTier } from "@/types";

export function TournamentCategoryFilters({
  category,
  tier,
  onCategory,
  onTier,
}: {
  category: TournamentCategory;
  tier: TournamentTier;
  onCategory: (v: TournamentCategory) => void;
  onTier: (v: TournamentTier) => void;
}) {
  const current = TOURNAMENT_CATALOG.find((x) => x.category === category) ?? TOURNAMENT_CATALOG[0];
  const tiers = current.tiers;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <Label className="text-xs text-zinc-600">Turnuva Kategorisi</Label>
        <Select
          value={category}
          onValueChange={(v) => {
            const c = v as TournamentCategory;
            const defTier = (TOURNAMENT_CATALOG.find((x) => x.category === c)?.tiers?.[0] ?? TOURNAMENT_CATALOG[0].tiers[0]) as TournamentTier;
            onCategory(c);
            onTier(defTier);
          }}
        >
          <SelectTrigger className="mt-1 rounded-2xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOURNAMENT_CATALOG.map((c) => (
              <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-zinc-600">Turnuva Türü ve Seviyesi</Label>
        <Select value={tier} onValueChange={(v) => onTier(v as TournamentTier)}>
          <SelectTrigger className="mt-1 rounded-2xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tiers.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2 rounded-3xl border bg-white/60 p-4">
        <div className="text-xs font-black text-zinc-900">Kategori Bilgisi</div>
        <div className="mt-2 text-xs text-zinc-700">{current.desc}</div>
      </div>
    </div>
  );
}
