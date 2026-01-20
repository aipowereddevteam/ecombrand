import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

// Setup - runs once before all tests
beforeAll(async () => {
    try {
        // Create in-memory MongoDB instance
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        // Connect mongoose to in-memory DB
        await mongoose.connect(uri);

        console.log('✅ Test database connected');
    } catch (error) {
        console.error('❌ Test database connection failed:', error);
        throw error;
    }
});

// Cleanup after each test
afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;

        // Clear all collections after each test for isolation
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
});

// Teardown - runs once after all tests
afterAll(async () => {
    try {
        // Disconnect mongoose
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        // Stop in-memory MongoDB
        if (mongoServer) {
            await mongoServer.stop();
        }

        console.log('✅ Test database disconnected');
    } catch (error) {
        console.error('❌ Test database cleanup failed:', error);
    }
});

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRE = '7d';
process.env.NODE_ENV = 'test';

// Mock Redis for tests (simple in-memory object)
const mockRedis = {
    data: new Map(),

    async get(key: string) {
        return this.data.get(key) || null;
    },

    async set(key: string, value: string, ...args: any[]) {
        this.data.set(key, value);
        return 'OK';
    },

    async del(...keys: string[]) {
        let count = 0;
        keys.forEach(key => {
            if (this.data.delete(key)) count++;
        });
        return count;
    },

    async keys(pattern: string) {
        // Simple pattern matching for testing
        const allKeys = Array.from(this.data.keys());
        if (pattern === '*' || pattern.endsWith('*')) {
            const prefix = pattern.replace('*', '');
            return allKeys.filter(k => k.startsWith(prefix));
        }
        return allKeys.filter(k => k === pattern);
    },

    async flushall() {
        this.data.clear();
        return 'OK';
    }
};

// Mock the redis utility
jest.mock('../utils/redis', () => mockRedis);

// Clear Redis mock between tests
afterEach(() => {
    mockRedis.data.clear();
});
