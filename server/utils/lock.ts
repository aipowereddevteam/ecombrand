import redis from './redis';

const DEFAULT_TTL_MS = 5000; // 5 seconds default lock time

/**
 * Acquires a distributed lock for a specific key.
 * @param key The unique key to lock (e.g., "lock:product:123").
 * @param ttlMs Time to live for the lock in milliseconds.
 * @returns A function to release the lock if acquired, or null if failed.
 */
export const acquireLock = async (key: string, ttlMs: number = DEFAULT_TTL_MS): Promise<(() => Promise<void>) | null> => {
    // SET resource_name my_random_value NX PX 30000
    // NX -- Only set the key if it does not already exist.
    // PX -- Set the specified expire time, in milliseconds.
    const uniqueVal = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    const result = await redis.set(key, uniqueVal, 'PX', ttlMs, 'NX');

    if (result === 'OK') {
        // Lock acquired, return a release function that safely releases the lock ONLY if it holds the correct value
        return async () => {
            // Lua script to safely delete the key only if the value matches (prevents deleting others' locks)
            const script = `
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                else
                    return 0
                end
            `;
            await redis.eval(script, 1, key, uniqueVal);
        };
    }
    
    return null; // Lock busy
};
