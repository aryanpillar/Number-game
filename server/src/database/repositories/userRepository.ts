import { dbRun, dbGet, dbAll } from '../connection';
import { DbUser } from '../../types';

export async function createUser(username: string, passwordHash: string): Promise<number> {
  const result = await dbRun(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, passwordHash]
  );
  return (result as any).lastID;
}

export async function findUserByUsername(username: string): Promise<DbUser | null> {
  const user = await dbGet(
    'SELECT id, username, password_hash, created_at FROM users WHERE username = ?',
    [username]
  );
  return user || null;
}

export async function findUserById(id: number): Promise<DbUser | null> {
  const user = await dbGet(
    'SELECT id, username, password_hash, created_at FROM users WHERE id = ?',
    [id]
  );
  return user || null;
}
