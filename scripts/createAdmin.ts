#!/usr/bin/env tsx
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function usage() {
  console.log(`\nCreate or promote an admin user\n\nUsage:\n  tsx scripts/createAdmin.ts --email <email> --password <pwd> [--username <name>] [--name <display>]\n\nExamples:\n  npm run admin:create -- --email admin@example.com --password "StrongPwd#123"\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = String(args.email || '').trim().toLowerCase();
  const password = String(args.password || '').trim();
  const usernameArg = (args.username as string | undefined)?.trim();
  const nameArg = (args.name as string | undefined)?.trim();

  if (!email || !password) {
    usage();
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  // Generate a unique username if needed
  let username = usernameArg || (email.includes('@') ? email.split('@')[0] : `admin`);
  if (!existing) {
    let suffix = 0;
    // ensure unique username
    while (true) {
      const candidate = suffix === 0 ? username : `${username}${suffix}`;
      const conflict = await prisma.user.findUnique({ where: { username: candidate } });
      if (!conflict) { username = candidate; break; }
      suffix++;
    }
  } else {
    // keep existing username if not provided
    username = existing.username;
  }

  const hashedPassword = await hash(password, 10);

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        hashedPassword,
        role: 'ADMIN',
        name: nameArg ?? existing.name ?? 'Admin',
      },
    });
    console.log(`Updated user ${updated.email} to ADMIN.`);
  } else {
    const created = await prisma.user.create({
      data: {
        email,
        username,
        hashedPassword,
        name: nameArg ?? 'Admin',
        role: 'ADMIN',
      },
    });
    console.log(`Created ADMIN user ${created.email} (username: ${created.username}).`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

