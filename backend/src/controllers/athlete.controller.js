const prisma = require("../lib/prisma");

const SPORTS = ["SWIMMING", "FINSWIMMING"];

const eventEntriesInclude = {
  event: { include: { categories: true } },
  categories: { include: { category: true } },
};

async function listAthletes(req, res) {
  const { sport } = req.query;

  if (sport && !SPORTS.includes(sport)) {
    return res.status(400).json({ error: `sport harus salah satu dari: ${SPORTS.join(", ")}` });
  }

  const athletes = await prisma.athleteProfile.findMany({
    where: sport ? { sport } : undefined,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return res.json(athletes);
}

async function getAthlete(req, res) {
  const { id } = req.params;
  const athlete = await prisma.athleteProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      timeTrials: true,
      eventEntries: { include: eventEntriesInclude },
    },
  });

  if (!athlete) {
    return res.status(404).json({ error: "Atlet tidak ditemukan" });
  }

  return res.json(athlete);
}

async function getMe(req, res) {
  if (req.user.role !== "ATHLETE") {
    return res.status(403).json({ error: "Hanya untuk role ATHLETE" });
  }

  const athlete = await prisma.athleteProfile.findUnique({
    where: { userId: req.user.userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      timeTrials: { orderBy: { date: "asc" } },
      eventEntries: { include: eventEntriesInclude },
    },
  });

  if (!athlete) {
    return res.status(404).json({ error: "Profil atlet belum ada" });
  }

  return res.json(athlete);
}

async function updateAthlete(req, res) {
  const { id } = req.params;
  const { athleteNumber, kta, birthDate, category, sport, club, photoUrl } = req.body;

  if (sport && !SPORTS.includes(sport)) {
    return res.status(400).json({ error: `sport harus salah satu dari: ${SPORTS.join(", ")}` });
  }

  const athlete = await prisma.athleteProfile.update({
    where: { id },
    data: {
      athleteNumber,
      kta,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      category,
      sport,
      club,
      photoUrl,
    },
  });

  return res.json(athlete);
}

module.exports = { listAthletes, getAthlete, getMe, updateAthlete };
