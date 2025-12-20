const dotenv = require('dotenv');
const path = require('path');

// Try loading from .env
const result = dotenv.config({ path: path.join(__dirname, '.env') });

if (result.error) {
    console.log("Error loading .env file:", result.error.message);
} else {
    console.log(".env file loaded successfully.");
}

const keyId = process.env.RAZORPAY_API_KEY || process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_API_SECRET || process.env.RAZORPAY_KEY_SECRET;

console.log("Checking Razorpay Keys...");
console.log("RAZORPAY_KEY_ID/API_KEY Present:", !!keyId);
console.log("RAZORPAY_KEY_SECRET/API_SECRET Present:", !!keySecret);

if (!keyId || !keySecret) {
    console.error("FAIL: Missing Razorpay Keys. Please check your .env file.");
} else {
    console.log("SUCCESS: Razorpay Keys are present.");
}
