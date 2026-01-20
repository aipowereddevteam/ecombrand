import mongoose from 'mongoose';
import Product from '../models/Product';
import User from '../models/User';

describe('Order Management & Stock Control', () => {

    describe('Stock Validation & Atomic Operations', () => {
        let product: any;
        let user: any;

        beforeEach(async () => {
            product = await Product.create({
                title: 'Test T-Shirt',
                description: 'Test product',
                price: 999,
                category: 'Men',
                stock: { S: 0, M: 5, L: 10, XL: 0, XXL: 0 },
                images: [{ public_id: 'test', url: 'http://test.jpg', type: 'image' }],
                createdBy: new mongoose.Types.ObjectId(),
                isActive: true
            });

            user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                googleId: 'google_123'
            });
        });

        it('should have correct initial stock levels', () => {
            expect(product.stock.M).toBe(5);
            expect(product.stock.L).toBe(10);
            expect(product.stock.S).toBe(0);
        });

        it('should update stock atomically using findOneAndUpdate', async () => {
            const size = 'M';
            const quantity = 2;
            const sizeKey = `stock.${size}`;

            const updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: product._id,
                    [sizeKey]: { $gte: quantity },
                    isActive: true
                },
                {
                    $inc: { [sizeKey]: -quantity }
                },
                { new: true }
            );

            expect(updatedProduct).not.toBeNull();
            expect(updatedProduct!.stock!.M).toBe(3); // 5 - 2 = 3
        });

        it('should reject when stock is insufficient', async () => {
            const size = 'M';
            const quantity = 10; // More than available (5)
            const sizeKey = `stock.${size}`;

            const result = await Product.findOneAndUpdate(
                {
                    _id: product._id,
                    [sizeKey]: { $gte: quantity },
                    isActive: true
                },
                {
                    $inc: { [sizeKey]: -quantity }
                },
                { new: true }
            );

            expect(result).toBeNull();

            const unchangedProduct = await Product.findById(product._id);
            expect(unchangedProduct!.stock!.M).toBe(5);
        });

        it('should reject for out-of-stock size', async () => {
            const size = 'S'; // Stock is 0
            const quantity = 1;
            const sizeKey = `stock.${size}`;

            const result = await Product.findOneAndUpdate(
                {
                    _id: product._id,
                    [sizeKey]: { $gte: quantity },
                    isActive: true
                },
                {
                    $inc: { [sizeKey]: -quantity }
                },
                { new: true }
            );

            expect(result).toBeNull();
        });
    });

    describe('Concurrent Stock Updates (Critical for Flash Sales)', () => {
        let product: any;

        beforeEach(async () => {
            product = await Product.create({
                title: 'Flash Sale Item',
                description: 'Only 3 in stock',
                price: 1999,
                category: 'Men',
                stock: { S: 0, M: 3, L: 0, XL: 0, XXL: 0 },
                images: [{ public_id: 'flash', url: 'http://flash.jpg', type: 'image' }],
                createdBy: new mongoose.Types.ObjectId(),
                isActive: true
            });
        });

        it('should handle concurrent updates atomically - prevents overselling', async () => {
            const size = 'M';
            const quantity = 1;
            const sizeKey = `stock.${size}`;

            // Simulate 4 concurrent buyers trying to buy 1 item each
            // Only 3 in stock, so 1 should fail
            const updatePromises = [1, 2, 3, 4].map(() =>
                Product.findOneAndUpdate(
                    {
                        _id: product._id,
                        [sizeKey]: { $gte: quantity },
                        isActive: true
                    },
                    {
                        $inc: { [sizeKey]: -quantity }
                    },
                    { new: true }
                )
            );

            const results = await Promise.all(updatePromises);

            const successCount = results.filter(r => r !== null).length;
            const failureCount = results.filter(r => r === null).length;

            // Expect exactly 3 successes and 1 failure
            expect(successCount).toBe(3);
            expect(failureCount).toBe(1);

            // Final stock should be 0
            const finalProduct = await Product.findById(product._id);
            expect(finalProduct!.stock!.M).toBe(0);
        });

        it('should prevent overselling with larger quantities', async () => {
            const size = 'M';
            const quantity = 2;
            const sizeKey = `stock.${size}`;

            // Two buyers trying to buy 2 items each (total 4, but only 3 available)
            const updatePromises = [1, 2].map(() =>
                Product.findOneAndUpdate(
                    {
                        _id: product._id,
                        [sizeKey]: { $gte: quantity },
                        isActive: true
                    },
                    {
                        $inc: { [sizeKey]: -quantity }
                    },
                    { new: true }
                )
            );

            const results = await Promise.all(updatePromises);

            const successCount = results.filter(r => r !== null).length;
            const failureCount = results.filter(r => r === null).length;

            // Only first request should succeed
            expect(successCount).toBe(1);
            expect(failureCount).toBe(1);

            // Final stock should be 1 (3 - 2)
            const finalProduct = await Product.findById(product._id);
            expect(finalProduct!.stock!.M).toBe(1);
        });
    });
});
