import nodemailer from 'nodemailer';

interface EmailOptions {
    email: string;
    subject: string;
    message?: string;
    html?: string;
}

const sendEmail = async (options: EmailOptions) => {
    // Determine transport based on environment or user existing config
    // For now using Ethereal for testing or placeholders if Env vars missing
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: parseInt(process.env.SMPT_PORT || "587"),
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    console.log(`Using Email Config: Host=${process.env.SMPT_HOST}, User=${process.env.SMPT_MAIL}`);
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);
};

export default sendEmail;
