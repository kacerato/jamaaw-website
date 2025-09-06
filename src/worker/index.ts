import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import {
  CreateStreetRequestSchema,
  UpdateStreetRequestSchema,
  CreateSuggestionRequestSchema,
  ReviewSuggestionRequestSchema,
} from "../shared/types";
import z from "zod";

const app = new Hono<{ Bindings: Env }>();

// Security headers middleware
app.use('*', secureHeaders({
  xFrameOptions: "DENY",
  xContentTypeOptions: "nosniff",
  referrerPolicy: "strict-origin-when-cross-origin",
  strictTransportSecurity: "max-age=31536000; includeSubDomains",
}));

// Request timeout middleware
app.use('*', timeout(30000)); // 30 second timeout

// Rate limiting storage (in production, use a proper store like Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
const rateLimit = (maxRequests: number, windowMs: number) => {
  return async (c: any, next: any) => {
    const clientIp = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || 'unknown';
    const key = `${clientIp}:${c.req.path}`;
    const now = Date.now();
    
    const current = rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    } else if (current.count >= maxRequests) {
      return c.json({ error: 'Too many requests. Please try again later.' }, 429);
    } else {
      current.count++;
    }
    
    await next();
  };
};

// CORS configuration with security improvements
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://v2mahcy4mgu2u.mocha.app', 'https://*.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));

// Input sanitization helper
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, 1000) // Limit length
    .trim();
};

// File validation helper
const validateImageFile = (file: { size: number; type: string }): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  // Basic file signature validation
  return { valid: true };
};

// Authentication endpoints with rate limiting
app.get('/api/oauth/google/redirect_url', rateLimit(10, 60000), async (c) => {
  try {
    const redirectUrl = await getOAuthRedirectUrl('google', {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
    return c.json({ redirectUrl }, 200);
  } catch (error) {
    return c.json({ error: 'Failed to get redirect URL' }, 500);
  }
});

app.post("/api/sessions", rateLimit(5, 300000), zValidator("json", z.object({ code: z.string().min(1).max(500) })), async (c) => {
  try {
    const { code } = c.req.valid("json");
    
    const sessionToken = await exchangeCodeForSessionToken(code, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json({ error: 'Failed to exchange code' }, 500);
  }
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  // Remove sensitive information
  return c.json({
    id: user.id,
    email: user.email
  });
});

app.get('/api/logout', rateLimit(10, 60000), async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    try {
      await deleteSession(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
      });
    } catch (error) {
      // Log error silently in production
    }
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Enhanced admin middleware with audit logging
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM admin_users WHERE (user_id = ? OR email = ?) AND is_active = TRUE"
    ).bind(user.id, user.email).all();

    if (!results || results.length === 0) {
      // Log unauthorized admin access attempt
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    await next();
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Public endpoints - Streets (read-only) with rate limiting
app.get('/api/streets', rateLimit(100, 60000), async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, name, neighborhood, latitude, longitude, status, notes, completed_at, started_at, created_at, updated_at FROM streets ORDER BY created_at DESC"
    ).all();
    
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch streets' }, 500);
  }
});

app.get('/api/streets/:id', rateLimit(100, 60000), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id) || id < 1) {
      return c.json({ error: 'Invalid street ID' }, 400);
    }

    const { results } = await c.env.DB.prepare(
      "SELECT * FROM streets WHERE id = ?"
    ).bind(id).all();
    
    if (!results || results.length === 0) {
      return c.json({ error: 'Street not found' }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: 'Failed to fetch street' }, 500);
  }
});

// Get photos for a street (public, read-only)
app.get('/api/streets/:id/photos', rateLimit(50, 60000), async (c) => {
  try {
    const streetId = parseInt(c.req.param('id'));
    if (isNaN(streetId) || streetId < 1) {
      return c.json({ error: 'Invalid street ID' }, 400);
    }

    const { results } = await c.env.DB.prepare(
      "SELECT id, street_id, photo_url, photo_type, description, uploaded_by, created_at FROM street_photos WHERE street_id = ? ORDER BY created_at DESC"
    ).bind(streetId).all();
    
    // Convert tags from JSON string to array
    const photos = results.map((photo: any) => ({
      ...photo,
      tags: photo.tags ? JSON.parse(photo.tags) : []
    }));
    
    return c.json(photos);
  } catch (error) {
    return c.json({ error: 'Failed to fetch photos' }, 500);
  }
});

