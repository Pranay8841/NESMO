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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
                <p className="text-gray-500 mt-2">{subMessage}</p>
            </div>
        </div>
    );
}
