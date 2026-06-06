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

const roleConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    MEMBER: { label: 'Member', color: 'text-green-700', bgColor: 'bg-green-100' },
    BATCH_REP: { label: 'Batch Representative', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    ADMIN: { label: 'Admin', color: 'text-red-700', bgColor: 'bg-red-100' },
};

/** Status configuration for display */
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    ACTIVE: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
    BLOCKED: { label: 'Blocked', color: 'text-red-700', bgColor: 'bg-red-100' },
};

/**
 * User Moderation Page Component
 */
const UserModeration = () => {
    const dispatch = useAppDispatch();
    const { users } = useAppSelector(state => state.admin);
    const currentUser = useAppSelector(state => state.auth.user);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'active' | 'blocked' | ''>('');
    const [roleFilter, setRoleFilter] = useState<'MEMBER' | 'BATCH_REP' | 'ADMIN' | ''>('');
    const [verifiedFilter, setVerifiedFilter] = useState<'true' | 'false' | ''>('');
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [blockReason, setBlockReason] = useState('');
    const [newRole, setNewRole] = useState<'MEMBER' | 'BATCH_REP' | 'ADMIN'>('MEMBER');

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
        const result = await dispatch(blockUser({ userId: selectedUser.id, reason: blockReason }));
        if (blockUser.fulfilled.match(result)) {
            setShowBlockModal(false);
            setSelectedUser(null);
            setBlockReason('');
        }
    };

    /**
     * Handle unblock user action
     */
    const handleUnblockUser = async (user: AdminUser) => {
        await dispatch(unblockUser(user.id));
        setOpenDropdown(null);
    };

    /**
     * Handle role change action
     */
    const handleRoleChange = async () => {
        if (!selectedUser) return;
        const result = await dispatch(updateUserRole({ userId: selectedUser.id, role: newRole }));
        if (updateUserRole.fulfilled.match(result)) {
            setShowRoleModal(false);
            setSelectedUser(null);
        }
    };

    /**
     * Handle verify email action
     */
    const handleVerifyEmail = async (user: AdminUser) => {
        await dispatch(verifyUserEmail(user.id));
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

        // Normalize role for frontend select box (safeguard for legacy roles like 'ALUMNI')
        const validRoles = ['MEMBER', 'BATCH_REP', 'ADMIN'];
        if (validRoles.includes(user.role)) {
            setNewRole(user.role as 'MEMBER' | 'BATCH_REP' | 'ADMIN');
        } else {
            setNewRole('MEMBER'); // default to MEMBER if it's a legacy or invalid role
        }

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
        <div className="p-3 sm:p-4 md:p-6 pb-8 sm:pb-12 px-2 sm:px-3 md:px-4 lg:px-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg mt-0.5">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">User Moderation</h1>
                            <p className="text-xs sm:text-sm text-gray-500">Manage users, roles, and account status</p>
                        </div>
                    </div>
                    <button
                        onClick={() => loadUsers(users.page)}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto justify-center sm:justify-start"
                    >
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Refresh</span>
                        <span className="sm:hidden">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-4 sm:mb-6 bg-white rounded-lg sm:rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg font-medium transition-colors text-xs sm:text-sm ${showFilters || statusFilter || roleFilter || verifiedFilter
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Filters</span>
                        <span className="sm:hidden">Filter</span>
                        {(statusFilter || roleFilter || verifiedFilter) && (
                            <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-indigo-600 text-white rounded-full font-bold">
                                {[statusFilter, roleFilter, verifiedFilter].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Role</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as any)}
                                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                            >
                                <option value="">All Roles</option>
                                <option value="MEMBER">Member</option>
                                <option value="BATCH_REP">Batch Representative</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        {/* Verified Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email Verified</label>
                            <select
                                value={verifiedFilter}
                                onChange={(e) => setVerifiedFilter(e.target.value as any)}
                                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
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
                                    className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg sm:rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {users.loading ? (
                    <div className="flex items-center justify-center py-16 sm:py-20">
                        <div className="animate-spin rounded-full h-8 h-8 sm:h-10 sm:w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : users.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-gray-500 px-4">
                        <Users className="w-8 h-8 sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-50" />
                        <p className="text-base sm:text-lg font-medium">No users found</p>
                        <p className="text-xs sm:text-sm">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                        <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                        <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Verified</th>
                                        <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                                        <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            {/* User Info */}
                                            <td className="px-3 sm:px-6 py-2.5 sm:py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <img
                                                        src={getAvatarUrl(user)}
                                                        alt={`${user.firstName} ${user.lastName}`}
                                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900 text-xs sm:text-sm">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="px-3 sm:px-6 py-2.5 sm:py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${roleConfig[user.role]?.bgColor || 'bg-gray-100'} ${roleConfig[user.role]?.color || 'text-gray-700'}`}>
                                                    {roleConfig[user.role]?.label || user.role}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 sm:px-6 py-2.5 sm:py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${statusConfig[user.status]?.bgColor} ${statusConfig[user.status]?.color}`}>
                                                    {user.status === 'ACTIVE' ? (
                                                        <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                    ) : (
                                                        <ShieldOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                    )}
                                                    {statusConfig[user.status]?.label || user.status}
                                                </span>
                                            </td>

                                            {/* Email Verified */}
                                            <td className="px-3 sm:px-6 py-2.5 sm:py-4 whitespace-nowrap">
                                                {user.isEmailVerified ? (
                                                    <span className="inline-flex items-center gap-0.5 sm:gap-1 text-green-600 text-xs sm:text-sm">
                                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span className="hidden sm:inline">Yes</span>
                                                        <span className="sm:hidden">✓</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-0.5 sm:gap-1 text-red-500 text-xs sm:text-sm">
                                                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span className="hidden sm:inline">No</span>
                                                        <span className="sm:hidden">✕</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Joined Date */}
                                            <td className="px-3 sm:px-6 py-2.5 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                                {formatDate(user.createdAt)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 sm:px-6 py-2.5 sm:py-4 whitespace-nowrap text-right">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {openDropdown === user.id && (
                                                        <div className="absolute right-0 mt-1 sm:mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                            <button
                                                                onClick={() => openUserDetail(user)}
                                                                className="w-full flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                                                            >
                                                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                View Details
                                                            </button>

                                                            <button
                                                                onClick={() => openRoleModal(user)}
                                                                className="w-full flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                                                                disabled={user.id === currentUser?.id}
                                                            >
                                                                <UserCog className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                Change Role
                                                            </button>

                                                            {!user.isEmailVerified && (
                                                                <button
                                                                    onClick={() => handleVerifyEmail(user)}
                                                                    className="w-full flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                    Verify Email
                                                                </button>
                                                            )}

                                                            <div className="border-t border-gray-100 my-0.5 sm:my-1"></div>

                                                            {user.status === 'ACTIVE' ? (
                                                                <button
                                                                    onClick={() => openBlockModal(user)}
                                                                    className="w-full flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                                                                    disabled={user.role === 'ADMIN' || user.id === currentUser?.id}
                                                                >
                                                                    <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                    Block User
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleUnblockUser(user)}
                                                                    className="w-full flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-green-600 hover:bg-green-50"
                                                                >
                                                                    <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                    Unblock User
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
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {((users.page - 1) * 20) + 1} to {Math.min(users.page * 20, users.total)} of {users.total} users
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(users.page - 1)}
                                    disabled={users.page === 1}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium">
                                    Page {users.page} of {users.pages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(users.page + 1)}
                                    disabled={users.page === users.pages}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Block User Modal */}
            {showBlockModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Block User</h3>
                                <button
                                    onClick={() => setShowBlockModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                                <img
                                    src={getAvatarUrl(selectedUser)}
                                    alt=""
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                                />
                                <div className="min-w-0">
                                    <div className="font-medium text-xs sm:text-sm truncate">{selectedUser.firstName} {selectedUser.lastName}</div>
                                    <div className="text-xs sm:text-sm text-gray-500 truncate">{selectedUser.email}</div>
                                </div>
                            </div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                Reason for blocking <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder="Enter the reason for blocking this user..."
                                rows={3}
                                className="w-full px-2.5 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                            />
                            <p className="mt-2 text-xs sm:text-sm text-gray-500">
                                Blocked users will be unable to access the platform.
                            </p>
                        </div>
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 rounded-b-lg sm:rounded-b-xl flex justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBlockUser}
                                disabled={!blockReason.trim()}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Block User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Role Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Change User Role</h3>
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                                <img
                                    src={getAvatarUrl(selectedUser)}
                                    alt=""
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                                />
                                <div className="min-w-0">
                                    <div className="font-medium text-xs sm:text-sm truncate">{selectedUser.firstName} {selectedUser.lastName}</div>
                                    <div className="text-xs sm:text-sm text-gray-500">Current: {roleConfig[selectedUser.role]?.label || selectedUser.role}</div>
                                </div>
                            </div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">New Role</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as any)}
                                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                            >
                                <option value="MEMBER">Member - Standard access</option>
                                <option value="BATCH_REP">Batch Representative - Manage batch activities</option>
                                <option value="ADMIN">Admin - Full administrative access</option>
                            </select>
                            <p className="mt-2 text-xs sm:text-sm text-gray-500">
                                Changing to Admin will grant full administrative privileges.
                            </p>
                        </div>
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 rounded-b-lg sm:rounded-b-xl flex justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRoleChange}
                                disabled={newRole === selectedUser.role}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Update Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {showUserDetail && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">User Details</h3>
                                <button
                                    onClick={() => setShowUserDetail(false)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-3 sm:gap-4 mb-6">
                                <img
                                    src={getAvatarUrl(selectedUser)}
                                    alt=""
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="min-w-0">
                                    <h4 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedUser.email}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-500 mb-1">Role</div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleConfig[selectedUser.role]?.bgColor || 'bg-gray-100'} ${roleConfig[selectedUser.role]?.color || 'text-gray-700'}`}>
                                            {roleConfig[selectedUser.role]?.label || selectedUser.role}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-500 mb-1">Status</div>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedUser.status]?.bgColor} ${statusConfig[selectedUser.status]?.color}`}>
                                            {statusConfig[selectedUser.status]?.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-500 mb-1">Email Verified</div>
                                        <div className="font-medium">
                                            {selectedUser.isEmailVerified ? (
                                                <span className="text-green-600 flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm">
                                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Verified
                                                </span>
                                            ) : (
                                                <span className="text-red-500 flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm">
                                                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Not Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs sm:text-sm text-gray-500 mb-1">Membership</div>
                                        <div className="font-medium text-xs sm:text-sm">
                                            {selectedUser.isMember ? (
                                                <span className="text-green-600">Paid Member</span>
                                            ) : (
                                                <span className="text-gray-600">Free</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Joined</div>
                                    <div className="font-medium text-xs sm:text-sm">{formatDate(selectedUser.createdAt)}</div>
                                </div>

                                {selectedUser.profile?.city && (
                                    <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs sm:text-sm text-gray-500 mb-1">City</div>
                                        <div className="font-medium text-xs sm:text-sm">{selectedUser.profile.city}</div>
                                    </div>
                                )}

                                {selectedUser.profile?.currentCompany && (
                                    <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs sm:text-sm text-gray-500 mb-1">Company</div>
                                        <div className="font-medium text-xs sm:text-sm">{selectedUser.profile.currentCompany}</div>
                                    </div>
                                )}

                                {selectedUser.status === 'BLOCKED' && selectedUser.blockedReason && (
                                    <div className="p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div className="text-xs sm:text-sm text-red-600 font-medium mb-1">Block Reason</div>
                                        <div className="text-red-700 text-xs sm:text-sm">{selectedUser.blockedReason}</div>
                                        {selectedUser.blockedAt && (
                                            <div className="text-xs sm:text-sm text-red-500 mt-2">
                                                Blocked on: {formatDate(selectedUser.blockedAt)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 rounded-b-lg sm:rounded-b-xl flex justify-end border-t border-gray-200 sticky bottom-0">
                            <button
                                onClick={() => setShowUserDetail(false)}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Close
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
