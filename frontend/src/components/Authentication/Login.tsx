import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loginUser } from '../../services/authService';
import AuthLoading from './AuthLoading';
import VerifyEmailPrompt from './VerifyEmailPrompt';
import ForgotPassword from './ForgotPassword';

const backgroundImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIIuthEqIFJvMsr1O6clwVW6l7p5zYh3zKbWu_kdTxkqYJGfZwlnZaKhNXblwnWRoYSeiSEjmsi-u0NfEsOqBdPylHvS1KCXxpGbF8wpqaz8IJilF81WtaIv4U1yyAlVE_iSV7jHcWOuut8GF5MGnIH-nAq78XbzOYS1PFYay9OXrwLSe6Sk4eKgX0kLAOh2QFNgEBoVNU87rSaF8iSgFpXZxPXzutwwHqNMHBLEOHPMMYsROFDkGTu075tTQFbFvoWwwxC7Sx89OU';

interface LoginProps {
    onSuccess?: () => void;
    onSwitchToSignup?: () => void;
}

export default function App({ onSuccess, onSwitchToSignup }: LoginProps) {
    const dispatch = useAppDispatch();
    const { loading, pendingVerificationEmail } = useAppSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [stayLoggedIn, setStayLoggedIn] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsAuthenticating(true);
        const result = await dispatch(loginUser(formData));
        
        if (loginUser.fulfilled.match(result)) {
            // Login successful - token already saved in authService
            setIsAuthenticating(false);
            onSuccess?.();
        } else {
            setIsAuthenticating(false);
            // Check if error is due to unverified email
            const payload = result.payload as { code?: string; email?: string } | string;
            if (typeof payload === 'object' && payload?.code === 'EMAIL_NOT_VERIFIED') {
                setShowVerificationPrompt(true);
            }
        }
    };

    const handleGoogleLogin = async () => {
        setIsAuthenticating(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        try {
            // Pre-warm the backend (handles Render cold starts)
            await fetch(`${apiUrl}/health`, { method: 'GET' });
        } catch {
            // Ignore errors - proceed with redirect anyway
        }
        
        window.location.href = `${apiUrl}/auth/google`;
    };

    // Show full-screen loading when authenticating
    if (isAuthenticating) {
        return <AuthLoading message="Signing you in..." subMessage="Please wait while we verify your credentials." />;
    }

    // Show verification prompt if email not verified
    if (showVerificationPrompt || pendingVerificationEmail) {
        return (
            <VerifyEmailPrompt 
                email={pendingVerificationEmail || formData.email} 
                onBackToLogin={() => setShowVerificationPrompt(false)}
            />
        );
    }

    // Show forgot password screen
    if (showForgotPassword) {
        return (
            <ForgotPassword 
                onBackToLogin={() => setShowForgotPassword(false)}
            />
        );
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
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="lg:w-7 lg:h-7">
                                <path d="M14 3C14 3 8 7 8 13C8 16 10 19 14 19C18 19 20 16 20 13C20 7 14 3 14 3Z" fill="#0000FF" />
                                <path d="M14 19C14 19 10 21 10 25C10 26.5 11 28 14 28C17 28 18 26.5 18 25C18 21 14 19 14 19Z" fill="#0000FF" />
                            </svg>
                        </div>
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
                    <div className="mb-6 lg:mb-10 text-center">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">
                            Welcome back
                        </h2>
                        <p className="text-indigo-700 text-sm font-medium">
                            Enter your details to access your alumni account
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                        {/* Google Sign In Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-6 cursor-pointer"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05" />
                                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
                            </svg>
                            <span className="text-gray-900 font-bold text-sm">Sign in with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-white text-indigo-700 uppercase tracking-widest font-bold">
                                    Or sign in with email
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Email Address */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="name@jnv.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-sm font-bold text-gray-900">
                                        Password
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-sm font-bold text-blue-600 hover:underline cursor-pointer"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-gray-400 cursor-pointer" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400 cursor-pointer" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Stay Logged In */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="stayLoggedIn"
                                    checked={stayLoggedIn}
                                    onChange={(e) => setStayLoggedIn(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                                />
                                <label htmlFor="stayLoggedIn" className="text-sm text-gray-700 font-medium">
                                    Stay logged in
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <p className="text-center text-sm text-gray-600 mt-6">
                            Don't have an account?{' '}
                            <button 
                                type="button"
                                onClick={onSwitchToSignup}
                                className="text-blue-600 font-bold hover:underline cursor-pointer"
                            >
                                Create a new account
                            </button>
                        </p>
                    </div>

                    {/* Footer Links */}
                    <div className="flex items-center justify-center gap-6 mt-8">
                        <a href="#" className="text-xs text-indigo-400 hover:text-indigo-600 font-medium">
                            Help Center
                        </a>
                        <a href="#" className="text-xs text-indigo-400 hover:text-indigo-600 font-medium">
                            Terms of Service
                        </a>
                        <a href="#" className="text-xs text-indigo-400 hover:text-indigo-600 font-medium">
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
