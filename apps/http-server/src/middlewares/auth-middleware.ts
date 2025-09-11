// auth-middleware.ts
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: "driver" | "rider";
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // check Authorization header for token
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // if not found, fall back to cookie
    if (!token) {
      token = req.cookies?.auth_token;
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secr3t"
    ) as JwtPayload & {
      id: string;
      email: string;
      userType: "driver" | "rider";
    };

    // attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType,
    };

    return next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
