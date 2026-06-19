import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.router.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import cors from "cors";
import { corsOptions } from "./config/cors.config.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors(corsOptions))

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);


export default app;
