const prisma = require("../lib/prisma");

const eventInclude = {
  categories: { orderBy: { fee: "asc" } },
};

const eventDetailInclude = {
  categories: { orderBy: { fee: "asc" } },
  entries: {
    orderBy: { registeredAt: "asc" },
    include: {
      athlete: { include: { user: { select: { id: true, name: true } } } },
      categories: { include: { category: true } },
    },
  },
};

async function listEvents(req, res) {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: eventInclude,
  });
  return res.json(events);
}

async function getEvent(req, res) {
  const { id } = req.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: eventDetailInclude,
  });

  if (!event) {
    return res.status(404).json({ error: "Event tidak ditemukan" });
  }

  // Status pembayaran itu info finansial pribadi: hanya boleh dilihat oleh
  // ADMIN/COACH atau si atlet pemilik pendaftaran itu sendiri.
  const isStaff = req.user.role === "ADMIN" || req.user.role === "COACH";
  const sanitizedEntries = event.entries.map((entry) => {
    if (isStaff || entry.athlete.user.id === req.user.userId) return entry;
    const { paymentStatus, ...rest } = entry;
    return rest;
  });

  return res.json({ ...event, entries: sanitizedEntries });
}

const SPORTS = ["SWIMMING", "FINSWIMMING"];

async function createEvent(req, res) {
  const { name, date, location, sport, categories } = req.body;

  if (!name || !date || !location) {
    return res.status(400).json({ error: "name, date, location wajib diisi" });
  }

  if (!sport || !SPORTS.includes(sport)) {
    return res.status(400).json({ error: `sport harus salah satu dari: ${SPORTS.join(", ")}` });
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ error: "Minimal 1 nomor/kategori wajib diisi" });
  }

  const CATEGORY_TYPES = ["INDIVIDU", "ESTAFET"];
  const cleanCategories = [];
  for (const c of categories) {
    const catName = typeof c === "string" ? c : c?.name;
    const fee = typeof c === "object" && c !== null ? Number(c.fee) : 0;
    const type = typeof c === "object" && c !== null && c.type ? c.type : "INDIVIDU";
    if (!catName || !catName.trim()) {
      return res.status(400).json({ error: "Nama nomor tidak boleh kosong" });
    }
    if (Number.isNaN(fee) || fee < 0) {
      return res.status(400).json({ error: `Biaya untuk ${catName} tidak valid` });
    }
    if (!CATEGORY_TYPES.includes(type)) {
      return res.status(400).json({ error: `Tipe nomor ${catName} harus INDIVIDU atau ESTAFET` });
    }
    cleanCategories.push({ name: catName.trim(), type, fee: Math.round(fee) });
  }

  const event = await prisma.event.create({
    data: {
      name,
      date: new Date(date),
      location,
      sport,
      categories: { create: cleanCategories },
    },
    include: eventInclude,
  });

  return res.status(201).json(event);
}

async function registerForEvent(req, res) {
  if (req.user.role !== "ATHLETE") {
    return res.status(403).json({ error: "Hanya atlet yang bisa mendaftar event" });
  }

  const { id } = req.params;
  const { categoryIds } = req.body;

  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return res.status(400).json({ error: "Pilih minimal 1 nomor" });
  }

  const athlete = await prisma.athleteProfile.findUnique({
    where: { userId: req.user.userId },
  });
  if (!athlete) {
    return res.status(404).json({ error: "Profil atlet belum ada" });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: { categories: true },
  });
  if (!event) {
    return res.status(404).json({ error: "Event tidak ditemukan" });
  }
  if (event.date.getTime() < Date.now()) {
    return res.status(400).json({ error: "Event sudah lewat, tidak bisa mendaftar" });
  }

  const existing = await prisma.eventEntry.findUnique({
    where: { eventId_athleteId: { eventId: id, athleteId: athlete.id } },
  });
  if (existing) {
    return res.status(409).json({ error: "Kamu sudah terdaftar di event ini" });
  }

  const selected = event.categories.filter((c) => categoryIds.includes(c.id));
  if (selected.length !== categoryIds.length) {
    return res.status(400).json({ error: "Ada nomor yang tidak valid untuk event ini" });
  }

  const entry = await prisma.$transaction(async (tx) => {
    const created = await tx.eventEntry.create({
      data: { eventId: id, athleteId: athlete.id },
    });
    await tx.eventEntryCategory.createMany({
      data: selected.map((c) => ({ entryId: created.id, categoryId: c.id, fee: c.fee })),
    });
    return tx.eventEntry.findUnique({
      where: { id: created.id },
      include: { categories: { include: { category: true } } },
    });
  });

  return res.status(201).json(entry);
}

async function cancelRegistration(req, res) {
  if (req.user.role !== "ATHLETE") {
    return res.status(403).json({ error: "Hanya atlet yang bisa membatalkan pendaftaran" });
  }

  const { id } = req.params;
  const athlete = await prisma.athleteProfile.findUnique({
    where: { userId: req.user.userId },
  });
  if (!athlete) {
    return res.status(404).json({ error: "Profil atlet belum ada" });
  }

  const entry = await prisma.eventEntry.findUnique({
    where: { eventId_athleteId: { eventId: id, athleteId: athlete.id } },
  });
  if (!entry) {
    return res.status(404).json({ error: "Kamu belum terdaftar di event ini" });
  }
  if (entry.paymentStatus === "PAID") {
    return res
      .status(400)
      .json({ error: "Pembayaran sudah dikonfirmasi, hubungi admin/coach untuk membatalkan" });
  }

  await prisma.eventEntry.delete({ where: { id: entry.id } });
  return res.status(204).send();
}

async function setPaymentStatus(req, res) {
  const { id, entryId } = req.params;
  const { paymentStatus } = req.body;

  if (!["PAID", "UNPAID"].includes(paymentStatus)) {
    return res.status(400).json({ error: "paymentStatus harus PAID atau UNPAID" });
  }

  const entry = await prisma.eventEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.eventId !== id) {
    return res.status(404).json({ error: "Pendaftaran tidak ditemukan" });
  }

  const updated = await prisma.eventEntry.update({
    where: { id: entryId },
    data: { paymentStatus },
    include: {
      athlete: { include: { user: { select: { id: true, name: true } } } },
      categories: { include: { category: true } },
    },
  });

  return res.json(updated);
}

module.exports = {
  listEvents,
  getEvent,
  createEvent,
  registerForEvent,
  cancelRegistration,
  setPaymentStatus,
};
