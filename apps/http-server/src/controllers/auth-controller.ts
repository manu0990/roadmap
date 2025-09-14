import { Request, Response } from "express";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import { signinSchema, signupSchema } from "@/schemas/auth-schema";
import jwt from "jsonwebtoken";

export const signupController = async (req: Request, res: Response) => {
  try {
    const parsedData = signupSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(422).json({
        message: "Invalid input data",
        error: parsedData.error.format(),
      });
    }

    const { name, email, phoneNumber, password } = parsedData.data;

    // check if user already exists
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // create new user
    const newUser = await prisma.user.create({ data: { name, email, phoneNumber, passwordHash: hashedPassword } });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || "secr3t",
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
      user: { id: newUser.id },
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
    const parsedData = signinSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(422).json({
        message: "Invalid input data",
        error: parsedData.error,
      });
    }

    const { email, phoneNumber, password } = parsedData.data;

    // find user
    const user = await prisma.user.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secr3t",
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Signin successful",
      token,
      user: { id: user.id }
    });
  } catch (err: any) {
    console.error("Signin error: ", err);
    return res.status(500).json({
      message: "Something went wrong during signin",
      error: err.message,
    });
  }
};
