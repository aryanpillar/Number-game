import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

let db: sqlite3.Database;

function getDatabase(): sqlite3.Database {
  if (!db) {
    const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/database.sqlite');
    
    // Ensure data directory exists
    const dataDir = path.dirname(DATABASE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create database connection
    db = new sqlite3.Database(DATABASE_PATH);
  }
  return db;
}

// Promisified database methods
export function dbRun(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    getDatabase().run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function dbGet(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    getDatabase().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function dbAll(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    getDatabase().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize database with schema
export async function initializeDatabase(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  // Split by semicolon and execute each statement
  const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
  
  for (const statement of statements) {
    await dbRun(statement);
  }
  
  console.log('Database initialized successfully');
}

// Close database connection
export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }
    db.close((err) => {
      if (err) reject(err);
      else {
        db = null as any;
        resolve();
      }
    });
  });
}

export default getDatabase;
