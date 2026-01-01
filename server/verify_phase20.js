const http = require('http');

console.log('Testing Phase 20: Disaster Recovery & High Availability...');

const makeRequest = (path, name, expectedStatus) => {
    return new Promise((resolve) => {
        http.get({
            hostname: 'localhost',
            port: 5000,
            path: path,
        }, (res) => {
            const success = res.statusCode === expectedStatus;
            const logColor = success ? '\x1b[32m' : '\x1b[31m';
            console.log(`${logColor}[${name}] Path: ${path} | Status: ${res.statusCode} (Expected: ${expectedStatus}) | Result: ${success ? 'PASS' : 'FAIL'}\x1b[0m`);

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (path === '/health') console.log('Health Response:', data);
                resolve();
            });
        }).on('error', (e) => {
            console.error(`[${name}] Error: ${e.message}`);
            resolve();
        });
    });
};

const runTests = async () => {
    // 1. Health Check
    await makeRequest('/health', 'Health Check', 200);

    // 2. API Versioning (Success Case)
    // Assuming /api/v1/products exists and returns 200 or 401/403 depending on auth, 
    // but at least not 404 (unless empty). 
    // Actually products public endpoint is safest.
    await makeRequest('/api/v1/products', 'API V1 Access', 200);

    // 3. API Versioning (Old Path Failure)
    await makeRequest('/api/products', 'Legacy API Block', 404);

    console.log('\nVerification Complete.');
    console.log('NOTE: To test Graceful Shutdown, manually press Ctrl+C in the server terminal and watch the logs.');
};

runTests();
