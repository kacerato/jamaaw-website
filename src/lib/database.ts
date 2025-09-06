import { Pool } from 'pg';

const pool = new Pool({
  connectionString: import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  is_super_admin: boolean;
  created_at: string;
}

export interface KmzFile {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  storage_path: string;
  uploaded_at: string;
  processed: boolean;
  processed_at?: string;
  created_at: string;
}

export interface KmzCoordinate {
  id: string;
  kmz_file_id: string;
  latitude: number;
  longitude: number;
  name?: string;
  description?: string;
  created_at: string;
}

