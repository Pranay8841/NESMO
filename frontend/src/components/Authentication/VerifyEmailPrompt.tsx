import { useState } from 'react';
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { resendVerificationEmail } from '../../services/authService';
import { clearPendingVerification } from '../../redux/slices/authSlice';

interface VerifyEmailPromptProps {
    email?: string;
    onBackToLogin?: () => void;
}

export default function VerifyEmailPrompt({ email: propEmail, onBackToLogin }: VerifyEmailPromptProps) {
    const dispatch = useAppDispatch();
    const { pendingVerificationEmail, loading } = useAppSelector((state) => state.auth);
    
    const email = propEmail || pendingVerificationEmail;
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [resendSuccess, setResendSuccess] = useState(false);

    const handleResendEmail = async () => {
        if (!email || resendDisabled) return;

        setResendSuccess(false);
        const result = await dispatch(resendVerificationEmail(email));
        
        if (resendVerificationEmail.fulfilled.match(result)) {
            setResendSuccess(true);
            // Disable resend for 60 seconds
            setResendDisabled(true);
            setCountdown(60);
            
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    const handleBackToLogin = () => {
        dispatch(clearPendingVerification());
        onBackToLogin?.();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Icon */}
                    <div className="mb-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center">
                            <Mail className="w-10 h-10 text-indigo-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Verify Your Email
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 mb-2">
                        We've sent a verification link to:
                    </p>
                    {email && (
                        <p className="text-indigo-600 font-semibold mb-6 break-all">
                            {email}
                        </p>
                    )}

                    {/* Instructions */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
                        <ol className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                                <span>Open your email inbox</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                                <span>Look for an email from NESMO</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                                <span>Click the verification link</span>
                            </li>
                        </ol>
                    </div>

                    {/* Success Message */}
                    {resendSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-sm text-green-700">
                                Verification email sent successfully!
                            </p>
                        </div>
                    )}

                    {/* Resend Button */}
                    <button
                        onClick={handleResendEmail}
                        disabled={resendDisabled || loading || !email}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 mb-4
                            ${resendDisabled || loading
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Sending...
                            </>
                        ) : resendDisabled ? (
                            <>
                                <RefreshCw className="w-5 h-5" />
                                Resend in {countdown}s
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-5 h-5" />
                                Resend Verification Email
                            </>
                        )}
                    </button>

                    {/* Back to Login */}
                    <button
                        onClick={handleBackToLogin}
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>

                    {/* Help Text */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            Didn't receive the email? Check your spam folder or{' '}
                            <button 
                                onClick={handleResendEmail}
                                disabled={resendDisabled || loading}
                                className="text-indigo-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                            >
                                click here to resend
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    © {new Date().getFullYear()} NESMO Alumni Network. All rights reserved.
                </p>
            </div>
        </div>
    );
}
