import { Users, ChevronRight } from 'lucide-react';
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
        ADMIN: { label: 'Admin', bgColor: 'bg-red-505' },
        EVENT_LEAD: { label: 'Event Lead', bgColor: 'bg-purple-500' },
        MEMBER: { label: 'Member', bgColor: 'bg-blue-500' },
        ALUMNI: { label: 'Alumni', bgColor: 'bg-gray-500' },
    };
    const roleInfo = roleConfig[user?.role || 'ALUMNI'] || roleConfig.ALUMNI;
    const profileCompleteness = completeness || 0;

    return (
        <div className="max-w-7xl mx-auto pb-8 sm:pb-12 px-3 sm:px-4 lg:px-6">
            <div className="flex gap-6 flex-col lg:flex-row">
                {/* Left Column */}
                <div className="flex-1">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 rounded-2xl p-6 sm:p-8 mb-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                        {/* Decorative Light Rays */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2.5 py-0.5 ${roleInfo.bgColor} text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider`}>
                                    {roleInfo.label}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-white mb-2">
                                Welcome back, {firstName}!
                            </h1>
                            <p className="text-slate-350 text-xs sm:text-sm mb-6 max-w-xl">
                                Great to see you again. Explore updates, connect with alumni, and stay active in your network.
                            </p>

                            {/* Profile Completeness */}
                            <div className="bg-slate-850/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl max-w-md">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="text-xs sm:text-sm font-bold text-white">Profile Completeness</div>
                                        <div className="text-[10px] text-slate-400">Complete your profile to unlock all features</div>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-black text-amber-400">{profileCompleteness}%</div>
                                </div>
                                <div className="w-full bg-slate-800/80 rounded-full h-2 border border-slate-700/50 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500 shadow-inner" 
                                        style={{ width: `${profileCompleteness}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                        {/* Update Profile Card */}
                        <Link to="/profile" className="bg-white rounded-2xl p-6 border border-slate-200/60 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-300 group flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl mb-4 group-hover:scale-105 transition-transform">
                                    <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    </div>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1.5">Update Your Profile</h3>
                                <p className="text-xs sm:text-sm text-slate-500 mb-4">
                                    Complete your profile details, occupation, and location to help alumni find you.
                                </p>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-blue-600 group-hover:text-blue-750 flex items-center gap-1">
                                Edit Profile <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </Link>

                        {/* Browse Directory Card */}
                        <Link to="/directory" className="bg-white rounded-2xl p-6 border border-slate-200/60 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-300 group flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-center w-12 h-12 bg-green-50 border border-green-100 rounded-xl mb-4 group-hover:scale-105 transition-transform">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1.5">Browse Alumni Directory</h3>
                                <p className="text-xs sm:text-sm text-slate-500 mb-4">
                                    Discover and connect with fellow Navodayans from across the global network.
                                </p>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-blue-600 group-hover:text-blue-750 flex items-center gap-1">
                                View Directory <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </Link>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50/50 rounded-2xl p-5 sm:p-6 border border-blue-100/60 shadow-sm shadow-blue-100/10">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shrink-0 shadow-sm shadow-blue-500/20">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                    <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-0.5">Welcome to NESMO Alumni Network!</h3>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                    This is the first release of our platform. More features like events, membership benefits, 
                                    and mentorship programs are coming soon. For now, update your profile and explore the alumni directory!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}