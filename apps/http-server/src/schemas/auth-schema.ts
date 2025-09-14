import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().length(10, "Phone number must be 10 digits"),
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signinSchema = z.object({
  phoneNumber: z.string().length(10, "Phone number must be 10 digits").optional(),
  email: z.email("Invalid email format").optional(),
  password: z.string().min(1, "Password is required"),
}).refine((data) => {
  // Either phone number or email must be provided
  return data.phoneNumber || data.email;
}, {
  message: "Either phone number or email is required",
  path: ["phoneNumber"],
});
