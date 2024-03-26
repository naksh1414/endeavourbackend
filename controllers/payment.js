import "dotenv/config";
import { instance } from "../index.js";
import crypto from "crypto";
import Payment from "../models/payments.js";
import Team from "../models/teams.js";

export const checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (e) {
    res.json(e);
  }
};

export const key = async (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
};

export const paymentverification = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const { userId, eventId, amount } = req.params;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await Payment.create({
        userId,
        eventId,
        amount,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status: "SUCCESS",
      });
      res.redirect(`http://localhost:5173/endeavour/events/${eventId}`);
    } else {
      res.status(400).json({
        success: false,
      });
    }
  } catch (e) {
    res.json(e);
  }
};
