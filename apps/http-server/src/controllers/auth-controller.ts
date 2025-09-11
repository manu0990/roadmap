import { Request, Response } from "express";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import { signinSchema, signupSchema } from "@/schemas/auth-schema";
import jwt from "jsonwebtoken";

export const signupController = async (req: Request, res: Response) => {
  try {
    // validate input with Zod schema
    const parsedData = signupSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(422).json({
        message: "Invalid input data",
        error: parsedData.error,
      });
    };

    const { name, email, phoneNumber, userType, password, vehiclePlate } = parsedData.data;

    // check if user exists (Driver or Rider)
    const existingDriver = await prisma.driver.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });
    const existingRider = await prisma.rider.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });

    if (existingDriver || existingRider) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // creating new user
    let newUser;
    if (userType === "driver") {
      if (!vehiclePlate) {
        return res.status(400).json({ message: "Vehicle plate is required" });
      }
      newUser = await prisma.driver.create({
        data: { name, email, phoneNumber, vehiclePlate, passwordHash: hashedPassword },
      });
    } else {
      newUser = await prisma.rider.create({
        data: { name, email, phoneNumber, passwordHash: hashedPassword },
      });
    };

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, userType },
      process.env.JWT_SECRET || 'secr3t',
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        userType,
      },
    });
  } catch (err: any) {
    console.error("Signup error: ", err);
    res.status(500).json({
      message: "Something went wrong during signup",
      error: err.message,
    });
  }
};

export const signinController = async (req: Request, res: Response) => {
  try {
    // validate input with Zod schema
    const parsedData = signinSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(422).json({
        message: "Invalid input data",
        error: parsedData.error,
      });
    }

    const { email, phoneNumber, password, userType } = parsedData.data;

    // find user based on userType
    let user;
    if (userType === "driver") {
      user = await prisma.driver.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });
    } else {
      user = await prisma.rider.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, userType },
      process.env.JWT_SECRET || "secr3t",
      { expiresIn: "7d" }
    );

    // set auth cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Signin successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType,
      },
    });
  } catch (err: any) {
    console.error("Signin error: ", err);
    return res.status(500).json({
      message: "Something went wrong during signin",
      error: err.message,
    });
  }
};
