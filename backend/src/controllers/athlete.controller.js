const prisma = require("../lib/prisma");

async function listAthletes(req, res) {
  const athletes = await prisma.athleteProfile.findMany({
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
      eventEntries: { include: { event: true } },
    },
  });

  if (!athlete) {
    return res.status(404).json({ error: "Atlet tidak ditemukan" });
  }

  return res.json(athlete);
}

async function updateAthlete(req, res) {
  const { id } = req.params;
  const { athleteNumber, kta, birthDate, category, club, photoUrl } = req.body;

  const athlete = await prisma.athleteProfile.update({
    where: { id },
    data: { athleteNumber, kta, birthDate, category, club, photoUrl },
  });

  return res.json(athlete);
}

module.exports = { listAthletes, getAthlete, updateAthlete };
