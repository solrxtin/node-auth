import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
import { WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js";

function replacePlaceholders(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || `{${key}}`);
}

const sendWelcomeEmail = async (name, userEmail) => {
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

        const emailContent = replacePlaceholders(WELCOME_EMAIL_TEMPLATE, { name });

        let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: userEmail,
            subject: 'Welcome',
            html: emailContent,
        });

        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error(`Error sending message: ${error.message}`);
        throw new Error(error.message);
    }
};

export default sendWelcomeEmail;
