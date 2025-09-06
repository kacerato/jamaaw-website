import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool, { User, AdminUser } from './database';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function registerUser(email: string, password: string): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(password);
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email, hashedPassword]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }
    
    // Verificar se é admin
    const adminResult = await pool.query(
      'SELECT * FROM admin_users WHERE user_id = $1',
      [user.id]
    );
    
    const isAdmin = adminResult.rows.length > 0;
    
    return {
      id: user.id,
      email: user.email,
      isAdmin
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    
    // Verificar se é admin
    const adminResult = await pool.query(
      'SELECT * FROM admin_users WHERE user_id = $1',
      [user.id]
    );
    
    const isAdmin = adminResult.rows.length > 0;
    
    return {
      id: user.id,
      email: user.email,
      isAdmin
    };
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

export async function makeUserAdmin(userId: string): Promise<boolean> {
  try {
    await pool.query(
      'INSERT INTO admin_users (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [userId]
    );
    return true;
  } catch (error) {
    console.error('Erro ao tornar usuário admin:', error);
    return false;
  }
}

