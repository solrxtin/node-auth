import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config()

import { PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js";

const sendResetPasswordSuccessEmail = async (userEmail) => {
    if (!userEmail) {
        console.error("Error: No recipient email address provided.");
        throw new Error("No recipient email address provided.");
    }

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
            subject: 'Password Reset Successful',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        });

        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error(`Error sending message: ${error.message}`);
        throw new Error(error.message);
    }
}

export default sendResetPasswordSuccessEmail