import { X } from 'lucide-react';
import { type JSX, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onOpenSignup?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess, onOpenSignup }: LoginModalProps): JSX.Element | null {
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        if (onSuccess) {
            onSuccess();
        } else {
            onClose();
            navigate('/dashboard');
        }
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative z-10 w-full max-w-2xl sm:max-w-3xl lg:max-w-5xl max-h-[85vh] sm:max-h-[90vh] mx-2 sm:mx-4 overflow-hidden rounded-lg sm:rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors cursor-pointer"
                    aria-label="Close modal"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>

                {/* Login Component */}
                <div className="max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
                    <Login onSuccess={handleLoginSuccess} onSwitchToSignup={onOpenSignup} />
                </div>
            </div>
        </div>
    );
}
