import app from "@/server";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;

if (!port) {
  console.log("Please add PORT in the evvironment variable...");
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
