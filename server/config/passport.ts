import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import User from '../models/User';
import dotenv from 'dotenv';
import sendEmail from '../utils/sendEmail';
dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const { id, emails, displayName, photos } = profile;
            const email = emails?.[0].value;
            const picture = photos?.[0].value;

            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    email,
                    name: displayName,
                    avatar: picture,
                    googleId: id,
                    role: 'user'
                });

                // Send Welcome Email
                if (email) {
                    try {
                        const message = `Welcome to ShopMate, ${displayName}! \n\nWe are excited to have you on board. Explore our latest collection now!`;
                        const html = `
                            <div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2>Welcome to ShopMate! 🎉</h2>
                                <p>Hi ${displayName},</p>
                                <p>We are thrilled to have you join our community.</p>
                                <p>At ShopMate, we bring you the best fashion trends at unbeatable prices.</p>
                                <a href="${process.env.FRONTEND_URL}" style="background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
                            </div>
                        `;

                        await sendEmail({
                            email: email,
                            subject: "Welcome to ShopMate! 🛍️",
                            message,
                            html
                        });
                        console.log(`Welcome email sent to ${email}`);
                    } catch (emailError) {
                        console.error("Failed to send welcome email", emailError);
                    }
                }
            }

            if (!user.googleId) {
                user.googleId = id;
                await user.save();
            }

            return done(null, user);
        } catch (error: any) {
            return done(error, undefined);
        }
    }
));

const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET as string
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

export default passport;
