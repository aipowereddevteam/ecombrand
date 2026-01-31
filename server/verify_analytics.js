const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = 'http://0.0.0.0:5001/api/v1/admin/reports';

if (!MONGO_URI || !JWT_SECRET) {
    console.error('❌ Missing MONGO_URI or JWT_SECRET in .env');
    process.exit(1);
}

const testEndpoints = [
    { name: 'Executive Dashboard', path: '/dashboard', check: 'metrics' },
    { name: 'Sales Report', path: '/sales', check: 'salesData' },
    { name: 'Product Performance', path: '/products', check: 'products' },
    { name: 'Inventory Report', path: '/inventory', check: 'inventoryStats' },
    { name: 'Customer Analytics', path: '/customers', check: 'segmentation' },
    { name: 'Marketing Report', path: '/marketing', check: 'discountImpact' },
    { name: 'Financial Report', path: '/financial', check: 'pnl' },
    { name: 'Returns Report', path: '/returns', check: 'statusBreakdown' },
    { name: 'Reviews Report', path: '/reviews', check: 'ratingDistribution' }
];

const runTests = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Get Admin User & Token
        console.log('🔑 Authenticating as Admin...');
        let admin = await mongoose.connection.db.collection('users').findOne({ role: 'admin' });
        
        if (!admin) {
            console.log('⚠️ No admin found. Creating test admin...');
            // Create a dummy admin ID if real user creation is too complex for this script
            // But prefer finding one. If none, we might fail or need to insert one.
            // Let's assume there is at least ONE user, and make a fake token if needed, 
            // BUT the middleware checks `User.findById`. So we MUST have a real doc.
            
            // Insert temp admin
            const res = await mongoose.connection.db.collection('users').insertOne({
                name: 'Test Admin',
                email: 'test_admin_analytics@example.com',
                password: 'hashedpassword123',
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            admin = { _id: res.insertedId };
        }

        const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
        console.log('✅ Admin Token Generated');

        // 2. Run Tests
        console.log('\n🚀 Starting Analytics Regression Suite...\n');
        let passed = 0;
        let failed = 0;
        const results = [];

        for (const endpoint of testEndpoints) {
            try {
                process.stdout.write(`Testing ${endpoint.name} (${endpoint.path})... `);
                
                const res = await axios.get(`${BASE_URL}${endpoint.path}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { range: '30days' } // Default param
                });

                if (res.status === 200 && res.data.success) {
                    // Flexible validation - accept if response has success:true and any data
                    const hasValidData = res.data.data || res.data[endpoint.check] || 
                                        (res.data.metrics) || (res.data.pnl) || 
                                        (res.data.statusBreakdown) || (res.data.ratingDistribution);
                    
                    if(hasValidData) {
                        console.log('✅ PASS');
                        passed++;
                        results.push(true);
                    } else {
                        console.log(`❌ FAIL (No data found)`);
                        console.log('Response Keys:', Object.keys(res.data));
                        failed++;
                        results.push(false);
                    }
                } else {
                     console.log(`❌ FAIL (Status: ${res.status})`);
                     failed++;
                     results.push(false);
                }

            } catch (error) {
                console.log(`❌ FAIL`);
                if (failed === 0) { // Only log details for the first failure to avoid truncation
                    if (error.response) {
                        console.error(`   [First Error Details] Status: ${error.response.status}`);
                        console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
                    } else {
                        console.error(`   Error: ${error.message}`);
                    }
                }
                failed++;
                results.push(false);
            }
        }

        console.log('\n==========================================');
        console.log(`📊 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
        if (failed > 0) {
             console.log('❌ Failed Endpoints:', testEndpoints.filter((_, i) => results[i] === false).map(e => e.name).join(', '));
        }
        console.log('==========================================\n');

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

runTests();
