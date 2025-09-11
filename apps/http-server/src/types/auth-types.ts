export type signupDataType = {
  name: string;
  phoneNumber: number;
  email: string;
  password: string;
  userType: "driver" | "rider";
  vehiclePlate?: string;
};

// Either one of phoneNumber or email is required for sign in
export type signinDataType = {
  email: string;
  phonenumber?: never;
  userType: "driver" | "rider";
  password: string;
} | {
  email?: never;
  phonenumber: number;
  userType: "driver" | "rider";
  password: string;
};
