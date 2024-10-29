import { Router } from "express";

import { logInController, logOutController, signUpController, verifyController, forgotPasswordController, resetPasswordController, checkAuth } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.get("/check-auth", verifyToken, checkAuth)

router.post("/signup", signUpController);

router.post("/signin", logInController);

router.post("/logout", logOutController);

router.post("/verify-email", verifyController);

router.post("/forgot-password", forgotPasswordController);

router.post("/reset-password/:token", resetPasswordController);


export default router