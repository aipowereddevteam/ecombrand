const mongoose = require('mongoose');
require('dotenv').config();

const updateDates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        
        // Get current date
        const now = new Date();
        console.log(`📅 Current Date: ${now}\n`);

        // Check current date ranges
        const oldestOrder = await db.collection('orders').findOne({}, { sort: { createdAt: 1 } });
        const newestOrder = await db.collection('orders').findOne({}, { sort: { createdAt: -1 } });
        
        if (oldestOrder) {
            console.log('📦 BEFORE Update - Order Dates:');
            console.log(`   Oldest: ${oldestOrder.createdAt}`);
            console.log(`   Newest: ${newestOrder.createdAt}`);
            
            const daysDiff = Math.floor((now - newestOrder.createdAt) / (1000 * 60 * 60 * 24));
            console.log(`   Days from newest to now: ${daysDiff}\n`);

            // Update all orders to be within last 30 days
            // Calculate offset to move all dates forward
            const offset = now - newestOrder.createdAt;
            
            console.log('🔄 Updating order dates to current period...');
            const orders = await db.collection('orders').find({}).toArray();
            
            for (const order of orders) {
                const newDate = new Date(order.createdAt.getTime() + offset);
                await db.collection('orders').updateOne(
                    { _id: order._id },
                    { $set: { createdAt: newDate, updatedAt: newDate } }
                );
            }
            
            console.log(`✅ Updated ${orders.length} orders\n`);

            // Update reviews similarly
            const reviews = await db.collection('reviews').find({}).toArray();
            if (reviews.length > 0) {
                console.log('🔄 Updating review dates...');
                for (const review of reviews) {
                    const newDate = new Date(review.createdAt.getTime() + offset);
                    await db.collection('reviews').updateOne(
                        { _id: review._id },
                        { $set: { createdAt: newDate } }
                    );
                }
                console.log(`✅ Updated ${reviews.length} reviews\n`);
            }

            // Update users createdAt for recent customers
            const users = await db.collection('users').find({}).toArray();
            if (users.length > 0) {
                console.log('🔄 Updating user registration dates...');
                for (const user of users) {
                    if (user.createdAt) {
                        const newDate = new Date(user.createdAt.getTime() + offset);
                        await db.collection('users').updateOne(
                            { _id: user._id },
                            { $set: { createdAt: newDate, updatedAt: newDate } }
                        );
                    }
                }
                console.log(`✅ Updated ${users.length} users\n`);
            }

            // Update return requests if any
            const returns = await db.collection('returnrequests').find({}).toArray();
            if (returns.length > 0) {
                console.log('🔄 Updating return request dates...');
                for (const ret of returns) {
                    const newDate = new Date(ret.createdAt.getTime() + offset);
                    await db.collection('returnrequests').updateOne(
                        { _id: ret._id },
                        { $set: { createdAt: newDate, updatedAt: newDate } }
                    );
                }
                console.log(`✅ Updated ${returns.length} return requests\n`);
            }

            // Verify
            const verifyOrder = await db.collection('orders').findOne({}, { sort: { createdAt: -1 } });
            console.log('✅ AFTER Update - Newest Order Date:', verifyOrder.createdAt);
            console.log(`   Days ago: ${Math.floor((now - verifyOrder.createdAt) / (1000 * 60 * 60 * 24))}\n`);
            
            console.log('🎉 All dates updated successfully!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

updateDates();
