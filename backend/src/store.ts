import { PrismaClient } from "@prisma/client";
import type { Team, Session, Judge, JudgeScores } from "./types.js";
import { logger } from "./lib/logger.js";

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export async function getAuditLogs() {
  return await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTeams(): Promise<Team[]> {
  const teams = await prisma.team.findMany();
  return teams.map((t: any) => ({
    ...t,
    members: t.members as unknown as any[],
    badges: t.badges as unknown as any[],
    scores: t.scores as unknown as JudgeScores,
  }));
}

export async function getTeamById(id: string): Promise<Team | undefined> {
  const t = await prisma.team.findUnique({ where: { id } });
  if (!t) return undefined;
  return {
    ...t,
    members: t.members as unknown as any[],
    badges: t.badges as unknown as any[],
    scores: t.scores as unknown as JudgeScores,
  };
}

export async function setTeams(newTeams: Team[]): Promise<void> {
  // Replace teams is tricky in SQL: usually clear and insert
  await prisma.team.deleteMany();
  await prisma.team.createMany({
    data: newTeams.map(t => ({
      ...t,
      members: t.members as any,
      badges: t.badges as any,
      scores: t.scores as any,
    }))
  });
}

export async function upsertTeam(team: Team): Promise<Team> {
  const data = {
    week: team.week,
    name: team.name,
    captain: team.captain,
    members: team.members as any,
    tournamentCategory: team.tournamentCategory,
    tournamentTier: team.tournamentTier,
    projectTitle: team.projectTitle,
    createdAtISO: team.createdAtISO,
    badges: team.badges as any,
    scores: team.scores as any,
    judgeNote: team.judgeNote,
    tournament: team.tournament,
    school: team.school,
    projectMainCategory: team.projectMainCategory,
    projectSubCategory: team.projectSubCategory,
    assignedJudgeId: team.assignedJudgeId,
    scoresEnteredByJudgeId: team.scoresEnteredByJudgeId
  };

  const t = await prisma.team.upsert({
    where: { id: team.id },
    create: { id: team.id, ...data },
    update: data,
  });

  return {
    ...t,
    members: t.members as unknown as any[],
    badges: t.badges as unknown as any[],
    scores: t.scores as unknown as JudgeScores,
  };
}

export async function deleteTeam(id: string): Promise<boolean> {
  try {
    await prisma.team.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}

export async function updateTeamScores(teamId: string, scores: Team["scores"], badges: Team["badges"], judgeNote: string, scoresEnteredByJudgeId?: string): Promise<Team | undefined> {
  try {
    const existing = await prisma.team.findUnique({ where: { id: teamId } });
    if (!existing) return undefined;

    let newRawScores = (existing.rawScores as Record<string, JudgeScores>) || {};
    let finalScores = scores;

    if (scoresEnteredByJudgeId) {
      newRawScores = { ...newRawScores, [scoresEnteredByJudgeId]: scores };
      
      // Calculate averages from all rawScores
      const judgeIds = Object.keys(newRawScores);
      if (judgeIds.length > 0) {
        finalScores = Object.keys(scores).reduce((acc, key) => {
          const sum = judgeIds.reduce((s, jId) => s + ((newRawScores[jId] as any)[key] || 0), 0);
          acc[key as keyof JudgeScores] = sum / judgeIds.length;
          return acc;
        }, {} as Record<keyof JudgeScores, number>) as JudgeScores;
      }
    }

    const data: any = {
      scores: finalScores as any,
      rawScores: newRawScores as any,
      badges: badges as any,
      judgeNote,
    };
    if (scoresEnteredByJudgeId !== undefined) data.scoresEnteredByJudgeId = scoresEnteredByJudgeId;

    const t = await prisma.team.update({
      where: { id: teamId },
      data,
    });

    if (scoresEnteredByJudgeId) {
      await prisma.auditLog.create({
        data: {
          teamId,
          judgeId: scoresEnteredByJudgeId,
          action: existing?.scores ? "UPDATE_SCORES" : "INSERT_SCORES",
          oldScores: existing?.scores ?? {},
          newScores: scores as any,
        }
      });
    }

    const result = {
      ...t,
      members: t.members as unknown as any[],
      badges: t.badges as unknown as any[],
      scores: t.scores as unknown as JudgeScores,
    };
    
    // Yalnızca Prisma güncellemelerinden sonra index io'sunu import edip emit etmeliyiz
    import("./index.js").then(({ io }) => {
      io.emit("teamUpdated", result);
    }).catch(console.error);

    return result;
  } catch (e) {
    return undefined;
  }
}

export async function replaceTeamsWithMerge(incoming: Team[]): Promise<Team[]> {
  for (const inc of incoming) {
    const existing = await getTeamById(inc.id);
    if (existing) {
      await prisma.team.update({
        where: { id: inc.id },
        data: {
          week: inc.week,
          name: inc.name,
          captain: inc.captain,
          members: inc.members as any,
          tournamentCategory: inc.tournamentCategory,
          tournamentTier: inc.tournamentTier,
          projectTitle: inc.projectTitle,
          tournament: inc.tournament,
          school: inc.school,
          projectMainCategory: inc.projectMainCategory,
          projectSubCategory: inc.projectSubCategory,
        }
      });
    } else {
      await upsertTeam(inc);
    }
  }
  return getTeams();
}

export async function setSession(token: string, session: Session): Promise<void> {
  await prisma.session.upsert({
    where: { token },
    create: {
      token,
      email: session.email,
      role: session.role,
      name: session.name,
    },
    update: {
      email: session.email,
      role: session.role,
      name: session.name,
    }
  });
}

export async function getSession(token: string): Promise<Session | null> {
  const s = await prisma.session.findUnique({ where: { token } });
  if (!s) return null;
  return { email: s.email, role: s.role as any, name: s.name };
}

export async function deleteSession(token: string): Promise<void> {
  try {
    await prisma.session.delete({ where: { token } });
  } catch (e) {
    // Ignore if not exists
  }
}

export async function validateSession(token: string): Promise<Session | null> {
  return getSession(token);
}

export async function getJudges(): Promise<Judge[]> {
  const judges = await prisma.judge.findMany();
  return judges.map((j: any) => ({ ...j, createdAtISO: j.createdAtISO ?? undefined }));
}

export async function getJudgeById(id: string): Promise<Judge | undefined> {
  const j = await prisma.judge.findUnique({ where: { id } });
  if (!j) return undefined;
  return { ...j, createdAtISO: j.createdAtISO ?? undefined };
}

export async function createJudge(judge: Omit<Judge, "id" | "createdAtISO">): Promise<Judge> {
  const id = `j-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const createdAtISO = new Date().toISOString();
  const created = await prisma.judge.create({
    data: {
      id,
      name: judge.name,
      email: judge.email,
      createdAtISO,
    }
  });
  return { ...created, createdAtISO: created.createdAtISO ?? undefined };
}

export async function updateJudge(id: string, patch: Partial<Pick<Judge, "name" | "email">>): Promise<Judge | undefined> {
  try {
    const updated = await prisma.judge.update({
      where: { id },
      data: {
        ...(patch.name ? { name: patch.name } : {}),
        ...(patch.email ? { email: patch.email } : {}),
      }
    });
    return { ...updated, createdAtISO: updated.createdAtISO ?? undefined };
  } catch (e) {
    return undefined;
  }
}

export async function deleteJudge(id: string): Promise<boolean> {
  try {
    await prisma.judge.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}
