const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const { id, emails, displayName, photos } = profile;
            const email = emails[0].value;
            const picture = photos[0].value;

            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    email,
                    name: displayName,
                    avatar: picture,
                    googleId: id,
                    role: 'user'
                });
            }

            if (!user.googleId) {
                user.googleId = id;
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = passport;
