const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'calapp.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// テーブル作成
db.exec(`
  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_en TEXT,
    calories_per_100g REAL NOT NULL,
    protein REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    image_url TEXT,
    food_name TEXT NOT NULL,
    food_id INTEGER,
    portion_grams REAL NOT NULL DEFAULT 100,
    calories REAL NOT NULL,
    protein REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (food_id) REFERENCES foods(id)
  );

  CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
  CREATE INDEX IF NOT EXISTS idx_meals_user ON meals(user_id);
`);

module.exports = db;
