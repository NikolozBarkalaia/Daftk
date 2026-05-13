const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dataDir, 'daftk.db'));

db.exec("PRAGMA journal_mode = WAL");
// Foreign keys intentionally OFF: orders support guests (no userId)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    isAdmin INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    oldPrice REAL,
    imageUrls TEXT NOT NULL DEFAULT '[]',
    category TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    stock INTEGER NOT NULL DEFAULT 0,
    isFeatured INTEGER NOT NULL DEFAULT 0,
    luxuryLabel TEXT,
    hasBadge INTEGER NOT NULL DEFAULT 0,
    badgeText TEXT,
    badgeBgColor TEXT DEFAULT '#000000',
    badgeTextColor TEXT DEFAULT '#ffffff',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    sizeStock TEXT DEFAULT '{}'
  );
`);

// Migration: Add badge columns if they don't exist
try {
  db.prepare("SELECT hasBadge FROM products LIMIT 1").get();
} catch (err) {
  db.exec(`
    ALTER TABLE products ADD COLUMN hasBadge INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE products ADD COLUMN badgeText TEXT;
    ALTER TABLE products ADD COLUMN badgeBgColor TEXT DEFAULT '#000000';
    ALTER TABLE products ADD COLUMN badgeTextColor TEXT DEFAULT '#ffffff';
  `);
}

// Migration: Add sizeStock column if it doesn't exist
try {
  db.prepare("SELECT sizeStock FROM products LIMIT 1").get();
} catch (err) {
  db.exec(`
    ALTER TABLE products ADD COLUMN sizeStock TEXT DEFAULT '{}';
  `);
}

// Migration: Add emailVerified column if it doesn't exist
try {
  db.prepare("SELECT emailVerified FROM users LIMIT 1").get();
} catch (err) {
  db.exec(`ALTER TABLE users ADD COLUMN emailVerified INTEGER NOT NULL DEFAULT 0;`);
}

// Posts table removed - feature is no longer used
/*
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);
*/

db.exec(`
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS hero (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    buttonText TEXT NOT NULL,
    buttonLink TEXT NOT NULL,
    mediaType TEXT NOT NULL DEFAULT 'video',
    mediaId INTEGER,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS slider_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    buttonText TEXT NOT NULL DEFAULT 'Discover',
    buttonLink TEXT,
    mediaType TEXT NOT NULL DEFAULT 'image',
    mediaId INTEGER NOT NULL,
    displayOrder INTEGER NOT NULL DEFAULT 0,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    items TEXT NOT NULL DEFAULT '[]',
    shippingAddress TEXT NOT NULL DEFAULT '{}',
    subtotal REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log('SQLite connected: data/daftk.db');

// Migration: drop FK on orders.userId and make it nullable (guest support)
try {
  const cols = db.prepare("PRAGMA table_info(orders)").all();
  const userIdCol = cols.find(c => c.name === 'userId');
  // If userId is NOT NULL we need to recreate the table without the FK
  if (userIdCol && userIdCol.notnull === 1) {
    db.exec(`
      PRAGMA foreign_keys = OFF;
      BEGIN;
      CREATE TABLE IF NOT EXISTS orders_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        items TEXT NOT NULL DEFAULT '[]',
        shippingAddress TEXT NOT NULL DEFAULT '{}',
        subtotal REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO orders_v2 SELECT * FROM orders;
      DROP TABLE orders;
      ALTER TABLE orders_v2 RENAME TO orders;
      COMMIT;
    `);
    console.log('✅ orders table migrated: userId is now nullable, FK removed');
  }
} catch (err) {
  console.error('orders migration error:', err.message);
}

// Migration: add token column for unguessable order URLs
try {
  db.prepare("SELECT token FROM orders LIMIT 1").get();
} catch {
  const { randomUUID } = require('node:crypto');
  db.exec(`ALTER TABLE orders ADD COLUMN token TEXT`);
  // Backfill existing rows with a unique token
  const rows = db.prepare("SELECT id FROM orders WHERE token IS NULL").all();
  const upd = db.prepare("UPDATE orders SET token = ? WHERE id = ?");
  for (const row of rows) upd.run(randomUUID(), row.id);
  // Add unique index
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_token ON orders(token)`);
  console.log('✅ orders.token column added and backfilled');
}

module.exports = db;
