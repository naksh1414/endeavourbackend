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
  UserInfo,
  UpdateDetails,
} from "../controllers/users.js";
import { checkAuth, restrictToLogInUserOnly } from "../middlewares/auth.js";
// import { checkAuth } from "../middlewares/auth.js";

router.post("/login", checkAuth, handleLogin);
router.post("/register", handleRegister);
router.post("/userinfo/:userId", UserInfo);
router.post("/update-details/:userId", UpdateDetails);
router.post("/memberSearch", handleMemberSearch);
router.post("/registerteam", handleRegisterTeam);
router.post("/GoogleLogin", handleGoogleLogin);
router.post("/GoogleRegister", handleGoogleRegister);
router.post("/send-otp", handleOTPSending);
router.post("/forget-password", handleForgetPassword);
router.post("/reset-password", handleResetPassword);

export default router;
