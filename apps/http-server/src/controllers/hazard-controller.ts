import { newHazardSchema, confirmHazardSchema } from "@/schemas/hazard-schema";
import { prisma } from "@repo/db";
import { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const addNewHazard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsedData = newHazardSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsedData.error.issues
      });
    }

    const { latitude, longitude, type, description } = parsedData.data;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    const hazard = await prisma.report.create({
      data: {
        latitude,
        longitude,
        type,
        description,
        userId
      }
    });

    // Insert reporter's implicit confirmation
    await prisma.confirmation.create({
      data: {
        reportId: hazard.id,
        userId,
        isTrue: true
      }
    });

    return res.status(201).json({
      message: "Hazard reported successfully",
      hazardId: hazard.id
    });

  } catch (error) {
    console.error("Error creating hazard:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const confirmHazard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsedData = confirmHazardSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsedData.error.issues
      });
    }

    const { isTrue, hazardId } = parsedData.data;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    const hazard = await prisma.report.findUnique({ where: { id: hazardId } });
    if (!hazard) {
      return res.status(404).json({
        message: "Hazard not found"
      });
    }

    // Prevent duplicate confirmation
    const existingConfirmation = await prisma.confirmation.findUnique({
      where: {
        reportId_userId: {
          reportId: hazardId,
          userId
        }
      }
    });

    if (existingConfirmation) {
      return res.status(400).json({
        message: "You have already confirmed this hazard"
      });
    }

    // Create new confirmation
    const confirmation = await prisma.confirmation.create({
      data: {
        reportId: hazardId,
        userId,
        isTrue
      }
    });

    // Recalculate confidence score
    const allConfirmations = await prisma.confirmation.findMany({ where: { reportId: hazardId } });
    const totalConfirmations = allConfirmations.length;
    const positiveConfirmations = allConfirmations.filter((c: { isTrue: boolean }) => c.isTrue).length;

    // for now calculation medium to define the confidence
    let newConfidence = totalConfirmations > 0 ? positiveConfirmations / totalConfirmations : 0.5;

    await prisma.report.update({
      where: { id: hazardId },
      data: { confidence: newConfidence }
    });

    return res.status(200).json({
      message: "Confirmation recorded",
      confirmationId: confirmation.id,
      newConfidence
    });

  } catch (error) {
    console.error("Error confirming hazard:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getAllHazards = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hazards = await prisma.report.findMany();

    const formattedHazards = hazards.map((hazard: { id: string; type: string; latitude: number; longitude: number }) => ({
      hazardId: hazard.id,
      hazardType: hazard.type,
      latitude: hazard.latitude,
      longitude: hazard.longitude
    }));

    return res.status(200).json(formattedHazards);

  } catch (error) {
    console.error("Error fetching hazards:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
