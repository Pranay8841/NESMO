import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/api/auth/google/callback"
            },
            async (_, __, profile, done) => {
                try {
                    const email = profile.emails?.[0].value;

                    let user = await User.findOne({ email });

                    if (user && !user.googleId) {
                        user.googleId = profile.id;
                        user.authProvider = "GOOGLE";
                        await user.save();
                    }

                    if (!user) {
                        user = await User.create({
                            fullName: profile.displayName,
                            email,
                            googleId: profile.id,
                            authProvider: "GOOGLE",
                            role: "VISITOR"
                        });
                    }

                    done(null, user);
                } catch (err) {
                    done(err, false);
                }
            }
        )
    );
}