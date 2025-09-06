import z from "zod";

// Photo type enum
export const PhotoType = z.enum(['before', 'during', 'after', 'work', 'team', 'equipment']);
export type PhotoTypeType = z.infer<typeof PhotoType>;

// Street photo schema
export const StreetPhotoSchema = z.object({
  id: z.number(),
  street_id: z.number(),
  photo_url: z.string(),
  photo_type: PhotoType,
  description: z.string().nullable(),
  uploaded_by: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type StreetPhotoType = z.infer<typeof StreetPhotoSchema>;

// Create photo request schema
export const CreatePhotoRequestSchema = z.object({
  street_id: z.number(),
  photo_url: z.string(),
  photo_type: PhotoType,
  description: z.string().optional(),
});

export type CreatePhotoRequestType = z.infer<typeof CreatePhotoRequestSchema>;
