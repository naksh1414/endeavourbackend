import express from "express";
const router = express.Router();
import {
  handleLogin,
  handleRegister,
  handleRegisterTeam,
  handleMemberSearch,
  handleGoogleLogin,
  handleGoogleRegister,
  handleForgetPassword,
  handleResetPassword,
  handleOTPSending,
} from "../controllers/users.js";
import { checkAuth, restrictToLogInUserOnly } from "../middlewares/auth.js";
// import { checkAuth } from "../middlewares/auth.js";

router.post("/login", checkAuth, handleLogin);
router.post("/register", handleRegister);
router.post("/memberSearch", handleMemberSearch);
router.post("/registerteam", handleRegisterTeam);
router.post("/GoogleLogin", handleGoogleLogin);
router.post("/GoogleRegister", handleGoogleRegister);
router.post("/send-otp", handleOTPSending);
router.post("/forget-password", handleForgetPassword);
router.post("/reset-password", handleResetPassword);

export default router;
