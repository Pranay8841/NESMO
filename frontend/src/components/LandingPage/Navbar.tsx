import { LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';

interface NavbarProps {
    onSignupClick?: () => void;
    onLoginClick?: () => void;
}

export default function Navbar({ onSignupClick, onLoginClick }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const { user } = useAppSelector((state) => state.auth);

    const handleSignupClick = () => {
        setIsMenuOpen(false); // Close mobile menu if open
        onSignupClick?.();
    };

    const handleLoginClick = () => {
        setIsMenuOpen(false); // Close mobile menu if open
        onLoginClick?.();
    };

    const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';
    
    // Get profile photo from user.profile (which can be populated object or just ID)
    const profilePhoto = user && typeof user.profile === 'object' ? user.profile.profilePhoto : null;

    // Display role based on user.role - show proper role hierarchy
    const getRoleDisplay = () => {
        if (!user) return 'Alumni';
        switch (user.role) {
            case 'ADMIN': return 'Admin';
            case 'EVENT_LEAD': return 'Event Lead';
            case 'MEMBER': return 'Member';
            default: return 'Alumni';
        }
    };

    return (
        <>            {/* Header */}
            <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 hover:opacity-80 transition">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5">
                                <path d="M4 6L10 3L16 6V10C16 13.5 13.5 16.5 10 17C6.5 16.5 4 13.5 4 10V6Z" fill="white" />
                            </svg>
                        </div>
                        <span className="text-sm sm:text-base md:text-lg font-bold text-blue-600">NESMO</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-4 md:gap-6 lg:gap-8">
                        <Link to="/" className="text-gray-700 text-xs md:text-sm hover:text-gray-900 transition">Home</Link>
                        <Link to="/about" className="text-gray-700 text-xs md:text-sm hover:text-gray-900 transition">About</Link>
                        <Link to="/directory" className="text-gray-700 text-xs md:text-sm hover:text-gray-900 transition">Directory</Link>
                    </nav>

                    {/* Auth Buttons - Desktop */}
                    <div className="hidden sm:flex items-center gap-1 sm:gap-2 md:gap-3">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-lg px-1.5 sm:px-2 py-1 transition"
                            >
                                <div className="text-right hidden md:block">
                                    <div className="text-xs md:text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                                    <div className="text-[10px] md:text-xs text-gray-500 uppercase">{getRoleDisplay()}</div>
                                </div>
                                {profilePhoto ? (
                                    <img 
                                        src={profilePhoto} 
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                        {userInitials}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <>
                                <button
                                    onClick={handleLoginClick}
                                    className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-blue-600 text-blue-600 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium hover:bg-blue-50 transition flex items-center gap-0.5 sm:gap-1 md:gap-2 cursor-pointer"
                                >
                                    <LogIn className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Login</span>
                                </button>
                                <button
                                    onClick={handleSignupClick}
                                    className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-[10px] sm:text-xs md:text-sm font-medium hover:bg-blue-700 transition"
                                >
                                    Join Now
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <nav className="flex flex-col px-3 sm:px-4 py-3 space-y-2.5">
                            <Link to="/" className="text-gray-700 hover:text-gray-900 text-sm" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/about" className="text-gray-700 hover:text-gray-900 text-sm" onClick={() => setIsMenuOpen(false)}>About</Link>
                            <Link to="/directory" className="text-gray-700 hover:text-gray-900 text-sm" onClick={() => setIsMenuOpen(false)}>Directory</Link>
                            <div className="pt-2 border-t border-gray-200">
                                {user ? (
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center gap-2 sm:gap-3 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {profilePhoto ? (
                                            <img 
                                                src={profilePhoto} 
                                                alt={`${user.firstName} ${user.lastName}`}
                                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {userInitials}
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-xs sm:text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">{getRoleDisplay()}</div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex gap-1.5 sm:gap-2">
                                        <button
                                            onClick={handleLoginClick}
                                            className="flex-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 cursor-pointer"
                                        >
                                            Login
                                        </button>
                                        <button
                                            onClick={handleSignupClick}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                                        >
                                            Join Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
}
