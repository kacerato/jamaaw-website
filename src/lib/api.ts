import pool from './database';

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: number;
  title?: string;
  before_image_url?: string;
  after_image_url?: string;
  description?: string;
  created_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
  created_at: string;
}

export interface KmzFile {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  coordinates?: any;
  uploaded_by?: number;
  uploaded_at: string;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon?: string;
  active: boolean;
  created_at: string;
}

// Blog Posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM blog_posts ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar posts do blog:', error);
    return [];
  }
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost | null> {
  try {
    const result = await pool.query(
      'INSERT INTO blog_posts (title, content, excerpt, tags, image_url, published) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [post.title, post.content, post.excerpt, post.tags, post.image_url, post.published]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar post do blog:', error);
    return null;
  }
}

export async function updateBlogPost(id: number, post: Partial<BlogPost>): Promise<BlogPost | null> {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(post).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Erro ao atualizar post do blog:', error);
    return null;
  }
}

export async function deleteBlogPost(id: number): Promise<boolean> {
  try {
    await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    return true;
  } catch (error) {
    console.error('Erro ao deletar post do blog:', error);
    return false;
  }
}

// Gallery Items
export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM gallery_images ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar itens da galeria:', error);
    return [];
  }
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem | null> {
  try {
    const result = await pool.query(
      'INSERT INTO gallery_images (title, before_image_url, after_image_url, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [item.title, item.before_image_url, item.after_image_url, item.description]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar item da galeria:', error);
    return null;
  }
}

// FAQs
export async function getFAQs(): Promise<FAQ[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM faqs ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar FAQs:', error);
    return [];
  }
}

export async function createFAQ(faq: Omit<FAQ, 'id' | 'created_at'>): Promise<FAQ | null> {
  try {
    const result = await pool.query(
      'INSERT INTO faqs (question, answer, category) VALUES ($1, $2, $3) RETURNING *',
      [faq.question, faq.answer, faq.category]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar FAQ:', error);
    return null;
  }
}

// KMZ Files
export async function getKmzFiles(): Promise<KmzFile[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM kmz_files ORDER BY uploaded_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar arquivos KMZ:', error);
    return [];
  }
}

export async function createKmzFile(file: Omit<KmzFile, 'id' | 'uploaded_at'>): Promise<KmzFile | null> {
  try {
    const result = await pool.query(
      'INSERT INTO kmz_files (filename, original_name, file_path, coordinates, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [file.filename, file.original_name, file.file_path, file.coordinates, file.uploaded_by]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar arquivo KMZ:', error);
    return null;
  }
}

// Social Links
export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM social_links WHERE active = true ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar links sociais:', error);
    return [];
  }
}

export async function createSocialLink(link: Omit<SocialLink, 'id' | 'created_at'>): Promise<SocialLink | null> {
  try {
    const result = await pool.query(
      'INSERT INTO social_links (platform, url, icon, active) VALUES ($1, $2, $3, $4) RETURNING *',
      [link.platform, link.url, link.icon, link.active]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar link social:', error);
    return null;
  }
}

