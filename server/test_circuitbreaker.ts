import { CircuitBreaker } from './utils/circuitBreaker';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const testCircuitBreaker = async () => {
    console.log('Testing Circuit Breaker Logic...');

    // Config: Trip after 3 failures, reset after 2 seconds (fast for testing)
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 2000 });

    const failingService = async () => {
        throw new Error('Service Failed');
    };

    const workingService = async () => {
        return 'Success';
    };

    // 1. Normal State
    try {
        await cb.fire(workingService);
        console.log('[PASS] Closed (Normal) State works.');
    } catch (e) {
        console.log('[FAIL] Closed State failed.');
    }

    // 2. Trip the Circuit (3 failures)
    console.log('Simulating 3 failures...');
    for (let i = 0; i < 3; i++) {
        try {
            await cb.fire(failingService);
        } catch (e) {
            process.stdout.write('x ');
        }
    }
    console.log('');

    // 3. Verify Open State (Should fail fast without calling service)
    try {
        await cb.fire(workingService); // Even if service works, circuit should block it
        console.log('[FAIL] Circuit did NOT open.');
    } catch (e: any) {
        if (e.message.includes('Circuit is OPEN')) {
            console.log('[PASS] Circuit is OPEN. Request blocked.');
        } else {
            console.log(`[FAIL] Unexpected error: ${e.message}`);
        }
    }

    // 4. Wait for Half-Open (2.1 seconds)
    console.log('Waiting for Reset Timeout (2.1s)...');
    await sleep(2100);

    // 5. Verify Recovery (Half-Open -> Closed)
    try {
        const result = await cb.fire(workingService);
        if (result === 'Success') {
            console.log('[PASS] Circuit recovered (Half-Open -> Closed).');
        }
    } catch (e) {
        console.log(`[FAIL] Recovery failed: ${e}`);
    }
};

testCircuitBreaker();
