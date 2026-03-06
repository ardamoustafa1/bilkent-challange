import { PROJECT_CATEGORIES } from "@/constants/projectCategories";

export function resolveSubMeta(main?: string, sub?: string) {
  if (!main || !sub) return null;
  const m = PROJECT_CATEGORIES.find((x) => x.main === main);
  const s = m?.subs.find((y) => y.name === sub);
  if (!m || !s) return null;
  return { main: m, sub: s };
}