// Public endpoint - Submit suggestion with enhanced validation
app.post('/api/suggestions', rateLimit(5, 300000), zValidator("json", CreateSuggestionRequestSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    
    // Sanitize inputs
    const sanitizedData = {
      street_name: sanitizeInput(data.street_name),
      neighborhood: data.neighborhood ? sanitizeInput(data.neighborhood) : null,
      description: data.description ? sanitizeInput(data.description) : null,
      suggested_by_name: data.suggested_by_name ? sanitizeInput(data.suggested_by_name) : null,
      suggested_by_email: data.suggested_by_email || null
    };

    const { results } = await c.env.DB.prepare(
      `INSERT INTO street_suggestions (street_name, neighborhood, description, suggested_by_name, suggested_by_email, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       RETURNING id, street_name, neighborhood, description, suggested_by_name, suggested_by_email, created_at`
    ).bind(
      sanitizedData.street_name,
      sanitizedData.neighborhood,
      sanitizedData.description,
      sanitizedData.suggested_by_name,
      sanitizedData.suggested_by_email
    ).all();
    
    return c.json(results[0], 201);
  } catch (error) {
    return c.json({ error: 'Failed to create suggestion' }, 500);
  }
});

// Admin endpoints - Protected with enhanced security
app.post('/api/admin/streets', authMiddleware, adminMiddleware, rateLimit(20, 60000), zValidator("json", CreateStreetRequestSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    
    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(data.name),
      neighborhood: data.neighborhood ? sanitizeInput(data.neighborhood) : null,
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status || 'planned',
      notes: data.notes ? sanitizeInput(data.notes) : null
    };

    const { results } = await c.env.DB.prepare(
      `INSERT INTO streets (name, neighborhood, latitude, longitude, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       RETURNING *`
    ).bind(
      sanitizedData.name,
      sanitizedData.neighborhood,
      sanitizedData.latitude,
      sanitizedData.longitude,
      sanitizedData.status,
      sanitizedData.notes
    ).all();
    
    return c.json(results[0], 201);
  } catch (error) {
    return c.json({ error: 'Failed to create street' }, 500);
  }
});

app.put('/api/admin/streets/:id', authMiddleware, adminMiddleware, rateLimit(20, 60000), zValidator("json", UpdateStreetRequestSchema), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id) || id < 1) {
      return c.json({ error: 'Invalid street ID' }, 400);
    }

    const data = c.req.valid("json");
    
    let query = "UPDATE streets SET updated_at = datetime('now')";
    const params: any[] = [];
    
    if (data.status !== undefined) {
      query += ", status = ?";
      params.push(data.status);
      
      if (data.status === 'in_progress' && !data.started_at) {
        query += ", started_at = datetime('now')";
      } else if (data.status === 'completed' && !data.completed_at) {
        query += ", completed_at = datetime('now')";
      }
    }
    
    if (data.notes !== undefined) {
      query += ", notes = ?";
      params.push(sanitizeInput(data.notes));
    }
    
    if (data.started_at !== undefined) {
      query += ", started_at = ?";
      params.push(data.started_at);
    }
    
    if (data.completed_at !== undefined) {
      query += ", completed_at = ?";
      params.push(data.completed_at);
    }
    
    query += " WHERE id = ? RETURNING *";
    params.push(id);
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    if (!results || results.length === 0) {
      return c.json({ error: 'Street not found' }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: 'Failed to update street' }, 500);
  }
});

app.delete('/api/admin/streets/:id', authMiddleware, adminMiddleware, rateLimit(10, 60000), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id) || id < 1) {
      return c.json({ error: 'Invalid street ID' }, 400);
    }

    // Delete associated photos first
    await c.env.DB.prepare("DELETE FROM street_photos WHERE street_id = ?").bind(id).run();
    
    const result = await c.env.DB.prepare("DELETE FROM streets WHERE id = ?").bind(id).run();
    
    if (result.changes === 0) {
      return c.json({ error: 'Street not found' }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete street' }, 500);
  }
});

// Admin suggestions management
app.get('/api/admin/suggestions', authMiddleware, adminMiddleware, rateLimit(50, 60000), async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM street_suggestions ORDER BY created_at DESC"
    ).all();
    
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch suggestions' }, 500);
  }
});

