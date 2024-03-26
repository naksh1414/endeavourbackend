import "dotenv/config";
import express from "express";
const app = express();
import cors from "cors";
import bodyParser from "body-parser";
// import adminRoute from "./routes/admin.js";
import userRoute from "./routes/users.js";
import stdPassRoute from "./routes/stdPass.js";
import eventsRoute from "./routes/events.js";
import paymentRoute from "./routes/payment.js";
import cookieParser from "cookie-parser";

import Razorpay from "razorpay";

const frontEnd_URL = process.env.FRONTEND_URL;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: frontEnd_URL,
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use(bodyParser.json());

import mongoose from "mongoose";
// import { checkAuth, restrictToLogInUserOnly } from "./middlewares/auth.js";
const dbUrl = process.env.DB_URL;
main().catch((err) => console.log(err));
async function main() {
  mongodb: await mongoose.connect(dbUrl);
  console.log("Mongo Connection Open!!!");
}

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

//Routes
// app.use("/", adminRoute);
app.use("/", eventsRoute);
app.use("/", stdPassRoute);
app.use("/", userRoute);
app.use("/api", paymentRoute);

const port = process.env.PORT || 3000;

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

app.listen(port, () => {
  console.log(`App Is Listening On Port ${port}!`);
});
