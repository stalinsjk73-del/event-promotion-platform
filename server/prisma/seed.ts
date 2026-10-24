import { prisma, INITIAL_USERS, INITIAL_EVENTS } from '../src/utils/prisma';

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert users
  for (const user of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
      },
    });
    console.log(`  ✓ Seeded user: ${user.email} (${user.role})`);
  }

  // Upsert events
  for (const event of INITIAL_EVENTS) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {
        title: event.title,
        summary: event.summary,
        description: event.description,
        imageUrl: event.imageUrl,
        category: event.category,
        technologies: event.technologies,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        timezone: event.timezone,
        venue: event.venue,
        onlineUrl: event.onlineUrl,
        format: event.format,
        targetAudience: event.targetAudience,
        registrationUrl: event.registrationUrl,
        status: event.status,
        organizerId: event.organizerId,
      },
      create: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        summary: event.summary,
        description: event.description,
        imageUrl: event.imageUrl,
        category: event.category,
        technologies: event.technologies,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        timezone: event.timezone,
        venue: event.venue,
        onlineUrl: event.onlineUrl,
        format: event.format,
        targetAudience: event.targetAudience,
        registrationUrl: event.registrationUrl,
        status: event.status,
        organizerId: event.organizerId,
      },
    });
    console.log(`  ✓ Seeded event: ${event.title} [${event.status}]`);
  }

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
