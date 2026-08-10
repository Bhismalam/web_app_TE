const prisma = require("../lib/prisma");

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

async function listSessions(req, res) {
  const { from, to } = req.query;
  const where = {};

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = startOfDay(from);
    if (to) where.date.lte = endOfDay(to);
  }

  const sessions = await prisma.trainingSession.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return res.json(sessions);
}

async function listToday(req, res) {
  const now = new Date();
  const sessions = await prisma.trainingSession.findMany({
    where: { date: { gte: startOfDay(now), lte: endOfDay(now) } },
    orderBy: { startTime: "asc" },
  });

  return res.json(sessions);
}

async function createSession(req, res) {
  const { title, date, startTime, endTime, description } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: "title dan date wajib diisi" });
  }

  const session = await prisma.trainingSession.create({
    data: { title, date: new Date(date), startTime, endTime, description },
  });

  return res.status(201).json(session);
}

module.exports = { listSessions, listToday, createSession };
