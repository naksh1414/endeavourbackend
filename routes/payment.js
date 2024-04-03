import express from "express";
import { checkout, key, paymentverification } from "../controllers/payment.js";
const router = express.Router();
router.route("/checkout").post(checkout);
router.route("/paymentverification/:userId/:eventId/:amount").post(paymentverification);
router.get("/getkey", key);
export default router;