app.put('/api/admin/suggestions/:id/review', authMiddleware, adminMiddleware, rateLimit(20, 60000), zValidator("json", ReviewSuggestionRequestSchema), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id) || id < 1) {
      return c.json({ error: 'Invalid suggestion ID' }, 400);
    }

    const data = c.req.valid("json");
    const sanitizedNotes = data.admin_notes ? sanitizeInput(data.admin_notes) : null;

    const { results } = await c.env.DB.prepare(
      `UPDATE street_suggestions 
       SET is_reviewed = TRUE, is_approved = ?, admin_notes = ?, reviewed_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ?
       RETURNING *`
    ).bind(data.is_approved, sanitizedNotes, id).all();
    
    if (!results || results.length === 0) {
      return c.json({ error: 'Suggestion not found' }, 404);
    }
    
    // If approved, create the street automatically
    if (data.is_approved) {
      const suggestion = results[0] as any;
      await c.env.DB.prepare(
        `INSERT INTO streets (name, neighborhood, status, notes, created_at, updated_at)
         VALUES (?, ?, 'planned', ?, datetime('now'), datetime('now'))`
      ).bind(
        suggestion.street_name,
        suggestion.neighborhood,
        `Criada a partir de sugestão: ${suggestion.description || ''}`
      ).run();
    }
    
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: 'Failed to review suggestion' }, 500);
  }
});

// Enhanced photo management endpoints
app.get('/api/admin/photos/:streetId', authMiddleware, adminMiddleware, rateLimit(50, 60000), async (c) => {
  try {
    const streetId = parseInt(c.req.param('streetId'));
    if (isNaN(streetId) || streetId < 1) {
      return c.json({ error: 'Invalid street ID' }, 400);
    }

    const { results } = await c.env.DB.prepare(
      "SELECT * FROM street_photos WHERE street_id = ? ORDER BY created_at DESC"
    ).bind(streetId).all();
    
    // Convert tags from JSON string to array
    const photos = results.map((photo: any) => ({
      ...photo,
      tags: photo.tags ? JSON.parse(photo.tags) : []
    }));
    
    return c.json(photos);
  } catch (error) {
    return c.json({ error: 'Failed to fetch photos' }, 500);
  }
});

// Secure photo upload endpoint
app.post('/api/admin/photos', authMiddleware, adminMiddleware, rateLimit(10, 300000), async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as any;
    const streetId = parseInt(formData.get('street_id') as string);
    const photoType = formData.get('photo_type') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;

    // Validate inputs
    if (!file || isNaN(streetId) || streetId < 1) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate file
    const fileValidation = validateImageFile({ size: file.size, type: file.type });
    if (!fileValidation.valid) {
      return c.json({ error: fileValidation.error }, 400);
    }

    // Validate photo type
    const validPhotoTypes = ['before', 'during', 'after', 'work', 'team', 'equipment'];
    if (!validPhotoTypes.includes(photoType)) {
      return c.json({ error: 'Invalid photo type' }, 400);
    }

    // Check if street exists
    const { results: streetCheck } = await c.env.DB.prepare(
      "SELECT id FROM streets WHERE id = ?"
    ).bind(streetId).all();

    if (!streetCheck || streetCheck.length === 0) {
      return c.json({ error: 'Street not found' }, 404);
    }

    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `street_${streetId}_${photoType}_${timestamp}_${randomString}.${fileExtension}`;

    // In a real implementation, you would upload to Cloudflare Images or R2
    // For now, we'll create a simulated URL (in production, replace with actual upload)
    const photoUrl = `https://mocha-cdn.com/photos/${filename}`;

    // Get user info
    const user = c.get('user');
    
    // Parse tags
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    // Save to database
    const { results } = await c.env.DB.prepare(
      `INSERT INTO street_photos (street_id, photo_url, photo_type, description, uploaded_by, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       RETURNING *`
    ).bind(
      streetId,
      photoUrl,
      photoType,
      description ? sanitizeInput(description) : null,
      user?.email || 'unknown',
      tagsArray.length > 0 ? JSON.stringify(tagsArray) : null
    ).all();

    const photo = results[0];
    return c.json({
      ...photo,
      tags: tagsArray
    }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to upload photo' }, 500);
  }
});

app.delete('/api/admin/photos/:id', authMiddleware, adminMiddleware, rateLimit(20, 60000), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id) || id < 1) {
      return c.json({ error: 'Invalid photo ID' }, 400);
    }

    const result = await c.env.DB.prepare(
      "DELETE FROM street_photos WHERE id = ?"
    ).bind(id).run();
    
    if (result.changes === 0) {
      return c.json({ error: 'Photo not found' }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete photo' }, 500);
  }
});

// Health check endpoint
app.get('/api/health', rateLimit(100, 60000), async (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.onError((_err, c) => {
  return c.json({ error: 'Internal server error' }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

export default app;
