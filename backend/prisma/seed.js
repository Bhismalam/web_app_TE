const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const athleteUser = await prisma.user.upsert({
    where: { email: "bhisma@swimclub.test" },
    update: {},
    create: {
      name: "Bhisma",
      email: "bhisma@swimclub.test",
      password: passwordHash,
      role: "ATHLETE",
      athleteProfile: {
        create: {
          athleteNumber: "FS-0231",
          kta: "BALI-FS-2026-0231",
          birthDate: new Date("2008-05-12"),
          category: "JUNIOR",
          club: "Bali Finswimming Club",
        },
      },
    },
    include: { athleteProfile: true },
  });

  await prisma.user.upsert({
    where: { email: "coach@swimclub.test" },
    update: {},
    create: {
      name: "Coach Made",
      email: "coach@swimclub.test",
      password: passwordHash,
      role: "COACH",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@swimclub.test" },
    update: {},
    create: {
      name: "Admin Club",
      email: "admin@swimclub.test",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  const athleteProfileId = athleteUser.athleteProfile.id;

  const events = [
    {
      id: "seed-event-bali-championship",
      name: "Bali Championship 2026",
      date: new Date("2026-09-12"),
      location: "Denpasar Pool",
      categories: ["50M", "100M", "200M"],
      result: null,
    },
    {
      id: "seed-event-nationals-2025",
      name: "Kejurnas Finswimming 2025",
      date: new Date("2025-11-20"),
      location: "Jakarta Aquatic Center",
      categories: ["50M", "100M"],
      result: "GOLD",
    },
    {
      id: "seed-event-regional-2025",
      name: "Kejurda Bali 2025",
      date: new Date("2025-06-15"),
      location: "Denpasar Pool",
      categories: ["50M"],
      result: "SILVER",
    },
    {
      id: "seed-event-club-cup-2025",
      name: "Club Cup 2025",
      date: new Date("2025-03-02"),
      location: "Sanur Pool",
      categories: ["50M", "100M"],
      result: "BRONZE",
    },
  ];

  for (const { result, ...eventData } of events) {
    const event = await prisma.event.upsert({
      where: { id: eventData.id },
      update: {},
      create: eventData,
    });

    await prisma.eventEntry.upsert({
      where: { eventId_athleteId: { eventId: event.id, athleteId: athleteProfileId } },
      update: { result },
      create: { eventId: event.id, athleteId: athleteProfileId, result },
    });
  }

  const athleteId = athleteUser.athleteProfile.id;
  await prisma.timeTrial.deleteMany({ where: { athleteId, category: "50M Surface" } });
  await prisma.timeTrial.createMany({
    data: [
      { athleteId, category: "50M Surface", date: new Date("2026-06-10"), time: "00:24.30" },
      { athleteId, category: "50M Surface", date: new Date("2026-07-05"), time: "00:23.90" },
      {
        athleteId,
        category: "50M Surface",
        date: new Date("2026-08-10"),
        time: "00:22.80",
        condition: "Pool 25M",
        coachNote: "Start bagus, perlu improve turn",
        startRating: 4,
        speedRating: 3,
        techniqueRating: 4,
        recommendation: "Fokus latihan: underwater kick, breathing control",
      },
    ],
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.trainingSession.deleteMany({ where: { title: "Sprint Training" } });
  await prisma.trainingSession.create({
    data: {
      title: "Sprint Training",
      date: today,
      startTime: "17:00",
      endTime: "19:00",
      description: "Latihan sprint rutin",
    },
  });

  // Atlet tambahan untuk data Coach Dashboard yang bervariasi
  const aryaUser = await prisma.user.upsert({
    where: { email: "arya@swimclub.test" },
    update: {},
    create: {
      name: "Arya",
      email: "arya@swimclub.test",
      password: passwordHash,
      role: "ATHLETE",
      athleteProfile: {
        create: { athleteNumber: "FS-0245", category: "SENIOR", club: "Bali Finswimming Club" },
      },
    },
    include: { athleteProfile: true },
  });
  const aryaId = aryaUser.athleteProfile.id;
  await prisma.timeTrial.deleteMany({ where: { athleteId: aryaId } });
  await prisma.timeTrial.createMany({
    data: [
      { athleteId: aryaId, category: "50M Surface", date: new Date("2026-07-01"), time: "00:25.00" },
      { athleteId: aryaId, category: "50M Surface", date: new Date("2026-08-05"), time: "00:26.10" },
    ],
  });

  const putuUser = await prisma.user.upsert({
    where: { email: "putu@swimclub.test" },
    update: {},
    create: {
      name: "Putu",
      email: "putu@swimclub.test",
      password: passwordHash,
      role: "ATHLETE",
      athleteProfile: {
        create: { athleteNumber: "FS-0258", category: "JUNIOR", club: "Bali Finswimming Club" },
      },
    },
    include: { athleteProfile: true },
  });
  const putuId = putuUser.athleteProfile.id;
  await prisma.timeTrial.deleteMany({ where: { athleteId: putuId } });
  await prisma.timeTrial.createMany({
    data: [
      { athleteId: putuId, category: "50M Surface", date: new Date("2026-04-01"), time: "00:27.00" },
      { athleteId: putuId, category: "50M Surface", date: new Date("2026-04-20"), time: "00:26.50" },
    ],
  });

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
