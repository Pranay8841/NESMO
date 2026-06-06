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
import { Link } from 'react-router-dom';

/** Status badge color mapping */
const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Verified':
            return 'bg-green-100 text-green-700';
        case 'Success':
            return 'bg-green-100 text-green-700';
        case 'Emergency':
            return 'bg-red-100 text-red-700';
        case 'Active':
            return 'bg-blue-100 text-blue-700';
        case 'Suspended':
            return 'bg-orange-100 text-orange-700';
        case 'Pending':
            return 'bg-yellow-100 text-yellow-700';
        case 'Failed':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
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
            iconBg: 'bg-blue-100',
            change: dashboardStats.users.unverified > 0 ? `${dashboardStats.users.unverified} Unverified` : null,
            changeType: 'neutral' as const,
            subtitle: `${dashboardStats.users.byRole?.MEMBER || 0} Members, ${dashboardStats.users.byRole?.BATCH_REP || 0} Reps`,
            path: '/admin/users'
        },
        {
            title: 'Payment Volume',
            value: formatCurrency(dashboardStats.payments.totalAmount),
            icon: <CreditCard className="w-5 h-5 text-green-600" />,
            iconBg: 'bg-green-100',
            change: dashboardStats.payments.byStatus?.SUCCESS 
                ? `${Math.round((dashboardStats.payments.byStatus.SUCCESS.count / Math.max(dashboardStats.payments.total, 1)) * 100)}% Success`
                : '0% Success',
            changeType: 'positive' as const,
            subtitle: `${dashboardStats.payments.total} transactions`
        },
        {
            title: 'Support Tickets',
            value: dashboardStats.tickets.open,
            icon: <LifeBuoy className="w-5 h-5 text-orange-600" />,
            iconBg: 'bg-orange-100',
            badge: dashboardStats.tickets.emergency > 0 
                ? { text: `${dashboardStats.tickets.emergency} Emergency`, color: 'bg-red-500' } 
                : null,
            subtitle: 'Active now'
        },
        {
            title: 'Published News',
            value: dashboardStats.news.published,
            icon: <Newspaper className="w-5 h-5 text-purple-600" />,
            iconBg: 'bg-purple-100',
            change: dashboardStats.news.draft > 0 ? `${dashboardStats.news.draft} Draft` : null,
            changeType: 'neutral' as const,
            subtitle: `${dashboardStats.news.total} total articles`
        }
    ] : [];

    const quickActions = [
        { icon: <Bell className="w-5 h-5" />, label: 'Broadcast Notification', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
        { icon: <UserCheck className="w-5 h-5" />, label: 'Moderate Pending Users', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100', path: '/admin/users' },
        { icon: <Download className="w-5 h-5" />, label: 'Export Audit Log', color: 'text-green-600 bg-green-50 hover:bg-green-100' },
        { icon: <Mail className="w-5 h-5" />, label: 'Email New Alumni', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
    ];

    // Loading state
    if (dashboardLoading && !dashboardStats) {
        return (
            <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-8 sm:pb-12 px-2 sm:px-3 md:px-4">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard Overview</h1>
                    <p className="text-gray-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">
                        Welcome back, here's what's happening with the NESMO Portal today.
                    </p>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={dashboardLoading}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center sm:justify-start"
                >
                    <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${dashboardLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                    <span className="sm:hidden">Refresh</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {stats.map((stat, index) => {
                    const cardContent = (
                        <div className="bg-white h-full rounded-lg sm:rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <span className="text-xs sm:text-sm text-gray-500 font-medium">{stat.title}</span>
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.iconBg} rounded-lg flex items-center justify-center text-xs sm:text-sm`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">{stat.value}</div>
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                {stat.change && (
                                    <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded ${
                                        stat.changeType === 'positive' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {stat.change}
                                    </span>
                                )}
                                {stat.badge && (
                                    <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded text-white ${stat.badge.color}`}>
                                        {stat.badge.text}
                                    </span>
                                )}
                                {stat.subtitle && (
                                    <span className="text-[10px] sm:text-xs text-gray-400">{stat.subtitle}</span>
                                )}
                            </div>
                        </div>
                    );

                    if (stat.path) {
                        return (
                            <Link key={index} to={stat.path} className="block">
                                {cardContent}
                            </Link>
                        );
                    }

                    return (
                        <div key={index}>
                            {cardContent}
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity - Takes 2 columns */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                                    <th className="px-5 py-3">Timestamp</th>
                                    <th className="px-5 py-3">Event Type</th>
                                    <th className="px-5 py-3">User/Entity</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                                    dashboardStats.recentActivity.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 text-sm text-gray-500">
                                                {formatTime(activity.timestamp)}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                                {activity.eventType}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                                                {activity.userEntity}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(activity.status)}`}>
                                                    {activity.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                                            No recent activity found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column - Quick Actions & System Status */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 flex items-center justify-center text-yellow-500">
                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="space-y-2">
                            {quickActions.map((action, index) => {
                                const btn = (
                                    <button 
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${action.color}`}
                                    >
                                        {action.icon}
                                        {action.label}
                                    </button>
                                );
                                if (action.path) {
                                    return (
                                        <Link key={index} to={action.path} className="block w-full">
                                            {btn}
                                        </Link>
                                    );
                                }
                                return (
                                    <div key={index}>
                                        {btn}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-slate-800 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${isSystemOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide">System Status</h3>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">
                            {isSystemOnline 
                                ? `All systems are operational. Last sync: ${lastSync}.`
                                : 'Some services may be unavailable.'
                            }
                        </p>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    isSystemOnline ? 'bg-green-400 w-full' : 'bg-red-400 w-1/2'
                                }`}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
