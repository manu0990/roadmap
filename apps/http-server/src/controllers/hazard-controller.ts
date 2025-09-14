import { hazardSchema } from "@/schemas/hazard-schema";
import { Request, Response } from "express"

export const getHazardDetails = async (req: Request, res: Response) => {
  const parsedData = hazardSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid req body.",
    });
  };
  const { driverId, latitude, longitude, type, severity, description } = parsedData.data;
  console.log(driverId, latitude, longitude, type, severity, description);

};

export const addNewHazard = async (req: Request, res: Response) => {

};

export const confirmHazard = async (req: Request, res: Response) => {

};