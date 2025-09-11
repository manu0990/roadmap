import { signinController, signupController } from "@/controllers/auth-controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/signup", signupController);
router.post("/signin", signinController);

export { router as authRouter };