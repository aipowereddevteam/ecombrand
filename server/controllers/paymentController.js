const Razorpay = require('razorpay');
const crypto = require('crypto');

exports.processPayment = async (req, res, next) => {
    try {
        const keyId = process.env.RAZORPAY_API_KEY || process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_API_SECRET || process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            console.error("Razorpay Keys Missing. API_KEY:", !!keyId, "API_SECRET:", !!keySecret);
            return res.status(500).json({ error: "Server Configuration Error: Razorpay Keys not found" });
        }

        const instance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const options = {
            amount: req.body.amount, // Amount in lowest denomination (paise)
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            key: keyId
        });
    } catch (error) {
        console.error("Payment Error", error);
        res.status(500).json({ error: "Payment processing failed" });
    }
};

exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const keySecret = process.env.RAZORPAY_API_SECRET || process.env.RAZORPAY_KEY_SECRET;

        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            res.status(200).json({
                success: true,
                message: "Payment verified successfully"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
