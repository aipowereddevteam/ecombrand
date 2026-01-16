const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Check all collections
        const collections = ['orders', 'products', 'users', 'reviews', 'returnrequests'];
        
        for (const collName of collections) {
            const count = await db.collection(collName).countDocuments();
            console.log(`📦 ${collName}: ${count} documents`);
            
            if (count > 0 && count <= 5) {
                // Show sample for small collections
                const sample = await db.collection(collName).findOne();
                console.log(`   Sample:`, JSON.stringify(sample, null, 2).substring(0, 200) + '...\n');
            } else if (count > 0) {
                // Just show one sample
                const sample = await db.collection(collName).findOne();
                console.log(`   Sample ID: ${sample._id}`);
                if (collName === 'orders') {
                    console.log(`   Order createdAt: ${sample.createdAt}, totalPrice: ${sample.totalPrice}`);
                } else if (collName === 'reviews') {
                    console.log(`   Review rating: ${sample.rating}, createdAt: ${sample.createdAt}`);
                } else if (collName === 'products') {
                    console.log(`   Product title: ${sample.title}, price: ${sample.price}`);
                }
                console.log('');
            }
        }

        // Check date ranges in orders
        const oldestOrder = await db.collection('orders').findOne({}, { sort: { createdAt: 1 } });
        const newestOrder = await db.collection('orders').findOne({}, { sort: { createdAt: -1 } });
        
        if (oldestOrder && newestOrder) {
            console.log('📅 Order Date Range:');
            console.log(`   Oldest: ${oldestOrder.createdAt}`);
            console.log(`   Newest: ${newestOrder.createdAt}`);
            console.log(`   Total span: ${Math.floor((newestOrder.createdAt - oldestOrder.createdAt) / (1000 * 60 * 60 * 24))} days\n`);
        }

        // Check reviews
        const oldestReview = await db.collection('reviews').findOne({}, { sort: { createdAt: 1 } });
        const newestReview = await db.collection('reviews').findOne({}, { sort: { createdAt: -1 } });
        
        if (oldestReview && newestReview) {
            console.log('⭐ Review Date Range:');
            console.log(`   Oldest: ${oldestReview.createdAt}`);
            console.log(`   Newest: ${newestReview.createdAt}\n`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

checkData();
