import { initializeDatabase, closeDatabase } from '../database/connection';

export async function setupTestDatabase() {
  // Use in-memory database for tests
  process.env.DATABASE_PATH = ':memory:';
  await initializeDatabase();
}

export async function teardownTestDatabase() {
  await closeDatabase();
}
