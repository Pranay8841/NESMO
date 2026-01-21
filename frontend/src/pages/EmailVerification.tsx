import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAppDispatch } from '../redux/hooks';
import { verifyEmail } from '../services/authService';

export default function EmailVerification() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    const [status, setStatus] = useState<'verifying' | 'success' | 'already-verified' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const hasVerified = useRef(false); // Prevent double verification in StrictMode

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('No verification token provided.');
            return;
        }

        // Prevent double verification call in React StrictMode
        if (hasVerified.current) {
            return;
        }
        hasVerified.current = true;

        const verify = async () => {
            const result = await dispatch(verifyEmail(token));
            
            if (verifyEmail.fulfilled.match(result)) {
                setStatus('success');
            } else {
                const payload = result.payload as { message?: string; code?: string } | string;
                const message = typeof payload === 'object' ? payload.message : payload;
                
                // Check if the link was already used (email likely already verified)
                if (message?.includes('already been used') || message?.includes('already verified')) {
                    setStatus('already-verified');
                } else {
                    setStatus('error');
                    setErrorMessage(message || 'Verification failed. Please try again.');
                }
            }
        };

        verify();
    }, [token, dispatch]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Logo */}
                    <div className="mb-6">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Verifying State */}
                    {status === 'verifying' && (
                        <>
                            <div className="mb-6">
                                <Loader2 className="w-12 h-12 mx-auto text-indigo-600 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifying Your Email
                            </h1>
                            <p className="text-gray-600">
                                Please wait while we verify your email address...
                            </p>
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
                                Email Verified!
                            </h1>
                            <p className="text-gray-600 mb-8">
                                Your email has been verified successfully. You can now log in to your account.
                            </p>
                            <button
                                onClick={() => navigate('/?openLogin=true')}
                                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Continue to Login
                            </button>
                        </>
                    )}

                    {/* Already Verified State */}
                    {status === 'already-verified' && (
                        <>
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-blue-600" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Already Verified
                            </h1>
                            <p className="text-gray-600 mb-8">
                                Your email has already been verified. You can proceed to log in to your account.
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
                                Verification Failed
                            </h1>
                            <p className="text-gray-600 mb-4">
                                {errorMessage || 'The verification link is invalid or has expired.'}
                            </p>
                            <p className="text-sm text-gray-500 mb-8">
                                Please request a new verification email from the login page.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/?openLogin=true')}
                                    className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Go to Login
                                </button>
                                <button
                                    onClick={() => navigate('/?openSignup=true')}
                                    className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                                >
                                    Create New Account
                                </button>
                            </div>
                        </>
                    )}

                    {/* Back Link */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 mt-6 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    © {new Date().getFullYear()} NESMO Alumni Network. All rights reserved.
                </p>
            </div>
        </div>
    );
}
