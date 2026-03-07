import { useState, useEffect } from "react";
import { UserPlus, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Judge, Team } from "@/types";
import { api } from "@/services/api";
import { safeUUID } from "@/utils/helpers";

import { LS_JUDGES } from "@/constants/demo";

function readStoredJudges(): Judge[] | null {
  try {
    const raw = localStorage.getItem(LS_JUDGES);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Judge[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredJudges(judges: Judge[]) {
  try {
    localStorage.setItem(LS_JUDGES, JSON.stringify(judges));
  } catch { }
}

type Props = {
  apiAvailable: boolean;
  judges: Judge[];
  setJudges: React.Dispatch<React.SetStateAction<Judge[]>>;
  judgeCandidates: Team[];
  onAssignJudge: (teamId: string, judgeId: string) => void;
  onUnassignJudge: (teamId: string) => void;
  onError?: (message: string) => void;
};

export function JudgePanelModule({
  apiAvailable,
  judges,
  setJudges,
  judgeCandidates,
  onAssignJudge,
  onUnassignJudge,
  onError,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [assignTeamId, setAssignTeamId] = useState("all");
  const [assignJudgeId, setAssignJudgeId] = useState("all");

  useEffect(() => {
    if (apiAvailable) {
      api.getJudges()
        .then(setJudges)
        .catch(() => {
          setJudges(readStoredJudges() ?? []);
          onError?.("Hakem listesi yüklenemedi.");
        });
    } else {
      setJudges(readStoredJudges() ?? []);
    }
  }, [apiAvailable]);

  useEffect(() => {
    if (!apiAvailable) writeStoredJudges(judges);
  }, [judges, apiAvailable]);

  const addJudge = async () => {
    const n = name.trim();
    if (!n) return;
    const e = email.trim().toLowerCase();
    if (apiAvailable) {
      try {
        const created = await api.createJudge({ name: n, email: e });
        setJudges((prev) => [...prev, created]);
        setName("");
        setEmail("");
      } catch {
        onError?.("Hakem eklenemedi.");
      }
      return;
    }
    const newJudge: Judge = {
      id: safeUUID(),
      name: n,
      email: e,
      createdAtISO: new Date().toISOString(),
    };
    setJudges((prev) => [...prev, newJudge]);
    setName("");
    setEmail("");
  };

  const deleteJudge = async (id: string) => {
    if (apiAvailable) {
      try {
        await api.deleteJudge(id);
        setJudges((prev) => prev.filter((j) => j.id !== id));
      } catch {
        onError?.("Hakem silinemedi.");
      }
      return;
    }
    setJudges((prev) => prev.filter((j) => j.id !== id));
  };

  const doAssign = () => {
    if (assignTeamId === "all" || assignJudgeId === "all") return;
    onAssignJudge(assignTeamId, assignJudgeId);
    setAssignTeamId("all");
    setAssignJudgeId("all");
  };

  const doUnassign = (teamId: string) => {
    onUnassignJudge(teamId);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-5">
        <div className="flex items-center gap-2 text-[15px] font-bold text-slate-900 tracking-tight">
          <UserPlus className="h-4 w-4" />
          Hakem listesi & kayıt
        </div>
        <p className="mt-1 text-[13px] text-slate-500">Hakem ekleyin. Veriler KV/localStorage ile saklanır.</p>
        <div className="mt-5 grid gap-4">
          <div>
            <Label className="text-xs font-semibold text-slate-700">Ad Soyad</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hakem adı" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">E-posta</Label>
            <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hakem@okul.k12.tr" />
          </div>
          <Button className="" onClick={addJudge} disabled={!name.trim()}>
            <UserPlus className="mr-2 h-4 w-4" /> Hakem ekle
          </Button>
        </div>
        <div className="mt-5 max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2">
          {judges.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-500">Henüz hakem yok. Yukarıdan ekleyin.</p>
          ) : (
            <ul className="space-y-2">
              {judges.map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
                  <span className="truncate font-semibold text-slate-900">{j.name}</span>
                  <span className="truncate text-[13px] text-slate-500">{j.email || "—"}</span>
                  <Button variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => deleteJudge(j.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 text-[15px] font-bold text-slate-900 tracking-tight">
          <UserCheck className="h-4 w-4" />
          Takıma hakem ata
        </div>
        <p className="mt-1 text-[13px] text-slate-500">Takım seçin, hakem seçin, Ata ile kaydedin.</p>
        <div className="mt-5 grid gap-4">
          <div>
            <Label className="text-xs font-semibold text-slate-700">Takım</Label>
            <Select value={assignTeamId} onValueChange={setAssignTeamId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Takım seçin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Seçiniz</SelectItem>
                {judgeCandidates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Hakem</Label>
            <Select value={assignJudgeId} onValueChange={setAssignJudgeId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Hakem seçin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Seçiniz</SelectItem>
                {judges.map((j) => (
                  <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="" onClick={doAssign} disabled={assignTeamId === "all" || assignJudgeId === "all"}>
            <UserCheck className="mr-2 h-4 w-4" /> Ata
          </Button>
        </div>
        <div className="mt-5 max-h-40 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2">
          <p className="mb-3 text-[13px] font-semibold text-slate-700 px-1">Atanmış hakemler</p>
          {judgeCandidates.filter((t) => t.assignedJudgeId).length === 0 ? (
            <p className="py-2 text-xs text-slate-500">Bu listede atanmış hakem yok.</p>
          ) : (
            <ul className="space-y-1">
              {judgeCandidates
                .filter((t) => t.assignedJudgeId)
                .map((t) => {
                  const j = judges.find((x) => x.id === t.assignedJudgeId);
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] shadow-sm">
                      <span className="truncate font-semibold text-slate-900">{t.name}</span>
                      <span className="truncate text-slate-500">→ {j?.name ?? t.assignedJudgeId}</span>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => doUnassign(t.id)}>
                        Kaldır
                      </Button>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
