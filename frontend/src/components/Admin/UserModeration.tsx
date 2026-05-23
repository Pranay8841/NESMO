/**
 * @fileoverview User Moderation Page
 * Admin page for managing users - view, filter, block/unblock, change roles, verify emails.
 * 
 * @module components/Admin/UserModeration
 */

import { useEffect, useState, useCallback } from 'react';
import { 
    Users, 
    Search, 
    Filter, 
    Shield, 
    ShieldOff, 
    CheckCircle, 
    XCircle,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    UserCog,
    Mail,
    Ban,
    Unlock,
    Eye,
    RefreshCw,
    X
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { 
    fetchAllUsers, 
    blockUser, 
    unblockUser, 
    updateUserRole, 
    verifyUserEmail,
    type UserFilterParams 
} from '../../services/adminService';
import { getProfilePhotoUrl } from '../../utils/avatarHelper';
import type { AdminUser } from '../../redux/slices/adminSlice';

/** Role configuration for display */
const roleConfig: Record<string, { label: string; color: string; bgColor: string; border: string }> = {
    ALUMNI: { label: 'Alumni', color: 'text-blue-600', bgColor: 'bg-blue-50', border: 'border-blue-100/50' },
    MEMBER: { label: 'Member', color: 'text-green-600', bgColor: 'bg-green-50', border: 'border-green-100/50' },
    EVENT_LEAD: { label: 'Event Lead', color: 'text-purple-600', bgColor: 'bg-purple-50', border: 'border-purple-100/50' },
    ADMIN: { label: 'Admin', color: 'text-red-600', bgColor: 'bg-red-50', border: 'border-red-100/50' },
};

/** Status configuration for display */
const statusConfig: Record<string, { label: string; color: string; bgColor: string; border: string }> = {
    ACTIVE: { label: 'Active', color: 'text-green-600', bgColor: 'bg-green-50', border: 'border-green-100/50' },
    BLOCKED: { label: 'Blocked', color: 'text-red-650', bgColor: 'bg-red-50', border: 'border-red-100/50' },
};

const UserModeration = () => {
    const dispatch = useAppDispatch();
    const { users } = useAppSelector(state => state.admin);
    const currentUser = useAppSelector(state => state.auth.user);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'active' | 'blocked' | ''>('');
    const [roleFilter, setRoleFilter] = useState<'ALUMNI' | 'MEMBER' | 'EVENT_LEAD' | 'ADMIN' | ''>('');
    const [verifiedFilter, setVerifiedFilter] = useState<'true' | 'false' | ''>('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Modal states
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [blockReason, setBlockReason] = useState('');
    const [newRole, setNewRole] = useState<'ALUMNI' | 'MEMBER' | 'EVENT_LEAD' | 'ADMIN'>('ALUMNI');
    
    // Dropdown state
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    /**
     * Build filter params for API call
     */
    const buildFilterParams = useCallback((): UserFilterParams => {
        const params: UserFilterParams = { page: users.page, limit: 20 };
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;
        if (roleFilter) params.role = roleFilter;
        if (verifiedFilter) params.verified = verifiedFilter;
        return params;
    }, [searchTerm, statusFilter, roleFilter, verifiedFilter, users.page]);

    /**
     * Fetch users with current filters
     */
    const loadUsers = useCallback((page = 1) => {
        const params = buildFilterParams();
        params.page = page;
        dispatch(fetchAllUsers(params));
    }, [dispatch, buildFilterParams]);

    // Initial load
    useEffect(() => {
        loadUsers(1);
    }, []);

    // Reload when filters change (debounced for search)
    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers(1);
        }, searchTerm ? 500 : 0);
        return () => clearTimeout(timer);
    }, [statusFilter, roleFilter, verifiedFilter, searchTerm]);

    /**
     * Handle page change
     */
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= users.pages) {
            loadUsers(newPage);
        }
    };

    /**
     * Handle block user action
     */
    const handleBlockUser = async () => {
        if (!selectedUser || !blockReason.trim()) return;
        await dispatch(blockUser({ userId: selectedUser._id, reason: blockReason }));
        setShowBlockModal(false);
        setSelectedUser(null);
        setBlockReason('');
    };

    /**
     * Handle unblock user action
     */
    const handleUnblockUser = async (user: AdminUser) => {
        await dispatch(unblockUser(user._id));
        setOpenDropdown(null);
    };

    /**
     * Handle role change action
     */
    const handleRoleChange = async () => {
        if (!selectedUser) return;
        await dispatch(updateUserRole({ userId: selectedUser._id, role: newRole }));
        setShowRoleModal(false);
        setSelectedUser(null);
    };

    /**
     * Handle verify email action
     */
    const handleVerifyEmail = async (user: AdminUser) => {
        await dispatch(verifyUserEmail(user._id));
        setOpenDropdown(null);
    };

    /**
     * Open block modal
     */
    const openBlockModal = (user: AdminUser) => {
        setSelectedUser(user);
        setBlockReason('');
        setShowBlockModal(true);
        setOpenDropdown(null);
    };

    /**
     * Open role change modal
     */
    const openRoleModal = (user: AdminUser) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowRoleModal(true);
        setOpenDropdown(null);
    };

    /**
     * Open user detail modal
     */
    const openUserDetail = (user: AdminUser) => {
        setSelectedUser(user);
        setShowUserDetail(true);
        setOpenDropdown(null);
    };

    /**
     * Clear all filters
     */
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setRoleFilter('');
        setVerifiedFilter('');
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    /**
     * Get user avatar URL
     */
    const getAvatarUrl = (user: AdminUser) => {
        return getProfilePhotoUrl(user.profile?.profilePhoto, user.firstName, user.lastName);
    };

    return (
        <div className="max-w-7xl mx-auto pb-8 sm:pb-12 px-3 sm:px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl mt-0.5">
                            <Users className="w-5.5 h-5.5 text-indigo-650" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">User Moderation</h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage user credentials, active roles, and account permissions.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => loadUsers(users.page)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-650 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl transition-all shadow-sm active:scale-98 w-full sm:w-auto justify-center"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 text-slate-700 placeholder:text-slate-400 transition-all"
                        />
                    </div>
                    
                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl font-bold transition-all text-xs sm:text-sm cursor-pointer active:scale-98 ${
                            showFilters || statusFilter || roleFilter || verifiedFilter
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                        {(statusFilter || roleFilter || verifiedFilter) && (
                            <span className="px-2 py-0.5 text-[10px] bg-indigo-600 text-white rounded-full font-black">
                                {[statusFilter, roleFilter, verifiedFilter].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 focus:outline-none text-sm text-slate-700 transition-all bg-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>
                        
                        {/* Role Filter */}
                        <div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">Role</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as any)}
                                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 focus:outline-none text-sm text-slate-700 transition-all bg-white"
                            >
                                <option value="">All Roles</option>
                                <option value="ALUMNI">Alumni</option>
                                <option value="MEMBER">Member</option>
                                <option value="EVENT_LEAD">Event Lead</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        
                        {/* Verified Filter */}
                        <div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">Email Verification</label>
                            <select
                                value={verifiedFilter}
                                onChange={(e) => setVerifiedFilter(e.target.value as any)}
                                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 focus:outline-none text-sm text-slate-700 transition-all bg-white"
                            >
                                <option value="">All</option>
                                <option value="true">Verified</option>
                                <option value="false">Unverified</option>
                            </select>
                        </div>
                        
                        {/* Clear Filters */}
                        {(statusFilter || roleFilter || verifiedFilter) && (
                            <div className="md:col-span-3 flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {users.loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-indigo-600"></div>
                    </div>
                ) : users.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 px-4">
                        <Users className="w-12 h-12 mb-4 opacity-30 text-slate-400" />
                        <p className="text-base font-bold text-slate-800">No users found</p>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                <thead className="bg-slate-50/50 border-b border-slate-200">
                                    <tr className="text-left text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                                        <th className="px-6 py-3.5">User</th>
                                        <th className="px-6 py-3.5">Role</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5">Verified</th>
                                        <th className="px-6 py-3.5">Joined</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.data.map((user) => (
                                        <tr key={user._id} className="hover:bg-slate-50/20 transition-colors">
                                            {/* User Info */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getAvatarUrl(user)}
                                                        alt={`${user.firstName} ${user.lastName}`}
                                                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-slate-100"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-xs sm:text-sm">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-medium">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* Role */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${roleConfig[user.role]?.bgColor} ${roleConfig[user.role]?.color} ${roleConfig[user.role]?.border}`}>
                                                    {roleConfig[user.role]?.label || user.role}
                                                </span>
                                            </td>
                                            
                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${statusConfig[user.status]?.bgColor} ${statusConfig[user.status]?.color} ${statusConfig[user.status]?.border}`}>
                                                    {user.status === 'ACTIVE' ? (
                                                        <Shield className="w-3 h-3 shrink-0" />
                                                    ) : (
                                                        <ShieldOff className="w-3 h-3 shrink-0" />
                                                    )}
                                                    <span>{statusConfig[user.status]?.label || user.status}</span>
                                                </span>
                                            </td>
                                            
                                            {/* Email Verified */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.isEmailVerified ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                                                        <CheckCircle className="w-4 h-4 shrink-0" />
                                                        <span>Verified</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
                                                        <XCircle className="w-4 h-4 shrink-0" />
                                                        <span>Not Verified</span>
                                                    </span>
                                                )}
                                            </td>
                                            
                                            {/* Joined Date */}
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            
                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={() => setOpenDropdown(openDropdown === user._id ? null : user._id)}
                                                        className="p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer active:scale-95 border border-transparent hover:border-slate-200"
                                                    >
                                                        <MoreVertical className="w-4 h-4 text-slate-500" />
                                                    </button>
                                                    
                                                    {/* Dropdown Menu */}
                                                    {openDropdown === user._id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200/60 py-1.5 z-55 text-left transform origin-top-right transition-all">
                                                            <button
                                                                onClick={() => openUserDetail(user)}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                                                            >
                                                                <Eye className="w-4 h-4 text-slate-400" />
                                                                <span>View Details</span>
                                                            </button>
                                                            
                                                            <button
                                                                onClick={() => openRoleModal(user)}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                                                                disabled={user._id === currentUser?._id}
                                                            >
                                                                <UserCog className="w-4 h-4 text-slate-400" />
                                                                <span>Change Role</span>
                                                            </button>
                                                            
                                                            {!user.isEmailVerified && (
                                                                <button
                                                                    onClick={() => handleVerifyEmail(user)}
                                                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                                                                >
                                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                                    <span>Verify Email</span>
                                                                </button>
                                                            )}
                                                            
                                                            <div className="border-t border-slate-100 my-1"></div>
                                                            
                                                            {user.status === 'ACTIVE' ? (
                                                                <button
                                                                    onClick={() => openBlockModal(user)}
                                                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 font-bold cursor-pointer"
                                                                    disabled={user.role === 'ADMIN' || user._id === currentUser?._id}
                                                                >
                                                                    <Ban className="w-4 h-4" />
                                                                    <span>Block User</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleUnblockUser(user)}
                                                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-green-600 hover:bg-green-50 font-bold cursor-pointer"
                                                                >
                                                                    <Unlock className="w-4 h-4" />
                                                                    <span>Unblock User</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-xs sm:text-sm text-slate-500 font-semibold">
                                Showing {((users.page - 1) * 20) + 1} to {Math.min(users.page * 20, users.total)} of {users.total} users
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(users.page - 1)}
                                    disabled={users.page === 1}
                                    className="p-2 border border-slate-250 hover:bg-slate-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                                </button>
                                <span className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700">
                                    Page {users.page} of {users.pages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(users.page + 1)}
                                    disabled={users.page === users.pages}
                                    className="p-2 border border-slate-250 hover:bg-slate-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Block User Modal */}
            {showBlockModal && selectedUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full border border-slate-200/50 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-wider">Block User</h3>
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-650 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <img
                                    src={getAvatarUrl(selectedUser)}
                                    alt=""
                                    className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                                />
                                <div className="min-w-0">
                                    <div className="font-bold text-slate-800 text-xs sm:text-sm truncate">{selectedUser.firstName} {selectedUser.lastName}</div>
                                    <div className="text-xs text-slate-400 font-medium truncate">{selectedUser.email}</div>
                                </div>
                            </div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">
                                Reason for blocking <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder="Enter the reason for blocking this user..."
                                rows={3}
                                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-650/10 focus:border-red-650 focus:outline-none text-xs sm:text-sm text-slate-700 resize-none transition-all"
                            />
                            <p className="mt-2 text-xs text-slate-400 font-medium">
                                Blocked users will be immediately locked out and unable to log in.
                            </p>
                        </div>
                        <div className="px-5 py-4 bg-slate-50/60 rounded-b-2xl border-t border-slate-100 flex justify-end gap-2.5">
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-350 rounded-xl transition-all cursor-pointer active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBlockUser}
                                disabled={!blockReason.trim()}
                                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/10 rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Block User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Role Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full border border-slate-200/50 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-wider">Change User Role</h3>
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-650 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <img
                                    src={getAvatarUrl(selectedUser)}
                                    alt=""
                                    className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                                />
                                <div className="min-w-0">
                                    <div className="font-bold text-slate-800 text-xs sm:text-sm truncate">{selectedUser.firstName} {selectedUser.lastName}</div>
                                    <div className="text-xs text-slate-400 font-semibold truncate">Current: {roleConfig[selectedUser.role]?.label}</div>
                                </div>
                            </div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">New Role</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as any)}
                                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 focus:outline-none text-sm text-slate-700 transition-all bg-white"
                            >
                                <option value="ALUMNI">Alumni — Basic access</option>
                                <option value="MEMBER">Member — Paid member privileges</option>
                                <option value="EVENT_LEAD">Event Lead — Manage portal events</option>
                                <option value="ADMIN">Admin — Full platform settings control</option>
                            </select>
                            <p className="mt-2 text-xs text-slate-400 font-medium">
                                Granting the Admin role will provide complete edit and delete rights.
                            </p>
                        </div>
                        <div className="px-5 py-4 bg-slate-50/60 rounded-b-2xl border-t border-slate-100 flex justify-end gap-2.5">
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-350 rounded-xl transition-all cursor-pointer active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRoleChange}
                                disabled={newRole === selectedUser.role}
                                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-750 hover:to-indigo-850 shadow-md shadow-indigo-600/10 rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Update Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {showUserDetail && selectedUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200/50">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-wider">User Profile Detail</h3>
                            <button
                                onClick={() => setShowUserDetail(false)}
                                className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-650 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 sm:p-6 space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <img
                                    src={getAvatarUrl(selectedUser)}
                                    alt=""
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover flex-shrink-0 border-2 border-white shadow-sm"
                                />
                                <div className="min-w-0">
                                    <h4 className="text-base sm:text-lg font-extrabold text-slate-800 truncate">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-450 font-semibold truncate">{selectedUser.email}</p>
                                </div>
                            </div>
                            
                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-450 uppercase tracking-wider font-extrabold mb-1.5">Role</div>
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${roleConfig[selectedUser.role]?.bgColor} ${roleConfig[selectedUser.role]?.color} ${roleConfig[selectedUser.role]?.border}`}>
                                        {roleConfig[selectedUser.role]?.label}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-455 uppercase tracking-wider font-extrabold mb-1.5">Status</div>
                                    <span className={`inline-flex gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${statusConfig[selectedUser.status]?.bgColor} ${statusConfig[selectedUser.status]?.color} ${statusConfig[selectedUser.status]?.border}`}>
                                        {statusConfig[selectedUser.status]?.label}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-450 uppercase tracking-wider font-extrabold mb-1.5">Email Verified</div>
                                    <div className="font-bold text-xs sm:text-sm mt-0.5">
                                        {selectedUser.isEmailVerified ? (
                                            <span className="text-green-600 flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4 shrink-0" /> Verified
                                            </span>
                                        ) : (
                                            <span className="text-red-500 flex items-center gap-1">
                                                <XCircle className="w-4 h-4 shrink-0" /> Unverified
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-450 uppercase tracking-wider font-extrabold mb-1.5">Membership</div>
                                    <div className="font-bold text-xs sm:text-sm mt-0.5">
                                        {selectedUser.isMember ? (
                                            <span className="text-green-650">Paid Member Privilege</span>
                                        ) : (
                                            <span className="text-slate-500">Free Tier</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="text-[10px] text-slate-450 uppercase tracking-wider font-extrabold mb-1">Joined Date</div>
                                <div className="font-bold text-xs sm:text-sm text-slate-700">{formatDate(selectedUser.createdAt)}</div>
                            </div>
                            
                            {selectedUser.profile?.city && (
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-450 uppercase tracking-wider font-extrabold mb-1">City / Location</div>
                                    <div className="font-bold text-xs sm:text-sm text-slate-700">{selectedUser.profile.city}</div>
                                </div>
                            )}
                            
                            {selectedUser.profile?.currentCompany && (
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-450 uppercase tracking-wider font-extrabold mb-1">Company / Organization</div>
                                    <div className="font-bold text-xs sm:text-sm text-slate-700">{selectedUser.profile.currentCompany}</div>
                                </div>
                            )}
                            
                            {selectedUser.status === 'BLOCKED' && selectedUser.blockedReason && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                    <div className="text-[10px] text-red-600 font-extrabold uppercase tracking-widest mb-1.5">Block Reason</div>
                                    <p className="text-red-700 text-xs sm:text-sm font-semibold leading-relaxed">{selectedUser.blockedReason}</p>
                                    {selectedUser.blockedAt && (
                                        <div className="text-[10px] text-red-500 font-bold mt-2.5 uppercase tracking-wider">
                                            Blocked on: {formatDate(selectedUser.blockedAt)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="px-5 py-4 bg-slate-50/60 rounded-b-2xl border-t border-slate-100 flex justify-end sticky bottom-0 z-10">
                            <button
                                onClick={() => setShowUserDetail(false)}
                                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-350 rounded-xl transition-all cursor-pointer active:scale-95"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {openDropdown && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setOpenDropdown(null)}
                />
            )}
        </div>
    );
};

export default UserModeration;
