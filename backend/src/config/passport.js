import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { getDocument, addDocument, updateDocument, getDocuments } from "./firestore.js";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
            },
            async (_, __, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    const uid = profile.id;
                    const displayName = profile.displayName;
                    const photoURL = profile.photos?.[0]?.value;

                    if (!email) {
                        return done(new Error("No email provided by Google"), false);
                    }

                    // Check if user exists by email in Firestore
                    const users = await getDocuments('users', [
                        { field: 'email', operator: '==', value: email }
                    ]);

                    let userDoc = users && users.length > 0 ? users[0] : null;

                    if (userDoc) {
                        // Existing user - update with Google info if not already set
                        if (!userDoc.googleId) {
                            await updateDocument('users', userDoc.id, {
                                googleId: uid,
                                authProvider: 'GOOGLE',
                                isEmailVerified: true
                            });
                        }
                    } else {
                        // New user - create profile and user document
                        const [firstName, ...lastNameParts] = displayName.trim().split(/\s+/);
                        const lastName = lastNameParts.join(' ') || displayName;

                        // Create profile first
                        const profileId = await addDocument('profiles', {
                            firstName: firstName || 'User',
                            lastName: lastName || '',
                            bio: '',
                            profilePhoto: photoURL || `https://api.dicebear.com/5.x/initials/svg?seed=${displayName}`,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });

                        // Create user document
                        await addDocument('users', {
                            uid,
                            firstName: firstName || 'User',
                            lastName: lastName || '',
                            email,
                            profile: profileId,
                            googleId: uid,
                            authProvider: 'GOOGLE',
                            role: 'ALUMNI',
                            status: 'ACTIVE',
                            isEmailVerified: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }, uid);

                        userDoc = {
                            uid,
                            firstName: firstName || 'User',
                            lastName: lastName || '',
                            email,
                            profile: profileId
                        };
                    }

                    // Return user object for req.user
                    done(null, {
                        uid: userDoc.uid || uid,
                        email: userDoc.email,
                        displayName: userDoc.firstName + ' ' + userDoc.lastName,
                        photoURL: userDoc.profilePhoto || photoURL,
                        ...userDoc
                    });
                } catch (err) {
                    console.error('Passport Google strategy error:', err);
                    done(err, false);
                }
            }
        )
    );
}