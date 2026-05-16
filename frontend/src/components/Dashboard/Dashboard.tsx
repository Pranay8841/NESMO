import {
    // V1 Release: Commenting out icons not used in first release
    // Calendar, Ticket,
    // ChevronRight, HelpCircle, Clock, MapPin, Sparkles,
    // LifeBuoy, IdCard, Users
    Users, ChevronRight
} from 'lucide-react';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { Link } from 'react-router-dom';
import { fetchProfileCompleteness } from '../../services/profileService';
import AdminDashboard from '../Admin/AdminDashboard';

export default function Dashboard() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { completeness } = useAppSelector((state) => state.profile);

    // Fetch profile completeness on mount
    useEffect(() => {
        dispatch(fetchProfileCompleteness());
    }, [dispatch]);

    // If user is admin, show Admin Dashboard
    if (user?.role === 'ADMIN') {
        return <AdminDashboard />;
    }

    // Derive user info
    const firstName = user?.firstName || 'User';
    // Display role based on user.role - show proper role hierarchy with styling
    const roleConfig: Record<string, { label: string; bgColor: string }> = {
        ADMIN: { label: 'Admin', bgColor: 'bg-red-500' },
        EVENT_LEAD: { label: 'Event Lead', bgColor: 'bg-purple-500' },
        MEMBER: { label: 'Member', bgColor: 'bg-blue-500' },
        ALUMNI: { label: 'Alumni', bgColor: 'bg-gray-500' },
    };
    const roleInfo = roleConfig[user?.role || 'ALUMNI'] || roleConfig.ALUMNI;
    const profileCompleteness = completeness || 0;

    return (
        <div className="max-w-7xl mx-auto pb-6 sm:pb-8 px-2 sm:px-0">
            <div className="flex gap-3 sm:gap-6 flex-col lg:flex-row">
                {/* Left Column */}
                <div className="flex-1">
                    {/* Welcome Banner */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <span className={`px-2 sm:px-3 py-1 ${roleInfo.bgColor} text-white text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider`}>
                                {roleInfo.label}
                            </span>
                        </div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-gray-900 mb-1 sm:mb-2">
                            Welcome back, {firstName}!
                        </h1>
                        <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
                            Great to see you again. Here's what's happening in your network.
                        </p>

                        {/* Profile Completeness */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="text-xs sm:text-sm font-bold text-gray-900">Profile Completeness</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">Complete your profile to unlock all features</div>
                                </div>
                                <div className="text-lg sm:text-2xl font-black text-blue-600">{profileCompleteness}%</div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${profileCompleteness}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* V1 Release: Quick Action Cards instead of Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        {/* Update Profile Card */}
                        <Link to="/profile" className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg mb-3 sm:mb-4">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full"></div>
                                </div>
                            </div>
                            <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Update Your Profile</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                Complete your profile to help other alumni find and connect with you.
                            </p>
                            <span className="text-xs sm:text-sm font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                                Edit Profile <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </span>
                        </Link>

                        {/* Browse Directory Card */}
                        <Link to="/directory" className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg mb-3 sm:mb-4">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                            <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Browse Alumni Directory</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                Discover and connect with fellow Navodayans from across the network.
                            </p>
                            <span className="text-xs sm:text-sm font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                                View Directory <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </span>
                        </Link>
                    </div>

                    {/* V1 Release: Info Banner */}
                    <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-blue-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-6 sm:h-6">
                                    <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">Welcome to NESMO Alumni Network!</h3>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    This is the first release of our platform. More features like events, membership benefits, 
                                    and mentorship programs are coming soon. For now, update your profile and explore the alumni directory!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* V1 Release: Commented out sections for future releases */}
                    {/* 
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-3">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                Events Attended
                            </div>
                            <div className="text-3xl font-black text-gray-900">0</div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg mb-3">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                Membership Status
                            </div>
                            <div className="text-2xl font-black text-gray-900">{user?.isMember ? 'Active' : 'None'}</div>
                        </div>
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

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-black text-gray-900">My Registered Events</h2>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-yellow-500" />
                                    <h2 className="text-lg font-black text-gray-900">Recommended for You</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 mt-6 border border-blue-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                                    <HelpCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 mb-1">Need Help?</h3>
                                    <p className="text-sm text-gray-600">Contact support</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    */}
                </div>

                {/* V1 Release: Commented out Right Sidebar - Quick Actions */}
                {/*
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
                */}
            </div>
        </div>
    );
}