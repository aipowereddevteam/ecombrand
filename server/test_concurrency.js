const axios = require('axios');

const API_URL = 'http://0.0.0.0:5000/api';
// You might need to update these IDs based on your local DB
const PRODUCT_ID = '694571f840cb1a047e5a03a1'; 
const USER_TOKEN = ''; // We will rely on the user to paste this or I will try to login

async function runTest() {
    console.log("🚀 Starting Flash Sale Simulation (Concurrency Test)...");

    // 1. Simulate 5 simultaneous requests
    const attempts = Array.from({ length: 5 }).map((_, i) => i + 1);

    console.log(`Firing ${attempts.length} parallel order requests for Product: ${PRODUCT_ID}`);

    const requests = attempts.map(i => {
        return axios.post(`${API_URL}/orders/new`, {
            shippingInfo: {
                address: "Test Address",
                city: "Test City",
                state: "Test State",
                country: "Test Country",
                pinCode: 123456,
                phoneNo: 1234567890
            },
            orderItems: [{
                name: "Concurrency Test Item",
                price: 100,
                quantity: 1,
                image: "http://example.com/img.png",
                product: PRODUCT_ID,
                size: "M" // Ensure this size exists and has low stock (e.g., 1 or 2)
            }],
            paymentInfo: {
                id: `test_txn_${Date.now()}_${i}`,
                status: "succeeded"
            },
            itemsPrice: 100,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 100
        }, {
            // AUTH HEADER NEEDED: User must replace this
            headers: { 
                "Content-Type": "application/json",
                // "Authorization": "Bearer <YOUR_TOKEN>" 
            },
            validateStatus: () => true // Don't throw on error status
        }).then(res => ({
            id: i,
            status: res.status,
            data: res.data
        }));
    });

    const results = await Promise.all(requests);

    console.log("\n📊 Results:");
    results.forEach(r => {
        let icon = '❌';
        if (r.status === 201) icon = '✅ SUCCESS';
        if (r.status === 429) icon = '⚠️ LOCKED (System Busy)';
        if (r.status === 409) icon = '⛔ OUT OF STOCK';
        
        console.log(`${icon} Request #${r.id}: Status ${r.status} - ${JSON.stringify(r.data)}`);
    });

    const successCount = results.filter(r => r.status === 201).length;
    const lockedCount = results.filter(r => r.status === 429).length;
    const failCount = results.filter(r => r.status !== 201 && r.status !== 429).length;

    console.log(`\nSummary:`);
    console.log(`- Successful Orders: ${successCount}`);
    console.log(`- Blocked by Lock:   ${lockedCount}`);
    console.log(`- Other Failures:    ${failCount}`);
}

runTest();
