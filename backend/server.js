/** @format */

import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.Routes.js";
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);

app.listen(8000, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
