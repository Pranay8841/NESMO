import { LogIn, LogOut, Menu, X, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';

interface NavbarProps {
    onSignupClick?: () => void;
    onLoginClick?: () => void;
}

export default function Navbar({ onSignupClick, onLoginClick }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const handleSignupClick = () => {
        setIsMenuOpen(false); // Close mobile menu if open
        onSignupClick?.();
    };

    const handleLoginClick = () => {
        setIsMenuOpen(false); // Close mobile menu if open
        onLoginClick?.();
    };

    const handleLogout = () => {
        dispatch(logout());
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
    };

    const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';

    return (
        <>
            {/* Header */}
            <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6L10 3L16 6V10C16 13.5 13.5 16.5 10 17C6.5 16.5 4 13.5 4 10V6Z" fill="white" />
                            </svg>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-blue-600">NESMO</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                        <Link to="/about" className="text-gray-700 text-sm hover:text-gray-900 transition">About</Link>
                        <Link to="/" className="text-gray-700 text-sm hover:text-gray-900 transition">Directory</Link>
                        <Link to="/events" className="text-gray-700 text-sm hover:text-gray-900 transition">Events</Link>
                        <Link to="/contact" className="text-gray-700 text-sm hover:text-gray-900 transition">Contact</Link>
                    </nav>

                    {/* Auth Buttons - Desktop */}
                    <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {userInitials}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            My Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleLoginClick}
                                    className="px-3 sm:px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-50 transition flex items-center gap-1 sm:gap-2 cursor-pointer"
                                >
                                    <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Login</span>
                                </button>
                                <button
                                    onClick={handleSignupClick}
                                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition"
                                >
                                    Join Now
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <nav className="flex flex-col px-4 py-4 space-y-3">
                            <Link to="/about" className="text-gray-700 hover:text-gray-900 text-sm">About</Link>
                            <Link to="/" className="text-gray-700 hover:text-gray-900 text-sm">Directory</Link>
                            <Link to="/events" className="text-gray-700 hover:text-gray-900 text-sm">Events</Link>
                            <Link to="/contact" className="text-gray-700 hover:text-gray-900 text-sm">Contact</Link>
                            <div className="pt-2 border-t border-gray-200">
                                {user ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 py-2">
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {userInitials}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            My Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
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
