import { User, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { registerUser } from '../../services/authService';
import type { RootState } from '../../redux/store';
import AuthLoading from './AuthLoading';

const backgroundImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDW4vPiCeZ4gsaK4aZaETJJ3s7KjcDPRsqa2pFP5nSuDlstKJ8fOPWpwRzXqrJcJ9GcoZ0oBUoNup6lHsLZtGCzhs371PlWmu2XmsCf6fzcEZPJNamEgpZ9D76ksuY4QRByODUcgXY98BJEZYBZRWwQgADiYxmWC-bwJIcUWeb9IOF5tcNWEMdznncRi4caQYg0w-3VkGp5SS9pk8WHk_8KDl5sGQLHpo6QZND5BEM-6tZ6if2Gmydi-43Bm1OGjW5akJnhYtm0txDb';

interface SignupProps {
    onSuccess?: () => void;
}

export default function App({ onSuccess }: SignupProps) {
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (!termsAccepted) {
            setError('Please accept the Terms of Service and Privacy Policy');
            return;
        }

        setIsAuthenticating(true);
        const result = await dispatch(registerUser(formData));
        
        if (registerUser.fulfilled.match(result)) {
            // Registration successful
            setIsAuthenticating(false);
            onSuccess?.();
        } else {
            setIsAuthenticating(false);
            setError(result.payload as string || 'Registration failed. Please try again.');
        }
    };

    const handleGoogleSignup = () => {
        setIsAuthenticating(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${apiUrl}/auth/google`;
    };

    // Show full-screen loading when authenticating
    if (isAuthenticating) {
        return <AuthLoading message="Creating your account..." subMessage="Please wait while we set up your profile." />;
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

                {/* Decorative Plant - Left Edge */}
                <div className="absolute left-0 top-0 bottom-0 w-12 overflow-hidden">
                    <svg viewBox="0 0 50 800" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0 Q15 50 10 100 Q5 150 10 200 Q15 250 10 300 Q5 350 10 400 Q15 450 10 500 Q5 550 10 600 Q15 650 10 700 Q5 750 10 800" stroke="#4A7C59" strokeWidth="3" fill="none" />
                        <ellipse cx="10" cy="30" rx="8" ry="12" fill="#5A8C69" opacity="0.7" />
                        <ellipse cx="15" cy="80" rx="10" ry="15" fill="#5A8C69" opacity="0.7" />
                        <ellipse cx="8" cy="130" rx="9" ry="13" fill="#5A8C69" opacity="0.7" />
                        <ellipse cx="12" cy="180" rx="8" ry="12" fill="#5A8C69" opacity="0.7" />
                        <ellipse cx="15" cy="230" rx="10" ry="14" fill="#5A8C69" opacity="0.7" />
                        <ellipse cx="10" cy="280" rx="8" ry="12" fill="#5A8C69" opacity="0.7" />
                        <ellipse cx="14" cy="330" rx="9" ry="13" fill="#5A8C69" opacity="0.7" />
                    </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-12 text-white w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-lg flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="lg:w-7 lg:h-7">
                                <path d="M14 2C14 2 8 6 8 12C8 15 10 18 14 18C18 18 20 15 20 12C20 6 14 2 14 2Z" fill="#4F46E5" />
                                <path d="M14 18C14 18 10 20 10 24C10 25.5 11 27 14 27C17 27 18 25.5 18 24C18 20 14 18 14 18Z" fill="#4F46E5" />
                            </svg>
                        </div>
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
                    <div className="mb-6 lg:mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Create an account
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <a href="#" className="text-blue-600 font-semibold hover:underline">
                                Log in here
                            </a>
                        </p>
                    </div>

                    {/* Google Sign Up Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignup}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-6 shadow-sm cursor-pointer"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                            <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                            <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05" />
                            <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
                        </svg>
                        <span className="text-gray-700 font-medium">Sign up with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-gray-50 text-gray-500 uppercase tracking-wider font-medium">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* First Name & Last Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* First Name */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2">
                                    First Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        id="firstName"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Last Name */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Last Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        id="lastName"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Address */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4 text-gray-400 cursor-pointer" />
                                    ) : (
                                        <Eye className="w-4 h-4 text-gray-400 cursor-pointer" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree to the{' '}
                                <a href="#" className="text-blue-600 font-semibold hover:underline">
                                    Terms of Service
                                </a>
                                {' '}and{' '}
                                <a href="#" className="text-blue-600 font-semibold hover:underline">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Shield className="w-4 h-4" />
                            <span>Secure SSL Encryption</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                            <a href="#" className="hover:text-blue-600">Help Center</a>
                            <a href="#" className="hover:text-blue-600">About NESMO</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
