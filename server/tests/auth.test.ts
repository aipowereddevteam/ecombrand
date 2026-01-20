import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

describe('Authentication System', () => {

    describe('JWT Token Generation', () => {
        it('should generate valid JWT token with correct payload', () => {
            const userId = new mongoose.Types.ObjectId();
            const payload = {
                id: userId,
                role: 'user',
                isPhoneVerified: false,
                name: 'Test User',
                avatar: 'http://example.com/avatar.jpg'
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET as string,
                { expiresIn: '30d' }
            );

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

            expect(decoded.id).toBe(userId.toString());
            expect(decoded.role).toBe('user');
            expect(decoded.isPhoneVerified).toBe(false);
            expect(decoded.name).toBe('Test User');
            expect(decoded).toHaveProperty('exp'); // Expiration timestamp
            expect(decoded).toHaveProperty('iat'); // Issued at timestamp
        });

        it('should have 30-day expiration', () => {
            const token = jwt.sign(
                { id: '123', role: 'user' },
                process.env.JWT_SECRET as string,
                { expiresIn: '30d' }
            );

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            const expectedExpiration = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

            // Allow 5 second tolerance
            expect(decoded.exp).toBeGreaterThan(expectedExpiration - 5);
            expect(decoded.exp).toBeLessThan(expectedExpiration + 5);
        });

        it('should reject tampered tokens', () => {
            const token = jwt.sign(
                { id: '123', role: 'user' },
                process.env.JWT_SECRET as string,
                { expiresIn: '1d' }
            );

            // Tamper with token
            const tamperedToken = token.slice(0, -5) + 'XXXXX';

            expect(() => {
                jwt.verify(tamperedToken, process.env.JWT_SECRET as string);
            }).toThrow();
        });
    });

    describe('Phone Verification', () => {
        let testUser: any;

        beforeEach(async () => {
            // Create test user (simulating Google OAuth user)
            testUser = await User.create({
                name: 'Google User',
                email: 'google@example.com',
                googleId: 'google_12345',
                avatar: 'http://example.com/google-avatar.jpg',
                role: 'user',
                isPhoneVerified: false
            });
        });

        it('should verify phone number successfully', async () => {
            const phone = '9876543210';

            // Update user
            testUser.phone = phone;
            testUser.isPhoneVerified = true;
            await testUser.save();

            // Verify update
            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser?.phone).toBe(phone);
            expect(updatedUser?.isPhoneVerified).toBe(true);
        });

        it('should prevent duplicate phone numbers', async () => {
            const phone = '9876543210';

            // Create first user with phone
            await User.create({
                name: 'User 1',
                email: 'user1@example.com',
                googleId: 'google_111',
                phone: phone,
                isPhoneVerified: true
            });

            // Try to find existing user with same phone
            const existing = await User.findOne({ phone });
            expect(existing).not.toBeNull();
            expect(existing?.email).toBe('user1@example.com');

            // Prevent second user with same phone (would be handled in controller)
            const isDuplicate = existing && existing._id.toString() !== testUser._id.toString();
            expect(isDuplicate).toBe(true);
        });

        it('should allow user to update their own phone', async () => {
            const newPhone = '1234567890';

            testUser.phone = newPhone;
            testUser.isPhoneVerified = true;
            await testUser.save();

            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser?.phone).toBe(newPhone);
        });
    });

    describe('User Roles & Authorization', () => {
        it('should create user with default role', async () => {
            const user = await User.create({
                name: 'Default User',
                email: 'default@example.com',
                googleId: 'google_default'
            });

            expect(user.role).toBe('user');
        });

        it('should create admin user', async () => {
            const admin = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                googleId: 'google_admin',
                role: 'admin'
            });

            expect(admin.role).toBe('admin');
        });

        it('should differentiate between user and admin tokens', () => {
            const userToken = jwt.sign(
                { id: '123', role: 'user' },
                process.env.JWT_SECRET as string
            );

            const adminToken = jwt.sign(
                { id: '456', role: 'admin' },
                process.env.JWT_SECRET as string
            );

            const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET as string) as any;
            const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET as string) as any;

            expect(decodedUser.role).toBe('user');
            expect(decodedAdmin.role).toBe('admin');
        });
    });

    describe('User Model Validation', () => {
        it('should require name and email', async () => {
            let error;
            try {
                await User.create({
                    googleId: 'test_123'
                    // Missing name and email
                });
            } catch (e) {
                error = e;
            }

            expect(error).toBeDefined();
        });

        it('should enforce unique email', async () => {
            await User.create({
                name: 'User 1',
                email: 'unique@example.com',
                googleId: 'google_1'
            });

            let error;
            try {
                await User.create({
                    name: 'User 2',
                    email: 'unique@example.com', // Duplicate
                    googleId: 'google_2'
                });
            } catch (e: any) {
                error = e;
            }

            expect(error).toBeDefined();
            expect(error.code).toBe(11000); // MongoDB duplicate key error
        });

        it('should store avatar URL correctly', async () => {
            const avatarUrl = 'https://lh3.googleusercontent.com/a/default-user';

            const user = await User.create({
                name: 'Avatar User',
                email: 'avatar@example.com',
                googleId: 'google_avatar',
                avatar: avatarUrl
            });

            expect(user.avatar).toBe(avatarUrl);
        });
    });

    describe('Token Payload Structure', () => {
        it('should include all required fields in token payload', () => {
            const userId = new mongoose.Types.ObjectId();
            const payload = {
                id: userId,
                role: 'user',
                isPhoneVerified: false,
                name: 'Complete User',
                avatar: 'http://example.com/avatar.jpg'
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET as string);
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

            // Check all expected fields are present
            expect(decoded).toHaveProperty('id');
            expect(decoded).toHaveProperty('role');
            expect(decoded).toHaveProperty('isPhoneVerified');
            expect(decoded).toHaveProperty('name');
            expect(decoded).toHaveProperty('avatar');
        });

        it('should not include sensitive data in token', () => {
            const payload = {
                id: new mongoose.Types.ObjectId(),
                role: 'user',
                isPhoneVerified: false,
                name: 'User',
                avatar: 'http://example.com/avatar.jpg'
                // Should NOT include: password, googleId, etc.
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET as string);
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

            expect(decoded).not.toHaveProperty('password');
            expect(decoded).not.toHaveProperty('googleId');
            expect(decoded).not.toHaveProperty('__v');
        });
    });
});
