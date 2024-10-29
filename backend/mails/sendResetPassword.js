import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config()
import { PASSWORD_RESET_REQUEST_TEMPLATE } from "./emailTemplates.js";

const sendPasswordResetEmail = async (userEmail, resetUrl) => {
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
            subject: 'Reset your password',
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetUrl}", resetUrl),
        });
    
        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error(`Error sending message: ${error.message}`);
        throw new Error(error.message);
    }
}

export default sendPasswordResetEmail