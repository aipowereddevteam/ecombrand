const jwt = require('jsonwebtoken');

exports.isAuthenticated = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Assuming payload contains user info
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

exports.ensurePhoneVerified = (req, res, next) => {
    if (!req.user || !req.user.isPhoneVerified) {
        return res.status(403).json({ error: 'PHONE_REQUIRED' });
    }
    next();
};
