import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { googleSignIn } from '../../services/authService';
import AuthLoading from './AuthLoading';
import nesmoLogo from '../../assets/nesmo-logo-transperant.png';

const backgroundImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDW4vPiCeZ4gsaK4aZaETJJ3s7KjcDPRsqa2pFP5nSuDlstKJ8fOPWpwRzXqrJcJ9GcoZ0oBUoNup6lHsLZtGCzhs371PlWmu2XmsCf6fzcEZPJNamEgpZ9D76ksuY4QRByODUcgXY98BJEZYBZRWwQgADiYxmWC-bwJIcUWeb9IOF5tcNWEMdznncRi4caQYg0w-3VkGp5SS9pk8WHk_8KDl5sGQLHpo6QZND5BEM-6tZ6if2Gmydi-43Bm1OGjW5akJnhYtm0txDb';

interface SignupProps {
    onSuccess?: () => void;
    onOpenLogin?: () => void;
}

export default function Signup({ onSuccess, onOpenLogin }: SignupProps) {
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.auth);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsAuthenticating(true);
        const result = await dispatch(googleSignIn());
        
        if (googleSignIn.fulfilled.match(result)) {
            setIsAuthenticating(false);
            onSuccess?.();
        } else {
            setIsAuthenticating(false);
        }
    };

    // Show full-screen loading when authenticating
    if (isAuthenticating || loading) {
        return <AuthLoading message="Creating your account..." subMessage="Connecting with your Google account..." />;
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Hero Section (hidden on mobile) */}
            <div
                className="hidden lg:flex w-full lg:w-1/2 bg-cover bg-center relative min-h-[300px] lg:min-h-screen"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-12 text-white w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <img src={nesmoLogo} alt="NESMO" className="w-10 h-10 lg:w-12 lg:h-12" />
                        <span className="text-xl lg:text-2xl font-bold">NESMO</span>
                    </div>

                    {/* Hero Text */}
                    <div className="my-6 lg:my-0">
                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 lg:mb-4 leading-tight">
                            Reconnect with<br />your JNV roots.
                        </h1>
                        <p className="text-sm lg:text-lg text-white/90 max-w-md mb-4 lg:mb-8">
                            Join the Navodaya Alumni Network. Access our nationwide directory, exclusive events, and a supportive community that spans generations.
                        </p>

                        {/* Alumni Count */}
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop"
                                    alt="Alumni"
                                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
                                    alt="Alumni"
                                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop"
                                    alt="Alumni"
                                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white"
                                />
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white bg-yellow-400 flex items-center justify-center font-bold text-gray-900 text-xs">
                                    10k+
                                </div>
                            </div>
                            <span className="text-xs lg:text-sm text-white/90">Joined by alumni worldwide</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="hidden lg:flex items-center justify-between text-sm text-white/80">
                        <span>© 2024 NESMO Community</span>
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-white">Privacy</a>
                            <a href="#" className="hover:text-white">Terms</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-6 sm:p-8 min-h-screen">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8 lg:mb-10 text-center">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2">
                            Create an account
                        </h2>
                        <p className="text-indigo-700 text-xs sm:text-sm font-medium">
                            Sign up with your Google account to join NESMO
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
                        {/* Google Sign Up Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isAuthenticating}
                            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base text-gray-900"
                        >
                            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05" />
                                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
                            </svg>
                            <span>Sign up with Google</span>
                        </button>

                        {/* Login Link */}
                        <div className="mt-4 sm:mt-6 text-center">
                            <p className="text-gray-600 text-xs sm:text-sm">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={onOpenLogin}
                                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                                >
                                    Log in here
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs text-gray-500">
                        <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
