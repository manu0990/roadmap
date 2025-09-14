import { z } from "zod";

const HazardType = [
  "POTHOLE",
  "SPEED_BUMP",
  "ROAD_PATCH",
  "CONSTRUCTION",
  "ACCIDENT",
  "FLOODING",
  "OTHER"
] as const;

const Severity = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL"
] as const;

export const hazardSchema = z.object({
  driverId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(HazardType),
  severity: z.enum(Severity),
  description: z.string().optional()
});
