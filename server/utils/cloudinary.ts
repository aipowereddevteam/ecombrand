import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

import { CircuitBreaker } from './circuitBreaker';

const cb = new CircuitBreaker();

export const uploadToCloudinary = async (path: string, folder: string) => {
    return cb.fire(() => cloudinary.uploader.upload(path, { folder }));
};

export default cloudinary;
