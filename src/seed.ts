// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './users/seeds/seed.service';

const TARGET_MAP: Record<string, string> = {
  role: 'roles',
  roles: 'roles',
  user: 'users',
  users: 'users',
  product: 'products',
  products: 'products',
  all: 'all',
};

function parseTargets(args: string[]) {
  return args.map((arg) => TARGET_MAP[arg.replace(/^--?/, '').toLowerCase()] || '').filter(Boolean);
}

function printUsage() {
  console.log('Usage: npm run seed -- [roles|users|products|all]');
  console.log('Examples:');
  console.log('  npm run seed -- users');
  console.log('  npm run seed -- products');
  console.log('  npm run seed -- roles');
  console.log('  npm run seed -- all');
}

async function bootstrap() {
  // Create an application context rather than a full HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Retrieve the SeedService from the dependency injection container
  const seedService = app.get(SeedService);
  
  const rawArgs = process.argv.slice(2).filter(Boolean);
  const targets = parseTargets(rawArgs);
  if (rawArgs.length > 0 && targets.length !== rawArgs.length) {
    console.error('❌ Invalid seed target(s):', rawArgs.join(' '));
    printUsage();
    await app.close();
    process.exit(1);
  }

  const effectiveTargets = targets.length > 0 ? targets : ['all'];

  console.log('🌱 Starting database seed for:', effectiveTargets.join(', '));
  
  try {
    await seedService.runSeed(effectiveTargets);
    console.log('✅ Database seed completed');
  } catch (error) {
    console.error('❌ Seeding failed', error);
    process.exit(1);
  } finally {
    // Close the database connection and exit
    await app.close();
    process.exit(0);
  }
}

bootstrap();