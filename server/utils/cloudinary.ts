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

/**
 * Safely delete a single resource from Cloudinary
 * @param publicId - The public_id of the resource to delete
 * @param resourceType - The type of resource ('image', 'video', or 'auto')
 * @returns Deletion result or null if failed
 */
export const deleteFromCloudinary = async (
    publicId: string,
    resourceType: 'image' | 'video' | 'auto' = 'auto'
) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        console.log(`Cloudinary deletion successful for ${publicId}:`, result);
        return result;
    } catch (error) {
        console.error(`Cloudinary deletion failed for ${publicId}:`, error);
        // Don't throw - log and continue to prevent app crashes
        return null;
    }
};

/**
 * Delete multiple resources from Cloudinary in batch
 * @param publicIds - Array of public_ids to delete
 * @param resourceType - The type of resources ('image', 'video', or 'auto')
 * @returns Array of deletion results
 */
export const deleteManyFromCloudinary = async (
    publicIds: string[],
    resourceType: 'image' | 'video' | 'auto' = 'auto'
) => {
    const results = await Promise.allSettled(
        publicIds.map(id => deleteFromCloudinary(id, resourceType))
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    console.log(`Cloudinary batch deletion: ${succeeded} succeeded, ${failed} failed`);

    return results;
};

/**
 * Extract public_id from a Cloudinary URL
 * @param url - Full Cloudinary URL
 * @param folder - Folder name in Cloudinary (e.g., 'avatars', 'ecom_products')
 * @returns The public_id or null if extraction fails
 */
export const extractPublicIdFromUrl = (url: string, folder?: string): string | null => {
    try {
        // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
        const urlParts = url.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        if (uploadIndex === -1) return null;

        // Get everything after 'upload/v######/'
        const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');

        // Remove file extension
        const publicIdWithExt = pathAfterUpload.split('.')[0];

        return publicIdWithExt;
    } catch (error) {
        console.error('Failed to extract public_id from URL:', url, error);
        return null;
    }
};

export default cloudinary;
