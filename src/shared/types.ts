import z from "zod";

// Street status enum
export const StreetStatus = z.enum(['planned', 'in_progress', 'completed']);
export type StreetStatusType = z.infer<typeof StreetStatus>;

// Street schema
export const StreetSchema = z.object({
  id: z.number(),
  name: z.string(),
  neighborhood: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  status: StreetStatus,
  notes: z.string().nullable(),
  completed_at: z.string().nullable(),
  started_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type StreetType = z.infer<typeof StreetSchema>;

// Street suggestion schema
export const StreetSuggestionSchema = z.object({
  id: z.number(),
  street_name: z.string(),
  neighborhood: z.string().nullable(),
  description: z.string().nullable(),
  suggested_by_name: z.string().nullable(),
  suggested_by_email: z.string().nullable(),
  is_reviewed: z.boolean(),
  is_approved: z.boolean(),
  admin_notes: z.string().nullable(),
  reviewed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type StreetSuggestionType = z.infer<typeof StreetSuggestionSchema>;

// Create street request schema
export const CreateStreetRequestSchema = z.object({
  name: z.string().min(1, "Nome da rua é obrigatório"),
  neighborhood: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: StreetStatus.default('planned'),
  notes: z.string().optional(),
});

export type CreateStreetRequestType = z.infer<typeof CreateStreetRequestSchema>;

// Update street request schema
export const UpdateStreetRequestSchema = z.object({
  status: StreetStatus.optional(),
  notes: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
});

export type UpdateStreetRequestType = z.infer<typeof UpdateStreetRequestSchema>;

// Create suggestion request schema
export const CreateSuggestionRequestSchema = z.object({
  street_name: z.string().min(1, "Nome da rua é obrigatório"),
  neighborhood: z.string().optional(),
  description: z.string().optional(),
  suggested_by_name: z.string().optional(),
  suggested_by_email: z.string().email("Email inválido").optional(),
});

export type CreateSuggestionRequestType = z.infer<typeof CreateSuggestionRequestSchema>;

// Review suggestion request schema
export const ReviewSuggestionRequestSchema = z.object({
  is_approved: z.boolean(),
  admin_notes: z.string().optional(),
});

export type ReviewSuggestionRequestType = z.infer<typeof ReviewSuggestionRequestSchema>;
