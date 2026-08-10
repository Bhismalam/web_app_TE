const prisma = require("../lib/prisma");

function parseTimeToSeconds(time) {
  const [min, sec] = time.split(":");
  return Number(min) * 60 + Number(sec);
}

const ACTIVE_WINDOW_DAYS = 30;

async function getDashboardStats(req, res) {
  const athletes = await prisma.athleteProfile.findMany({
    include: {
      user: { select: { name: true } },
      timeTrials: { orderBy: { date: "asc" } },
    },
  });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ACTIVE_WINDOW_DAYS);

  let activeTraining = 0;
  const improvements = [];
  const needAttention = [];

  for (const athlete of athletes) {
    const trials = athlete.timeTrials;
    const hasRecentTrial = trials.some((t) => new Date(t.date) >= cutoff);
    if (hasRecentTrial) activeTraining += 1;

    let progress = null;
    if (trials.length > 1) {
      const last = trials[trials.length - 1];
      const previousBest = trials
        .slice(0, -1)
        .reduce((best, t) => (parseTimeToSeconds(t.time) < parseTimeToSeconds(best.time) ? t : best));
      const prevSec = parseTimeToSeconds(previousBest.time);
      const lastSec = parseTimeToSeconds(last.time);
      progress = ((prevSec - lastSec) / prevSec) * 100;
      improvements.push(progress);
    }

    if (!hasRecentTrial || (progress !== null && progress < 0)) {
      needAttention.push({
        id: athlete.id,
        name: athlete.user.name,
        reason: !hasRecentTrial ? "Tidak ada aktivitas 30 hari terakhir" : "Performa menurun",
      });
    }
  }

  const averageImprovement =
    improvements.length > 0
      ? improvements.reduce((sum, v) => sum + v, 0) / improvements.length
      : null;

  return res.json({
    totalAthletes: athletes.length,
    activeTraining,
    averageImprovement,
    needAttention,
  });
}

module.exports = { getDashboardStats };
