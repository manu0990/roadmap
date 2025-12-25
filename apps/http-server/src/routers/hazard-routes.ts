import { addNewHazard, confirmHazard, getAllHazards } from "@/controllers/hazard-controller";
import { authMiddleware } from "@/middlewares/auth-middleware";
import express, { Router } from "express";

const router: Router = express.Router();

// the driver will add new report of a road hazards
router.post("/new-report", authMiddleware, addNewHazard);

// the other drivers will be asked to confirm if the hazards exist or not
router.post("/confirm", authMiddleware, confirmHazard);

// get all hazards
router.get("/all", authMiddleware, getAllHazards);

export { router as hazardRouter };