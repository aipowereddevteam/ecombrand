const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.googleCallback = (req, res) => {
    try {
        const user = req.user;
        const token = jwt.sign(
            { id: user._id, role: user.role, isPhoneVerified: user.isPhoneVerified },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Redirect to frontend with token
        // Assuming frontend is running on localhost:3000
        res.redirect(`http://localhost:3000/login?token=${token}`);
    } catch (error) {
        console.error("Google Callback Error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.verifyPhone = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Check if phone already used by another user
        const existingUser = await User.findOne({ phone });
        if (existingUser && existingUser._id.toString() !== req.user.id) {
            return res.status(400).json({ error: 'Phone number already in use' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.phone = phone;
        user.isPhoneVerified = true;
        await user.save();

        // Regenerate token with updated isPhoneVerified status
        const token = jwt.sign(
            { id: user._id, role: user.role, isPhoneVerified: user.isPhoneVerified },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Phone verified successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                isPhoneVerified: user.isPhoneVerified,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error("Verify Phone Error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};
