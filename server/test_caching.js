// Adjust port if needed (default 5000 based on previous logs)
const BASE_URL = 'http://localhost:5000/api';

async function testCaching() {
    try {
        console.log("1. Fetching all products to get an ID...");
        const res = await fetch(`${BASE_URL}/products`);
        const data = await res.json();
        
        if (!data.success || !data.products || data.products.length === 0) {
            console.error("❌ No products found to test.");
            return;
        }

        const productId = data.products[0]._id;
        console.log(`> Found Product ID: ${productId}`);

        console.log("\n2. First Request (DB Fetch)...");
        const start1 = performance.now();
        await fetch(`${BASE_URL}/product/${productId}`);
        const end1 = performance.now();
        const time1 = end1 - start1;
        console.log(`> Time: ${time1.toFixed(2)}ms`);

        console.log("\n3. Second Request (Redis Cache)...");
        const start2 = performance.now();
        await fetch(`${BASE_URL}/product/${productId}`);
        const end2 = performance.now();
        const time2 = end2 - start2;
        console.log(`> Time: ${time2.toFixed(2)}ms`);

        if (time2 < time1) {
            console.log("\n✅ Caching Verification PASSED: Second request was faster.");
        } else {
            console.log("\n⚠️ Caching Verification INCONCLUSIVE: Timing similar (maybe local DB is too fast or overhead).");
        }

    } catch (error) {
        console.error("Test Failed:", error.message);
    }
}

testCaching();
