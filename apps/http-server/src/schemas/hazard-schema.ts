import { z } from "zod";

const HazardType = [
  "POTHOLE",
  "SPEED_BUMP",
  "ROAD_PATCH"
] as const;

export const hazardSchema = z.object({
  driverId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(HazardType),
  description: z.string().optional()
});

// Schema for creating a new hazard report
export const newHazardSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(HazardType),
  description: z.string().optional()
});

// Schema for confirming a hazard
export const confirmHazardSchema = z.object({
  isTrue: z.boolean(),
  hazardId: z.string()
});

export type NewHazardRequest = z.infer<typeof newHazardSchema>;
export type ConfirmHazardRequest = z.infer<typeof confirmHazardSchema>;
