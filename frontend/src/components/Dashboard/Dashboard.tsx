import {
    Calendar, Ticket,
    ChevronRight, HelpCircle, Clock, MapPin, Sparkles,
    LifeBuoy, IdCard, Users
} from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';

export default function Dashboard() {
    const { user } = useAppSelector((state) => state.auth);

    // Derive user info
    const firstName = user?.firstName || 'User';
    const membershipStatus = user?.isMember ? 'MEMBER' : 'VISITOR';
    const isVerified = user?.isVerified || false;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex gap-6">
                {/* Left Column */}
                <div className="flex-1">
                    {/* Welcome Banner */}
                    <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="white" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold text-yellow-600 uppercase tracking-wide">
                                {membershipStatus} {isVerified && '• Verified'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">
                            Welcome back, {firstName}!
                        </h1>
                        <p className="text-gray-600 text-sm mb-6">
                            Great to see you again. Here's what's happening in your network.
                        </p>

                        {/* Profile Completeness */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Profile Completeness</div>
                                    <div className="text-xs text-gray-500">Complete your profile to unlock all features</div>
                                </div>
                                <div className="text-2xl font-black text-blue-600">50%</div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {/* Events Attended */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-3">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                Events Attended
                            </div>
                            <div className="text-3xl font-black text-gray-900">0</div>
                        </div>

                        {/* Membership Validity */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg mb-3">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                Membership Status
                            </div>
                            <div className="text-2xl font-black text-gray-900">{user?.isMember ? 'Active' : 'None'}</div>
                        </div>

                        {/* Active Help Tickets */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mb-3">
                                <Ticket className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                Active Help Tickets
                            </div>
                            <div className="text-3xl font-black text-gray-900">0</div>
                        </div>
                    </div>

                    {/* My Registered Events & Recommendations */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* My Registered Events */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-black text-gray-900">My Registered Events</h2>
                                </div>
                                <a href="#" className="text-sm font-bold text-blue-600 hover:underline">See My Calendar</a>
                            </div>

                            <div className="space-y-4">
                                {/* Event 1 */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-600 rounded-lg text-white shrink-0">
                                        <div className="text-xs font-bold uppercase">Nov</div>
                                        <div className="text-xl font-black">15</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">Global Navodayan Meet 2024</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                            <MapPin className="w-3 h-3" />
                                            Main Campus Auditorium
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Confirmed</span>
                                            <a href="#" className="text-xs font-bold text-blue-600 hover:underline">View Ticket</a>
                                        </div>
                                    </div>
                                </div>

                                {/* Event 2 */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-600 rounded-lg text-white shrink-0">
                                        <div className="text-xs font-bold uppercase">Dec</div>
                                        <div className="text-xl font-black">02</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">Tech Alumni Panel: AI Trends</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                            <MapPin className="w-3 h-3" />
                                            Digital Hall (Online)
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">Going</span>
                                            <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Join Link</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommended for You */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-yellow-500" />
                                    <h2 className="text-lg font-black text-gray-900">Recommended for You</h2>
                                </div>
                                <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Based on Profile</span>
                            </div>

                            <div className="space-y-4">
                                {/* Recommendation 1 */}
                                <div className="group cursor-pointer">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">Mentorship</span>
                                                <span className="text-xs text-green-600 font-semibold">• New match found</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-1">Senior Architect Role Mentorship</h3>
                                            <p className="text-xs text-gray-600">Connect with Sunil Kumar (Batch '98), Senior Principal at Google.</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0 ml-2" />
                                    </div>
                                </div>

                                {/* Recommendation 2 */}
                                <div className="group cursor-pointer">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded uppercase">Job Alert</span>
                                                <span className="text-xs text-gray-500 font-semibold">• Matches your skills</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-1">Tech Lead @ Global FinTech Corp</h3>
                                            <p className="text-xs text-gray-600">Posted by an Alumnus from JNV Lucknow. Internal referrals available.</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0 ml-2" />
                                    </div>
                                </div>
                            </div>

                            <a href="#" className="block text-center text-sm font-bold text-blue-600 hover:underline mt-4">
                                See All Recommendations
                            </a>
                        </div>
                    </div>

                    {/* Help Banner */}
                    <div className="bg-blue-50 rounded-xl p-6 mt-6 border border-blue-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                                    <HelpCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 mb-1">Need Help with Membership?</h3>
                                    <p className="text-sm text-gray-600">Contact our support desk for profile updates or status issues.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg font-bold text-sm hover:bg-gray-50">
                                    Support Docs
                                </button>
                                <button className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800">
                                    Contact Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Quick Actions */}
                <div className="hidden xl:block w-80">
                    <div className="sticky top-24">
                        <div className="bg-blue-600 rounded-xl p-6 text-white">
                            <h2 className="text-xl font-black mb-5">Quick Actions</h2>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <LifeBuoy className="w-5 h-5" />
                                        <span className="font-bold text-sm">New Help Ticket</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <IdCard className="w-5 h-5" />
                                        <span className="font-bold text-sm">Download ID Card</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5" />
                                        <span className="font-bold text-sm">Find a Mentor</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
