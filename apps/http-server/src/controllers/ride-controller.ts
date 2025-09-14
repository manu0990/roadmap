import { rideSchema } from "@/schemas/ride-schema";
import { Request, Response } from "express";

export const startNewRide = async (req: Request, res: Response) => {
  const parsedData = rideSchema.safeParse(req.body);
  if(!parsedData.success) {
    return res.status(400).json({
      message: "Invalid request body.",
    });
  };
  const {driverId, origin, destination, vehicheType} = parsedData.data;
  console.log(driverId, origin, destination, vehicheType);
  
};

export const endRide = async (req: Request, res: Response) => {

};

export const getRideDetails = async (req: Request, res: Response) => {

};