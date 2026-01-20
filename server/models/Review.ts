import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    order: mongoose.Types.ObjectId;
    rating: number; // 1-5
    comment: string;
    media: { public_id: string; url: string; type: string }[];
    isVerifiedPurchase: boolean; // redundancy for quick access, though we enforce it logically
    createdAt: Date;
}

const reviewSchema = new mongoose.Schema<IReview>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please enter a rating'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Please enter a review comment']
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: true // We will only allow verified purchases to create reviews in this system
    },
    media: [
        {
            public_id: { type: String, required: true },
            url: { type: String, required: true },
            type: { type: String, required: true } // 'image' or 'video'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can only review a specific order's product once
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Static method to calculate avg rating
reviewSchema.statics.calcAverageRatings = async function (productId: string) {
    try {
        const stats = await this.aggregate([
            {
                $match: { product: new (mongoose.Types.ObjectId as any)(productId) }
            },
            {
                $group: {
                    _id: '$product',
                    avgRating: { $avg: '$rating' },
                    numOfReviews: { $sum: 1 }
                }
            }
        ]);

        const Product = mongoose.model('Product');

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                ratings: stats[0].avgRating,
                numOfReviews: stats[0].numOfReviews
            });
        } else {
            await Product.findByIdAndUpdate(productId, {
                ratings: 0,
                numOfReviews: 0
            });
        }
    } catch (error) {
        console.error("Review Aggregation Error:", error);
    }
};

// Call average cost after save
reviewSchema.post('save', function (this: IReview) {
    (this.constructor as any).calcAverageRatings(this.product);
});

// Call average cost after remove
reviewSchema.post('findOneAndDelete', async function (doc: IReview | null) {
    if (doc) {
        // Existing: Calculate average ratings
        await (doc.constructor as any).calcAverageRatings(doc.product);

        // NEW: Clean up Cloudinary media
        if (doc.media && doc.media.length > 0) {
            try {
                const { deleteFromCloudinary } = await import('../utils/cloudinary');
                console.log(`Post-delete hook: Cleaning up ${doc.media.length} media files from Cloudinary`);

                for (const media of doc.media) {
                    const resourceType = media.type === 'video' ? 'video' : 'image';
                    await deleteFromCloudinary(media.public_id, resourceType);
                }
            } catch (error) {
                console.error('Review post-delete media cleanup error:', error);
                // Don't throw - cleanup failure shouldn't affect the deletion
            }
        }
    }
});

const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
