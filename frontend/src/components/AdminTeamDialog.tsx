import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Team } from "@/types";
import { safeUUID } from "@/utils/helpers";
import { TeamForm } from "./TeamForm";

export function AdminTeamDialog({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  initial: Team;
  onSubmit: (t: Team) => void;
}) {
  const [draft, setDraft] = useState<Team>(initial);

  useEffect(() => {
    if (!open) return;
    setDraft(initial);
  }, [initial.id, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl rounded-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <DialogHeader>
            <DialogTitle className="text-left">{mode === "create" ? "Takım Ekle" : "Takım Düzenle"}</DialogTitle>
          </DialogHeader>
          <Button variant="ghost" className="rounded-2xl" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-2">
          <TeamForm value={draft} onChange={setDraft} mode={mode} />
        </div>

        <div className="mt-4 flex shrink-0 items-center justify-end gap-2">
          <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>Vazgeç</Button>
          <Button
            className="rounded-2xl"
            onClick={() => {
              const ensuredMembers = draft.members.length
                ? draft.members
                : [{ id: safeUUID(), name: "Kaptan", email: "", school: draft.school, grade: 9 as 9 | 10 | 11, role: "Kaptan" as const }];
              const anyCaptain = ensuredMembers.some((m) => m.role === "Kaptan");
              const ensured2 = anyCaptain ? ensuredMembers : [{ ...ensuredMembers[0], role: "Kaptan" }, ...ensuredMembers.slice(1)];
              const captainName = ensured2.find((m) => m.role === "Kaptan")?.name ?? ensured2[0].name;
              onSubmit({ ...draft, members: ensured2 as import("@/types").TeamMember[], captain: captainName });
              onOpenChange(false);
            }}
          >
            Kaydet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
