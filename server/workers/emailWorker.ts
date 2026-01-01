import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

interface EmailJobData {
    email: string;
    subject: string;
    message?: string;
    html?: string;
}

const workerMode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const emailWorker = new Worker<EmailJobData>(
    'email-queue',
    async (job: Job<EmailJobData>) => {
        const { email, subject, message, html } = job.data;

        logger.info(`Processing email job ${job.id} for ${email}`, { correlationId: job.id });

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
            to: email,
            subject: subject,
            text: message,
            html: html
        };

        try {
            await transporter.sendMail(mailOptions);
            logger.info(`Email sent successfully to ${email} (Job: ${job.id})`);
        } catch (error: any) {
            logger.error(`Failed to send email to ${email} (Job: ${job.id}): ${error.message}`);
            throw error; // Throwing error triggers BullMQ retry mechanism
        }
    },
    {
        connection: {
            url: process.env.REDIS_URI || 'redis://localhost:6380'
        },
        limiter: {
            max: 10, // Max 10 jobs per...
            duration: 1000 // ...1 second (Basic rate limiting for worker)
        },
        settings: {
            backoffStrategy: (attemptsMade: number) => {
                return Math.min(attemptsMade * 1000, 30000); // 1s, 2s, 3s... up to 30s
            }
        }
    }
);

emailWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed: ${err.message}`);
});

export default emailWorker;
