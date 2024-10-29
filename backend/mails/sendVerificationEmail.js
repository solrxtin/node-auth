import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config()
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";

const verifyEmail = async (verificationToken, userEmail) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: userEmail,
            subject: 'Verify your account',
            text: `Verification code: ${verificationToken}`,
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        });
    
        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error(`Error sending message: ${error.message}`);
        throw new Error(error.message);
    }
}

export default verifyEmail