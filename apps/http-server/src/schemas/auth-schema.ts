import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(10, "Phone number must be 10 digits").max(10, "Phone number must be 10 digits"),
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["driver", "rider"]),
  vehiclePlate: z.string().min(1, "Vehicle plate is required").optional(),
}).refine((data) => {
  // If userType is driver, vehiclePlate is required
  if (data.userType === "driver" && !data.vehiclePlate) {
    return false;
  }
  return true;
}, {
  message: "Vehicle plate is required for drivers",
  path: ["vehiclePlate"],
});

export const signinSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  email: z.email("Invalid email format").optional(),
  password: z.string().min(1, "Password is required"),
  userType: z.enum(["driver", "rider"]),
}).refine((data) => {
  // Either phone number or email must be provided
  return data.phoneNumber || data.email;
}, {
  message: "Either phone number or email is required",
  path: ["phoneNumber"],
});