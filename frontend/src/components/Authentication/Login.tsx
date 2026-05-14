import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { googleSignIn } from '../../services/authService';
import AuthLoading from './AuthLoading';
import nesmoLogo from '../../assets/nesmo-logo-transperant.png';

const backgroundImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIIuthEqIFJvMsr1O6clwVW6l7p5zYh3zKbWu_kdTxkqYJGfZwlnZaKhNXblwnWRoYSeiSEjmsi-u0NfEsOqBdPylHvS1KCXxpGbF8wpqaz8IJilF81WtaIv4U1yyAlVE_iSV7jHcWOuut8GF5MGnIH-nAq78XbzOYS1PFYay9OXrwLSe6Sk4eKgX0kLAOh2QFNgEBoVNU87rSaF8iSgFpXZxPXzutwwHqNMHBLEOHPMMYsROFDkGTu075tTQFbFvoWwwxC7Sx89OU';

interface LoginProps {
    onSuccess?: () => void;
    onSwitchToSignup?: () => void;
}

export default function Login({ onSuccess, onSwitchToSignup }: LoginProps) {
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
        return <AuthLoading message="Signing you in..." subMessage="Connecting with your Google account..." />;
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Hero Section (hidden on mobile) */}
            <div
                className="hidden lg:flex w-full lg:w-1/2 bg-blue-700 relative overflow-hidden min-h-[300px] lg:min-h-screen"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Blue Overlay */}
                <div className="absolute inset-0 bg-blue-700/60"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-12 text-white w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <img src={nesmoLogo} alt="NESMO" className="w-10 h-10 lg:w-12 lg:h-12" />
                        <span className="text-xl lg:text-3xl font-black tracking-tight">NESMO</span>
                    </div>

                    {/* Hero Text */}
                    <div className="max-w-lg my-6 lg:my-0">
                        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 lg:mb-6 leading-tight">
                            Connecting<br />
                            Navodaya<br />
                            Alumni<br />
                            Worldwide
                        </h1>
                        <p className="text-sm lg:text-lg text-white/90 leading-relaxed mb-4 lg:mb-8">
                            Reignite the JNV spirit. Access the global directory, exclusive events, professional networking, and institutional support.
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                            <button className="px-3 lg:px-5 py-2 lg:py-2.5 bg-yellow-500 text-blue-900 rounded-full text-xs lg:text-sm font-bold flex items-center gap-2 hover:bg-yellow-400 transition-colors">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                                </svg>
                                LEGACY NETWORK
                            </button>
                            <button className="px-3 lg:px-5 py-2 lg:py-2.5 bg-transparent border-2 border-white text-white rounded-full text-xs lg:text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors">
                                <CheckCircle className="w-4 h-4" fill="black" />
                                VERIFIED PROFILES
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="hidden lg:flex items-center justify-between">
                        <span className="text-xs text-white/60 uppercase tracking-widest font-semibold">
                            Production Ready Infrastructure
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <div className="w-2 h-2 rounded-full bg-white/30"></div>
                            <div className="w-2 h-2 rounded-full bg-white/30"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center p-6 sm:p-8 min-h-screen">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8 lg:mb-10 text-center">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2">
                            Welcome back
                        </h2>
                        <p className="text-indigo-700 text-xs sm:text-sm font-medium">
                            Sign in with your Google account to access NESMO
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
                        {/* Google Sign In Button */}
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
                            <span>Sign in with Google</span>
                        </button>

                        {/* Signup Link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-600 text-sm">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={onSwitchToSignup}
                                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                                >
                                    Sign up here
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-gray-500">
                        <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
