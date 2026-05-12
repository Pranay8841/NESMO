import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';

const backgroundImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIIuthEqIFJvMsr1O6clwVW6l7p5zYh3zKbWu_kdTxkqYJGfZwlnZaKhNXblwnWRoYSeiSEjmsi-u0NfEsOqBdPylHvS1KCXxpGbF8wpqaz8IJilF81WtaIv4U1yyAlVE_iSV7jHcWOuut8GF5MGnIH-nAq78XbzOYS1PFYay9OXrwLSe6Sk4eKgX0kLAOh2QFNgEBoVNU87rSaF8iSgFpXZxPXzutwwHqNMHBLEOHPMMYsROFDkGTu075tTQFbFvoWwwxC7Sx89OU';

interface ForgotPasswordProps {
    onBackToLogin?: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        const result = await dispatch(forgotPassword(email));
        
        if (forgotPassword.fulfilled.match(result)) {
            setEmailSent(true);
        }
    };

    // Show success state after email is sent
    if (emailSent) {
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
                                Check Your<br />
                                Email
                            </h1>
                            <p className="text-sm lg:text-lg text-white/90 leading-relaxed mb-4 lg:mb-8">
                                We've sent you a password reset link. Follow the instructions in the email to reset your password.
                            </p>
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

                {/* Right Side - Success Message */}
                <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center p-6 sm:p-8 min-h-screen">
                    <div className="w-full max-w-md">
                        {/* Header */}
                        <div className="mb-4 sm:mb-6 lg:mb-10 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                <CheckCircle className="w-6 h-6 sm:w-10 sm:h-10 text-green-600" />
                            </div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2">
                                Check your email
                            </h2>
                            <p className="text-indigo-700 text-xs sm:text-sm font-medium">
                                We've sent a password reset link to
                            </p>
                            <p className="text-gray-900 font-bold mt-1 text-xs sm:text-sm break-all">
                                {email}
                            </p>
                        </div>

                        {/* Card */}
                        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
                            <div className="text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">
                                    Click the link in the email to reset your password. The link will expire in 1 hour.
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                                    Didn't receive the email? Check your spam folder or try again.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setEmailSent(false)}
                                    className="w-full py-2.5 sm:py-3.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base mb-3 sm:mb-4"
                                >
                                    Try again
                                </button>

                                <button
                                    type="button"
                                    onClick={onBackToLogin}
                                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline cursor-pointer text-xs sm:text-sm"
                                >
                                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Back to login
                                </button>
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="flex items-center justify-center gap-3 sm:gap-6 mt-4 sm:mt-8">
                            <a href="#" className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-600 font-medium">
                                Help Center
                            </a>
                            <a href="#" className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-600 font-medium">
                                Terms of Service
                            </a>
                            <a href="#" className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-600 font-medium">
                                Privacy Policy
                            </a>
                        </div>
                    </div>
                </div>
            </div>
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
                            Reset Your<br />
                            Password
                        </h1>
                        <p className="text-sm lg:text-lg text-white/90 leading-relaxed mb-4 lg:mb-8">
                            Don't worry! It happens to the best of us. Enter your email and we'll send you a reset link.
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                            <button className="px-3 lg:px-5 py-2 lg:py-2.5 bg-yellow-500 text-blue-900 rounded-full text-xs lg:text-sm font-bold flex items-center gap-2 hover:bg-yellow-400 transition-colors">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                                </svg>
                                SECURE RESET
                            </button>
                            <button className="px-3 lg:px-5 py-2 lg:py-2.5 bg-transparent border-2 border-white text-white rounded-full text-xs lg:text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors">
                                <CheckCircle className="w-4 h-4" fill="black" />
                                QUICK RECOVERY
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

            {/* Right Side - Forgot Password Form */}
            <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center p-6 sm:p-8 min-h-screen">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-4 sm:mb-6 lg:mb-10 text-center">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2">
                            Forgot password?
                        </h2>
                        <p className="text-indigo-700 text-xs sm:text-sm font-medium">
                            Enter your email and we'll send you a reset link
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
                        {/* Icon */}
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                            </div>
                        </div>

                        {/* Form */}
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Email Address */}
                            <div>
                                <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="name@jnv.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base text-gray-900 placeholder:text-gray-400"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 sm:py-3.5 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        {/* Back to Login Link */}
                        <div className="text-center mt-4 sm:mt-6">
                            <button
                                type="button"
                                onClick={onBackToLogin}
                                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline cursor-pointer text-xs sm:text-sm"
                            >
                                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                Back to login
                            </button>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 mt-4 sm:mt-8">
                        <a href="#" className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-600 font-medium">
                            Help Center
                        </a>
                        <a href="#" className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-600 font-medium">
                            Terms of Service
                        </a>
                        <a href="#" className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-600 font-medium">
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
