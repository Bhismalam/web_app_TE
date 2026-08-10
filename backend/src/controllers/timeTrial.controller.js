const prisma = require("../lib/prisma");

async function listByAthlete(req, res) {
  const { athleteId } = req.params;
  const trials = await prisma.timeTrial.findMany({
    where: { athleteId },
    orderBy: { date: "asc" },
  });
  return res.json(trials);
}

async function createTimeTrial(req, res) {
  const {
    athleteId,
    category,
    date,
    time,
    condition,
    coachNote,
    startRating,
    speedRating,
    techniqueRating,
    recommendation,
  } = req.body;

  if (!athleteId || !category || !date || !time) {
    return res.status(400).json({ error: "athleteId, category, date, time wajib diisi" });
  }

  const trial = await prisma.timeTrial.create({
    data: {
      athleteId,
      category,
      date: new Date(date),
      time,
      condition,
      coachNote,
      startRating,
      speedRating,
      techniqueRating,
      recommendation,
    },
  });

  return res.status(201).json(trial);
}

module.exports = { listByAthlete, createTimeTrial };
