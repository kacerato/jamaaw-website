
CREATE TABLE streets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  neighborhood TEXT,
  latitude REAL,
  longitude REAL,
  status TEXT NOT NULL DEFAULT 'planned',
  notes TEXT,
  completed_at DATETIME,
  started_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE street_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  street_name TEXT NOT NULL,
  neighborhood TEXT,
  description TEXT,
  suggested_by_name TEXT,
  suggested_by_email TEXT,
  is_reviewed BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  reviewed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
