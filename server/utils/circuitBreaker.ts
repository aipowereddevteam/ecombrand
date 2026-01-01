import logger from './logger';

enum CircuitState {
    CLOSED,    // Normal operation
    OPEN,      // Failing, stop traffic
    HALF_OPEN  // Testing if service recovers
}

interface CircuitBreakerOptions {
    failureThreshold: number; // Number of failures before opening
    resetTimeout: number;     // Time in ms to wait before checking recovery
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount: number = 0;
    private nextAttempt: number = Date.now();
    private failureThreshold: number;
    private resetTimeout: number;

    constructor(options: CircuitBreakerOptions = { failureThreshold: 3, resetTimeout: 30000 }) {
        this.failureThreshold = options.failureThreshold;
        this.resetTimeout = options.resetTimeout;
    }

    public async fire<T>(action: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() > this.nextAttempt) {
                this.state = CircuitState.HALF_OPEN;
                logger.warn('Circuit Breaker entering HALF_OPEN state');
            } else {
                throw new Error('Circuit is OPEN: Service Unavailable');
            }
        }

        try {
            const result = await action();
            this.success();
            return result;
        } catch (error) {
            this.failure();
            throw error;
        }
    }

    private success() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.CLOSED;
            logger.info('Circuit Breaker closed (Service Recovered)');
        }
    }

    private failure() {
        this.failureCount++;
        if (this.failureCount >= this.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttempt = Date.now() + this.resetTimeout;
            logger.error(`Circuit Breaker OPENED after ${this.failureCount} failures`);
        }
    }
}
