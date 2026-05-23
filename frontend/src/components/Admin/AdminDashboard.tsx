/**
 * @fileoverview Admin Dashboard Overview Component
 * Main dashboard view for administrators showing real stats, recent activity, and quick actions.
 * 
 * @module components/Admin/AdminDashboard
 */

import { useState, useEffect } from 'react';
import { 
    Users, 
    CreditCard, 
    LifeBuoy, 
    Newspaper, 
    Bell, 
    UserCheck, 
    Download, 
    Mail,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchDashboardStats } from '../../services/adminService';

/** Status badge color mapping */
const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Verified':
        case 'Success':
        case 'Active':
            return 'bg-green-50 text-green-600 border-green-100/50';
        case 'Emergency':
        case 'Failed':
            return 'bg-red-50 text-red-600 border-red-100/50';
        case 'Suspended':
            return 'bg-orange-50 text-orange-600 border-orange-100/50';
        case 'Pending':
            return 'bg-yellow-50 text-yellow-600 border-yellow-100/50';
        default:
            return 'bg-slate-50 text-slate-600 border-slate-100';
    }
};

/** Format timestamp to readable time */
const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
};

/** Format currency */
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export default function AdminDashboard() {
    const dispatch = useAppDispatch();
    const { dashboardStats, dashboardLoading } = useAppSelector((state) => state.admin);
    const [isSystemOnline] = useState(true);
    const [lastSync, setLastSync] = useState('Just now');

    // Fetch dashboard stats on mount
    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    // Update last sync time
    useEffect(() => {
        if (!dashboardLoading && dashboardStats) {
            setLastSync('Just now');
            const interval = setInterval(() => {
                setLastSync(prev => {
                    if (prev === 'Just now') return '1 min ago';
                    const mins = parseInt(prev) || 0;
                    return `${mins + 1} mins ago`;
                });
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [dashboardLoading, dashboardStats]);

    const handleRefresh = () => {
        dispatch(fetchDashboardStats());
        setLastSync('Just now');
    };

    // Build stats from real data
    const stats = dashboardStats ? [
        {
            title: 'Total Users',
            value: dashboardStats.users.total,
            icon: <Users className="w-5 h-5 text-blue-600" />,
            iconBg: 'bg-blue-50/80 border border-blue-100/50',
            change: dashboardStats.users.unverified > 0 ? `${dashboardStats.users.unverified} Unverified` : null,
            changeType: 'neutral' as const,
            subtitle: `${dashboardStats.users.byRole?.ALUMNI || 0} Alumni, ${dashboardStats.users.byRole?.MEMBER || 0} Members`
        },
        {
            title: 'Payment Volume',
            value: formatCurrency(dashboardStats.payments.totalAmount),
            icon: <CreditCard className="w-5 h-5 text-green-600" />,
            iconBg: 'bg-green-50/80 border border-green-100/50',
            change: dashboardStats.payments.byStatus?.SUCCESS 
                ? `${Math.round((dashboardStats.payments.byStatus.SUCCESS.count / Math.max(dashboardStats.payments.total, 1)) * 100)}% Success`
                : '0% Success',
            changeType: 'positive' as const,
            subtitle: `${dashboardStats.payments.total} transactions`
        },
        {
            title: 'Support Tickets',
            value: dashboardStats.tickets.open,
            icon: <LifeBuoy className="w-5 h-5 text-orange-650" />,
            iconBg: 'bg-orange-50/80 border border-orange-100/50',
            badge: dashboardStats.tickets.emergency > 0 
                ? { text: `${dashboardStats.tickets.emergency} Emergency`, color: 'bg-red-500' } 
                : null,
            subtitle: 'Active now'
        },
        {
            title: 'Published News',
            value: dashboardStats.news.published,
            icon: <Newspaper className="w-5 h-5 text-purple-600" />,
            iconBg: 'bg-purple-50/80 border border-purple-100/50',
            change: dashboardStats.news.draft > 0 ? `${dashboardStats.news.draft} Draft` : null,
            changeType: 'neutral' as const,
            subtitle: `${dashboardStats.news.total} total articles`
        }
    ] : [];

    const quickActions = [
        { icon: <Bell className="w-4 h-4" />, label: 'Broadcast Notification', color: 'text-blue-650 bg-blue-50 hover:bg-blue-100/80 border border-blue-100/30' },
        { icon: <UserCheck className="w-4 h-4" />, label: 'Moderate Pending Users', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100/80 border border-purple-100/30' },
        { icon: <Download className="w-4 h-4" />, label: 'Export Audit Log', color: 'text-green-650 bg-green-50 hover:bg-green-100/80 border border-green-100/30' },
        { icon: <Mail className="w-4 h-4" />, label: 'Email New Alumni', color: 'text-orange-650 bg-orange-50 hover:bg-orange-100/80 border border-orange-100/30' },
    ];

    // Loading state
    if (dashboardLoading && !dashboardStats) {
        return (
            <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-blue-650 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading dashboard stats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-8 sm:pb-12 px-3 sm:px-4 lg:px-6">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1 text-xs sm:text-sm">
                        Welcome back! Here's what's happening with the NESMO Portal today.
                    </p>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={dashboardLoading}
                    className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-350 disabled:opacity-50 transition-all w-full sm:w-auto justify-center sm:justify-start active:scale-98 shadow-sm"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${dashboardLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {stats.map((stat, index) => (
                    <div 
                        key={index}
                        className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stat.title}</span>
                                <div className={`w-9 h-9 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">{stat.value}</div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {stat.change && (
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${
                                    stat.changeType === 'positive' 
                                        ? 'bg-green-50 text-green-600 border-green-100/50' 
                                        : 'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                    {stat.change}
                                </span>
                            )}
                            {stat.badge && (
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg text-white ${stat.badge.color}`}>
                                    {stat.badge.text}
                                </span>
                            )}
                            {stat.subtitle && (
                                <span className="text-xs text-slate-400 font-semibold">{stat.subtitle}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity - Takes 2 columns */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-wider">Recent Activity</h2>
                            <button className="text-xs sm:text-sm font-bold text-blue-650 hover:text-blue-750 transition-colors">
                                View All
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-5 py-3">Timestamp</th>
                                        <th className="px-5 py-3">Event Type</th>
                                        <th className="px-5 py-3">User/Entity</th>
                                        <th className="px-5 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                                        dashboardStats.recentActivity.map((activity) => (
                                            <tr key={activity.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                                                    {formatTime(activity.timestamp)}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs font-bold text-slate-800">
                                                    {activity.eventType}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-650 font-semibold max-w-[200px] truncate">
                                                    {activity.userEntity}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${getStatusStyle(activity.status)}`}>
                                                        {activity.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-10 text-center text-slate-400 font-semibold text-sm">
                                                No recent activity found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column - Quick Actions & System Status */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 flex items-center justify-center text-amber-500">
                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">Quick Actions</h2>
                        </div>
                        <div className="space-y-2">
                            {quickActions.map((action, index) => (
                                <button 
                                    key={index}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${action.color}`}
                                >
                                    {action.icon}
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-850 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative flex h-2.5 w-2.5">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSystemOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSystemOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </div>
                            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-350">System Status</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 mb-4 font-medium leading-relaxed">
                            {isSystemOnline 
                                ? `All services are operational. Last sync: ${lastSync}.`
                                : 'Some system services are currently experiencing issues.'
                            }
                        </p>
                        <div className="w-full bg-slate-850 rounded-full h-1.5 overflow-hidden border border-slate-800">
                            <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    isSystemOnline ? 'bg-green-500 w-full' : 'bg-red-500 w-1/2'
                                }`}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
