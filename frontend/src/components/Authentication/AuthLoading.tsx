import { type JSX } from 'react';

interface AuthLoadingProps {
    message?: string;
    subMessage?: string;
}

export default function AuthLoading({ 
    message = 'Authenticating...', 
    subMessage = 'Please wait while we verify your credentials.' 
}: AuthLoadingProps): JSX.Element {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700">{message}</h2>
                <p className="text-gray-500 mt-2">{subMessage}</p>
            </div>
        </div>
    );
}
