const http = require('http');

console.log('Testing Server Observability & Resilience...');

// 1. Test Correlation ID
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`\n[STATUS] ${res.statusCode}`);
    const correlationId = res.headers['x-correlation-id'];

    if (correlationId) {
        console.log(`[PASS] Received Correlation ID: ${correlationId}`);
    } else {
        console.log('[FAIL] No Correlation ID found in headers.');
    }
});

req.on('error', (e) => {
    console.error(`[ERROR] Request failed: ${e.message}`);
    console.log('NOTE: Ensure the server is running (npm run dev).');
});

req.end();
