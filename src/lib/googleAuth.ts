import pool from './database';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  google_id: string;
  isAdmin: boolean;
}

export async function createOrUpdateGoogleUser(googleProfile: {
  id: string;
  email: string;
  name: string;
  picture: string;
}): Promise<GoogleUser | null> {
  try {
    // Verificar se o usuário já existe
    let result = await pool.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [googleProfile.id, googleProfile.email]
    );

    let user;
    
    if (result.rows.length === 0) {
      // Criar novo usuário
      result = await pool.query(
        'INSERT INTO users (email, google_id, name, picture) VALUES ($1, $2, $3, $4) RETURNING *',
        [googleProfile.email, googleProfile.id, googleProfile.name, googleProfile.picture]
      );
      user = result.rows[0];
    } else {
      // Atualizar usuário existente
      user = result.rows[0];
      await pool.query(
        'UPDATE users SET google_id = $1, name = $2, picture = $3 WHERE id = $4',
        [googleProfile.id, googleProfile.name, googleProfile.picture, user.id]
      );
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
      name: user.name,
      picture: user.picture,
      google_id: user.google_id,
      isAdmin
    };
  } catch (error) {
    console.error('Erro ao criar/atualizar usuário Google:', error);
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

export async function getUserByGoogleId(googleId: string): Promise<GoogleUser | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
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
      name: user.name,
      picture: user.picture,
      google_id: user.google_id,
      isAdmin
    };
  } catch (error) {
    console.error('Erro ao buscar usuário por Google ID:', error);
    return null;
  }
}

