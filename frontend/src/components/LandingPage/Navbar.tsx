import { LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {/* Header */}
            <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6L10 3L16 6V10C16 13.5 13.5 16.5 10 17C6.5 16.5 4 13.5 4 10V6Z" fill="white" />
                            </svg>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-blue-600">NESMO</span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                        <a href="#" className="text-gray-700 text-sm hover:text-gray-900 transition">About</a>
                        <a href="#" className="text-gray-700 text-sm hover:text-gray-900 transition">Directory</a>
                        <a href="#" className="text-gray-700 text-sm hover:text-gray-900 transition">Events</a>
                        <a href="#" className="text-gray-700 text-sm hover:text-gray-900 transition">Helpline</a>
                    </nav>

                    {/* Auth Buttons - Desktop */}
                    <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                        <button className="px-3 sm:px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-50 transition flex items-center gap-1 sm:gap-2">
                            <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Login</span>
                        </button>
                        <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition">
                            Join Now
                        </button>
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
                            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">About</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Directory</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Events</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Helpline</a>
                            <div className="flex gap-2 pt-2 border-t border-gray-200">
                                <button className="flex-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50">
                                    Login
                                </button>
                                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                                    Join Now
                                </button>
                            </div>
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
}
