import { Sparkles, Trophy, BadgeCheck, Crown, ShieldCheck, ClipboardList } from "lucide-react";
import type { BadgeId } from "@/types";
import type { LucideIcon } from "lucide-react";

export function badgeMeta(id: BadgeId): { title: string; icon: LucideIcon } {
  const base = {
    prompt: { title: "Prompt Ustası", icon: Sparkles },
    sprint: { title: "Sprint Takımı", icon: Trophy },
    iletisim: { title: "İletişim Gücü", icon: BadgeCheck },
    lider: { title: "Lider Kaptan", icon: Crown },
    gelisim: { title: "Gelişim Zihniyeti", icon: ShieldCheck },
    mimar: { title: "Proje Mimarı", icon: ClipboardList },
  } as const;
  return base[id];
}
