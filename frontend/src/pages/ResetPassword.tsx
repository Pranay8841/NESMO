import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, XCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { resetPassword } from '../services/authService';

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.auth);
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!password) {
            setErrorMessage('Please enter a new password');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        if (!token) {
            setStatus('error');
            setErrorMessage('Invalid reset link. Please request a new password reset.');
            return;
        }

        const result = await dispatch(resetPassword({ token, password }));
        
        if (resetPassword.fulfilled.match(result)) {
            setStatus('success');
        } else {
            const payload = result.payload as { message?: string; code?: string } | string;
            const message = typeof payload === 'object' ? payload.message : payload;
            setStatus('error');
            setErrorMessage(message || 'Password reset failed. Please try again.');
        }
    };

    // Clear error when user types
    useEffect(() => {
        if (errorMessage && (password || confirmPassword)) {
            setErrorMessage('');
        }
    }, [password, confirmPassword]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Logo */}
                    <div className="mb-6">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Form State */}
                    {status === 'form' && (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Create New Password
                            </h1>
                            <p className="text-gray-600 mb-8">
                                Enter your new password below. Make sure it's at least 6 characters long.
                            </p>

                            <form className="space-y-5 text-left" onSubmit={handleSubmit}>
                                {/* New Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5 text-gray-400 cursor-pointer" />
                                            ) : (
                                                <Eye className="w-5 h-5 text-gray-400 cursor-pointer" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {errorMessage && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Resetting Password...' : 'Reset Password'}
                                </button>
                            </form>

                            {/* Back to Login Link */}
                            <div className="mt-6">
                                <Link
                                    to="/?openLogin=true"
                                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to login
                                </Link>
                            </div>
                        </>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <>
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Password Reset!
                            </h1>
                            <p className="text-gray-600 mb-8">
                                Your password has been reset successfully. You can now log in with your new password.
                            </p>
                            <button
                                onClick={() => navigate('/?openLogin=true')}
                                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Continue to Login
                            </button>
                        </>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <>
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="w-10 h-10 text-red-600" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Reset Failed
                            </h1>
                            <p className="text-gray-600 mb-4">
                                {errorMessage || 'The password reset link is invalid or has expired.'}
                            </p>
                            <p className="text-sm text-gray-500 mb-8">
                                Please request a new password reset link.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/?openLogin=true')}
                                    className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Go to Login
                                </button>
                                <button
                                    onClick={() => {
                                        setStatus('form');
                                        setErrorMessage('');
                                    }}
                                    className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                                >
                                    Try Again
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} NESMO Alumni Network. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
