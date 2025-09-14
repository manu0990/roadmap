import { addNewHazard, getHazardDetails } from "@/controllers/hazard-controller";
import { authMiddleware } from "@/middlewares/auth-middleware";
import express, { Router } from "express";

const router: Router = express.Router();

// after journey confirmation pollute the map with hazard data (might need routeId or something)
router.post("/", authMiddleware, getHazardDetails);

// the driver will add new report of a road hazards
router.post("/new-report", authMiddleware, addNewHazard);

// the other drivers will be asked to confirm if the hazards exist or not
router.post("/confirm/:hazardId", authMiddleware, addNewHazard);

export { router as hazardRouter };