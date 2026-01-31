import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../server/models/Order';
import Product from '../server/models/Product';
import User from '../server/models/User';
import ReturnRequest from '../server/models/ReturnRequest';
import Transaction from '../server/models/Transaction';
import refundQueue from '../server/queues/refundQueue';

dotenv.config({ path: './server/.env' }); // Load server env

const MONGO_URI = process.env.MONGO_URI || 'mongodb://0.0.0.0:27017/ecom';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    console.log('Starting Return System Verification...');
    
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Create Dummy User
        const user = await User.create({
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            role: 'user'
        });
        console.log('User created:', user._id);

        // 2. Create Dummy Product
        const product = await Product.create({
            title: 'Test Product',
            description: 'Test Desc',
            price: 1000,
            category: 'Men',
            images: [{ public_id: '1', url: 'http://img' }],
            stock: { S: 10, M: 10, L: 10, XL: 10, XXL: 10 },
            createdBy: user._id
        });
        console.log('Product created:', product._id, 'Initial Stock M: 10');

        // 3. Create Delivered Order
        const order = await Order.create({
            shippingInfo: {
                address: 'Test', city: 'Test', state: 'Test', country: 'Test', pinCode: 123456, phoneNo: 1234567890
            },
            orderItems: [{
                name: product.title,
                price: product.price,
                quantity: 1,
                image: product.images[0].url,
                product: product._id,
                size: 'M'
            }],
            user: user._id,
            paymentInfo: { id: 'pay_123', status: 'Success' },
            paidAt: new Date(),
            itemsPrice: 1000,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 1000,
            orderStatus: 'Delivered',
            deliveredAt: new Date()
        });
        console.log('Order created:', order._id);

        // 4. Create Return Request
        const orderItem = order.orderItems[0];
        const returnReq = await ReturnRequest.create({
            order: order._id,
            user: user._id,
            items: [{
                orderItemId: (orderItem as any)._id,
                product: product._id,
                quantity: 1,
                reason: 'Test Return',
                condition: 'New'
            }],
            refundAmount: 1000,
            status: 'QC_Passed', // Simulate passed QC to trigger logic
            auditLog: []
        });
        console.log('ReturnRequest created:', returnReq._id);

        // 5. Trigger Refund Job (Simulating Admin Action)
        console.log('Adding Job to Refund Queue...');
        await refundQueue.add('process-refund', {
            returnRequestId: returnReq._id.toString(),
            orderId: order._id.toString(),
            userId: user._id.toString(),
            refundAmount: 1000
        }, {
            jobId: `test-refund-${returnReq._id}`
        });

        // 6. Wait for Worker to Process
        console.log('Waiting for worker...');
        let retries = 10;
        let success = false;
        
        while (retries > 0) {
            await delay(2000);
            const updatedReq = await ReturnRequest.findById(returnReq._id);
            if (updatedReq?.status === 'Refunded') {
                success = true;
                console.log('SUCCESS: ReturnRequest status updated to "Refunded"');
                break;
            }
            process.stdout.write('.');
            retries--;
        }

        if (!success) {
            console.error('FAILED: ReturnRequest status not updated. Check worker logs.');
        } else {
            // Verify Transaction
            const txn = await Transaction.findOne({ referenceId: returnReq._id });
            if (txn) console.log('SUCCESS: Transaction record found:', txn._id);
            else console.error('FAILED: Transaction not found');

            // Verify Stock
            const updatedProduct = await Product.findById(product._id);
            // @ts-ignore
            if (updatedProduct?.stock?.M === 11) {
                console.log('SUCCESS: Product Stock incremented to 11');
            } else {
                 // @ts-ignore
                console.error(`FAILED: Product Stock is ${updatedProduct?.stock?.M}, expected 11`);
            }
        }

    } catch (err) {
        console.error('Test Error:', err);
    } finally {
        await mongoose.connection.close();
        await refundQueue.close();
        console.log('Test Completed');
        process.exit(0);
    }
}

runTest();
