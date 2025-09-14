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
  try {
    const { rideId } = req.params;
    
    // Validate rideId
    if (!rideId) {
      return res.status(400).json({
        message: "Ride ID is required"
      });
    }

    // Fetch ride details from database
    const ride = await prisma.ride.findUnique({
      where: {
        id: rideId
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            vehiclePlate: true
          }
        },
        rider: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found"
      });
    }

    // Check if the authenticated user has access to this ride
    // Assuming req.user is set by authMiddleware
    const authenticatedUser = (req as any).user;
    const userType = authenticatedUser.userType;
    const userId = authenticatedUser.id;

    // Only allow driver or rider involved in the ride to access details
    if (userType === 'driver' && ride.driverId !== userId) {
      return res.status(403).json({
        message: "Access denied. You can only view your own rides."
      });
    }

    if (userType === 'rider' && ride.riderId !== userId) {
      return res.status(403).json({
        message: "Access denied. You can only view your own rides."
      });
    }

    return res.status(200).json({
      message: "Ride details retrieved successfully",
      ride: {
        id: ride.id,
        origin: ride.origin,
        destination: ride.destination,
        vehicleType: ride.vehicleType,
        status: ride.status,
        fare: ride.fare,
        distance: ride.distance,
        duration: ride.duration,
        startTime: ride.startTime,
        endTime: ride.endTime,
        createdAt: ride.createdAt,
        updatedAt: ride.updatedAt,
        driver: ride.driver,
        rider: ride.rider
      }
    });

  } catch (error: any) {
    console.error("Get ride details error: ", error);
    return res.status(500).json({
      message: "Something went wrong while fetching ride details",
      error: error.message
    });
  }
};