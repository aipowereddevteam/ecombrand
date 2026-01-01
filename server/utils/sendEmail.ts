import emailQueue from '../queues/emailQueue';
import logger from './logger';

interface EmailOptions {
    email: string;
    subject: string;
    message?: string;
    html?: string;
}

const sendEmail = async (options: EmailOptions) => {
    try {
        await emailQueue.add('send-email', {
            email: options.email,
            subject: options.subject,
            message: options.message,
            html: options.html
        }, {
            attempts: 3, // Retry 3 times on failure
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: true, // Keep Redis clean
            removeOnFail: false // Keep failed jobs for inspection
        });

        logger.info(`Email job added to queue for ${options.email}`);
    } catch (error: any) {
        logger.error(`Failed to add email job to queue: ${error.message}`);
        // Fallback or re-throw depending on criticality. For now, we log and proceed.
    }
};

export default sendEmail;
