import sendEmail from '../utils/sendEmail';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const verifyEmail = async () => {
    console.log("Testing Email Configuration...");
    console.log(`Host: ${process.env.SMPT_HOST}`);
    console.log(`User: ${process.env.SMPT_MAIL}`);

    if (!process.env.SMPT_MAIL) {
        console.error("Error: SMPT_MAIL is not defined in .env");
        return;
    }

    try {
        await sendEmail({
            email: process.env.SMPT_MAIL, // Send to self
            subject: "ShopMate SMTP Test",
            message: "If you received this, your email configuration is working correctly!",
            html: "<h2>SMTP Test Success</h2><p>Your email system is ready to go.</p>"
        });
        console.log("✅ Test email sent successfully!");
    } catch (error) {
        console.error("❌ Test email failed:", error);
    }
};

verifyEmail();
