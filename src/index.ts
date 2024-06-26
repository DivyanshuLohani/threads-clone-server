import auth from "./routes/auth";
import threads from "./routes/threads";
import userRouter from "./routes/user";
import authMiddleware from "./middleware/auth";
import User from "./models/User";

import express, { Request, Response } from "express";
import { configDotenv } from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import dbConnect from "./db";

configDotenv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  console.log(
    `[${Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date())}] [${req.method}] - ${req.path}`
  );
  next();
});

app.use("/auth/", auth);
app.use("/threads/", authMiddleware, threads);
app.use("/users/", authMiddleware, userRouter);
// Route for getting available username
app.get("/u/:username", async (req, res) => {
  const existingUser = await User.findOne({
    username: req.params.username,
  });
  if (existingUser) return res.status(409).json({ error: "Not available" });
  return res.status(200).json({ message: "available" });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

app.listen(PORT, async () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  await dbConnect();
});
