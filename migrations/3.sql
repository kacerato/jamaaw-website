
CREATE TABLE street_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  street_id INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'work', -- 'before', 'during', 'after', 'work'
  description TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add coordinates to admin users for setting default location
ALTER TABLE admin_users ADD COLUMN default_lat REAL;
ALTER TABLE admin_users ADD COLUMN default_lng REAL;
