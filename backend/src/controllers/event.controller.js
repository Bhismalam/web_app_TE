const prisma = require("../lib/prisma");

async function listEvents(req, res) {
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
  return res.json(events);
}

async function getEvent(req, res) {
  const { id } = req.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { entries: { include: { athlete: { include: { user: true } } } } },
  });

  if (!event) {
    return res.status(404).json({ error: "Event tidak ditemukan" });
  }

  return res.json(event);
}

async function createEvent(req, res) {
  const { name, date, location, categories } = req.body;

  if (!name || !date || !location) {
    return res.status(400).json({ error: "name, date, location wajib diisi" });
  }

  const event = await prisma.event.create({
    data: { name, date: new Date(date), location, categories },
  });

  return res.status(201).json(event);
}

module.exports = { listEvents, getEvent, createEvent };
