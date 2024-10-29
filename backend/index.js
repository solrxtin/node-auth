import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDb from "./db/connectDB.js";
import authRouter from "./routes/auth.route.js"

dotenv.config()

const app = express();

const PORT = process.env.PORT || 5001;

app.use(express.json()) // allows us to parse incoming request
app.use(cookieParser()); // allows us to parse incoming cookies

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
    connectDb();
    console.log(`App running on PORT ${PORT}`)
})