import { useSearchParams, Link } from 'react-router-dom';

export default function OAuthError() {
    const [searchParams] = useSearchParams();
    const message = searchParams.get('message') || 'Authentication failed';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md px-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
