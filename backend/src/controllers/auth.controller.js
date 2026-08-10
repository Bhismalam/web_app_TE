const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

const SPORTS = ["SWIMMING", "FINSWIMMING"];

async function register(req, res) {
  const { name, email, password, sport } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, password wajib diisi" });
  }

  if (sport && !SPORTS.includes(sport)) {
    return res.status(400).json({ error: `sport harus salah satu dari: ${SPORTS.join(", ")}` });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email sudah terdaftar" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: "ATHLETE",
      athleteProfile: { create: sport ? { sport } : {} },
    },
  });

  const token = signToken(user);
  return res.status(201).json({ token, user: toPublicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Email atau password salah" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Email atau password salah" });
  }

  const token = signToken(user);
  return res.json({ token, user: toPublicUser(user) });
}

const STAFF_ROLES = ["COACH", "ADMIN"];

async function registerStaff(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "name, email, password, role wajib diisi" });
  }

  if (!STAFF_ROLES.includes(role)) {
    return res.status(400).json({ error: `role harus salah satu dari: ${STAFF_ROLES.join(", ")}` });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email sudah terdaftar" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: passwordHash, role },
  });

  return res.status(201).json(toPublicUser(user));
}

module.exports = { register, login, registerStaff };
