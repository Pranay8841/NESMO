"use client";

import { useState } from 'react';
import { Mail, MapPin, Phone, Twitter, Github, Linkedin, Instagram, CircleCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import nesmoLogo from '../../assets/nesmo-logo-transperant.png';
import { subscribeToNewsletter } from '../../services/newsletterService';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle newsletter subscription
   */
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await subscribeToNewsletter(email);
      setEmail(''); // Clear input on success
    } catch (error) {
      // Error toast is already handled in the service
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

    return (
        <>
            {/* Newsletter Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
                <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm p-6 sm:p-8 lg:p-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                        <div className="max-w-lg">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                                Stay Connected with NESMO
                            </h2>
                            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                                Subscribe to our newsletter for the latest alumni success stories, upcoming reunions, and community updates.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-72 lg:w-80">
                                    <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap text-xs sm:text-sm w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                                >
                                    {isLoading ? 'Subscribing...' : 'Subscribe'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row gap-12 sm:gap-16 lg:gap-20 mb-8 sm:mb-12">
                    {/* Left Section - Brand */}
                    <div className="shrink-0 lg:w-1/4">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <img src={nesmoLogo} alt="NESMO" className="w-8 h-8 sm:w-10 sm:h-10" />
                            <span className="text-lg sm:text-xl font-bold text-gray-900">NESMO</span>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-5">
                            Connecting Navodaya alumni for a lifetime of support, growth, and giving back. Together we build a legacy that transcends generations.
                        </p>
                        <div className="flex items-center gap-2 mb-3 sm:mb-5">
                            <CircleCheck className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 uppercase">
                                Authorized NGO Reg. No. 12345/GOI
                            </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                            </a>
                            <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                            </a>
                            <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                            </a>
                            <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                            </a>
                        </div>
                    </div>

                    {/* Right Section - 3 Columns */}
                    <div className="grow grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                        {/* Column 1 - Quick Links */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wide">
                                Quick Links
                            </h3>
                            <ul className="space-y-2 sm:space-y-3">
                                <li>
                                    <a href="#" className="text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors flex items-center">
                                        <span className="mr-2">•</span>
                                        Alumni Directory
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors flex items-center">
                                        <span className="mr-2">•</span>
                                        Upcoming Events
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors flex items-center">
                                        <span className="mr-2">•</span>
                                        News & Stories
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors flex items-center">
                                        <span className="mr-2">•</span>
                                        Help Center / FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 2 - Contact Us */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wide">
                                Contact Us
                            </h3>
                            <ul className="space-y-3 sm:space-y-4">
                                <li className="flex items-start gap-2 sm:gap-3">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                        123 Alumni Road, Connaught Place,<br />
                                        New Delhi, India 110001
                                    </div>
                                </li>
                                <li className="flex items-start gap-2 sm:gap-3">
                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <a href="mailto:contact@nesmo.org" className="text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors">
                                        contact@nesmo.org
                                    </a>
                                </li>
                                <li className="flex items-start gap-2 sm:gap-3">
                                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <a href="tel:+919876543210" className="text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors">
                                        +91 98765 43210
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3 - Legal */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wide">
                                Legal
                            </h3>
                            <ul className="space-y-2 sm:space-y-3">
                                <li>
                                    <a href="#" className="text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors">
                                        Terms of Service
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors">
                                        Refund Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors">
                                        Bylaws & Constitution
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 sm:pt-8 border-t border-gray-300">
                    <p className="text-gray-600 text-xs sm:text-sm text-center">
                        © 2023 NESMO. All rights reserved. Empowering Alumni Since 1988
                    </p>
                </div>
            </div>
        </>
    );
}