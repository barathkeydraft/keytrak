import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create super admin user
  const hashedPassword = await bcrypt.hash('superadmin123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@keytrak.com' },
    update: {},
    create: {
      email: 'superadmin@keytrak.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Created super admin:', superAdmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 