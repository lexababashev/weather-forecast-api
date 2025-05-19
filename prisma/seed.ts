import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.subscription.createMany({
    data: [
      {
        email: 'test1@example.com',
        city: 'Kyiv',
        frequency: 'HOURLY',
        token: 'token1',
        confirmed: true,
      },
    ],
  });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());