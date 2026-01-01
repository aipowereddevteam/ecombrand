const http = require('http');

const TOTAL_REQUESTS = 15;
// Using /api/auth because it is protected by 'strictLimiter' (10 req / 5 min)
const PATH = '/api/auth/check-status-dummy';

console.log(`Starting Rate Limit Test: Sending ${TOTAL_REQUESTS} requests to ${PATH}...`);

let completed = 0;

for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: PATH,
        method: 'GET'
    }, (res) => {
        let logColor = '\x1b[32m'; // Green
        if (res.statusCode === 429) logColor = '\x1b[31m'; // Red
        else if (res.statusCode >= 400) logColor = '\x1b[33m'; // Yellow

        console.log(`${logColor}[Request ${i}] Status: ${res.statusCode} ${res.statusCode === 429 ? '(Rate Limit Hit!)' : ''}\x1b[0m`);

        completed++;
        if (completed === TOTAL_REQUESTS) {
            console.log('\nTest Complete.');
        }
    });

    req.on('error', (e) => {
        console.error(`[Request ${i}] Failed: ${e.message}`);
    });

    req.end();
}
