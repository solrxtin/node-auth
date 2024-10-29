import bcrypt from "bcryptjs"
import crypto from "crypto"

import { generateVerificationCode } from "../utils/generateVerificationCode.js"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"
import sendVerificationEmail from "../mails/sendVerificationEmail.js"
import sendWelcomeEmail from "../mails/sendWelcomeEmail.js"
import sendPasswordResetEmail from "../mails/sendResetPassword.js"
import User from "../models/user.model.js"
import sendResetPasswordSuccessEmail from "../mails/sendResetPasswordSuccessEmail.js"


export const logInController = async (req, res) => {
    const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		if (!user.isVerified) {
			return res.status(401).json({ success: false, message: "User not verified" });
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
}
export const signUpController = async (req, res) => {
    try {
        const {email, password, name} = req.body

        if (!email || !password || !name) {
			return res.status(400).json({ success: false, message: "All fields are required" });
		}

		const userAlreadyExists = await User.findOne({ email });

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

        const passwordSalt = 10
        const hashedPassword = await bcrypt.hash(password, passwordSalt);
        const verificationToken = generateVerificationCode();
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 30 * 60 * 1000
        })
        await sendVerificationEmail(verificationToken, email)
        await newUser.save();
        generateTokenAndSetCookie(res, newUser._id);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...newUser._doc,
                password: null
            }
        })

    } catch (error) {
        console.log("An error occured in signUpController: ", error.message)
        res.status(500).json({success: false, message: error.message})
    }
}
export const logOutController = async (req, res) => {
    try {
        res.clearCookie("authToken")
        res.status(200).json({success: true, message: "Logged out successfully"})
    } catch (error) {
        res.status(500).json({success: false, message: "Internal server error"})
    }
}


export const verifyController = async (req, res) => {
    const {code} = req.body
    console.log(code)

    try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.name, user.email);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
}


export const forgotPasswordController = async (req, res) => {
    const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "Email does not exist" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        console.log(resetToken)

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
}


export const resetPasswordController = async (req, res) => {
    const {password, confirmPassword} = req.body
    const {token} = req.params
    try {
        if (password != confirmPassword) {
            return res.status(400).json({success: false, message: "passwords do not match"})
        }
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now()}
        })
        if (!user) {
            return res.status(400).json({success: false, message: "Invalid or expired reset token"})
        }
        const salt = 10
        const hashedPassword = await bcrypt.hash(password, salt)
        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined

        await user.save();

        await sendResetPasswordSuccessEmail(user.email)
        return res.status(200).json({success: true, message: "Password reset successful"})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

export const checkAuth = async (req, res) => {
    try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(500).json({ success: false, message: error.message });
	}
}