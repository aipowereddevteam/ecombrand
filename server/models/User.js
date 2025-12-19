const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        // Email might not be present if phone based or other auth methods are added later without email, 
        // but requirements say email (unique). Assuming required for Google Auth.
        required: true
    },
    avatar: {
        type: String
    },
    googleId: {
        type: String
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'account_manager'],
        default: 'user'
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
