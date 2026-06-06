/**
 * @fileoverview Batch Representative Dashboard Component
 * Renders batch statistics, member profiles, and onboarding status.
 * 
 * @module components/Admin/BatchDashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { 
    Users, 
    Search, 
    Filter, 
    Mail, 
    Phone, 
    MapPin, 
    Briefcase, 
    RefreshCw, 
    Loader2, 
    CheckCircle, 
    AlertCircle,
    X
} from 'lucide-react';
import { apiConnector } from '../../utils/APIsConnector';
import { PROFILE_API } from '../../utils/api';
import toast from 'react-hot-toast';

interface BatchMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    occupation: string;
    profilePhoto: string;
    completeness: number;
    isOnboarded: boolean;
    status: 'ACTIVE' | 'BLOCKED';
    createdAt: string;
}

interface BatchStats {
    passoutBatch: string;
    totalMembers: number;
    pendingProfileCount: number;
    completedProfileCount: number;
    members: BatchMember[];
}

export default function BatchDashboard() {
    const [stats, setStats] = useState<BatchStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filter & Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

    // Block User Modal states
    const [selectedUser, setSelectedUser] = useState<BatchMember | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    // Get Auth Headers
    const getAuthHeaders = useCallback(() => {
        const tokenStr = localStorage.getItem('token');
        const token = tokenStr ? JSON.parse(tokenStr) : null;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    // Fetch batch statistics & members
    const fetchBatchStats = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const headers = getAuthHeaders();
            const response = await apiConnector('GET', PROFILE_API.GET_BATCH_DASHBOARD, null, headers as any);
            
            if (response.data.success) {
                setStats(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch batch data');
            }
        } catch (error: any) {
            console.error('Fetch batch stats error:', error);
            const errMsg = error.response?.data?.message || 'Error connecting to server';
            toast.error(errMsg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [getAuthHeaders]);

    // Initial load
    useEffect(() => {
        fetchBatchStats();
    }, [fetchBatchStats]);

    const handleRefresh = () => {
        fetchBatchStats(true);
    };

    const openBlockModal = (member: BatchMember) => {
        setSelectedUser(member);
        setBlockReason('');
        setShowBlockModal(true);
    };

    const submitBlockUser = async () => {
        if (!selectedUser || !blockReason.trim()) return;
        const name = `${selectedUser.firstName} ${selectedUser.lastName}`;
        
        try {
            const headers = getAuthHeaders();
            const url = PROFILE_API.BLOCK_BATCH_USER.replace(':id', selectedUser.id);
            const response = await apiConnector(
                'PUT',
                url,
                { reason: blockReason },
                headers as any
            );
            
            if (response.data.success) {
                toast.success(`${name} has been blocked.`);
                setShowBlockModal(false);
                setSelectedUser(null);
                setBlockReason('');
                fetchBatchStats(true);
            } else {
                toast.error(response.data.message || 'Failed to block user');
            }
        } catch (error: any) {
            console.error('Block user error:', error);
            toast.error(error.response?.data?.message || 'Failed to block user');
        }
    };

    const handleUnblockUser = async (userId: string, name: string) => {
        if (!window.confirm(`Are you sure you want to unblock ${name}?`)) return;
        
        try {
            const headers = getAuthHeaders();
            const url = PROFILE_API.UNBLOCK_BATCH_USER.replace(':id', userId);
            const response = await apiConnector(
                'PUT',
                url,
                null,
                headers as any
            );
            
            if (response.data.success) {
                toast.success(`${name} has been unblocked.`);
                fetchBatchStats(true);
            } else {
                toast.error(response.data.message || 'Failed to unblock user');
            }
        } catch (error: any) {
            console.error('Unblock user error:', error);
            toast.error(error.response?.data?.message || 'Failed to unblock user');
        }
    };

    // Filtered members list
    const filteredMembers = stats?.members.filter(member => {
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        const email = member.email.toLowerCase();
        const city = member.city.toLowerCase();
        const occupation = member.occupation.toLowerCase();
        const search = searchTerm.toLowerCase();

        // Search match
        const matchesSearch = 
            fullName.includes(search) || 
            email.includes(search) || 
            city.includes(search) || 
            occupation.includes(search);

        // Status match
        const isCompleted = member.isOnboarded && member.completeness >= 80;
        const matchesStatus = 
            statusFilter === 'all' || 
            (statusFilter === 'completed' && isCompleted) || 
            (statusFilter === 'pending' && !isCompleted);

        return matchesSearch && matchesStatus;
    }) || [];

    if (loading && !stats) {
        return (
            <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading batch details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-8 sm:pb-12 px-2 sm:px-3 md:px-4">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">
                        Batch Representative Portal
                    </h1>
                    <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                        Manage your classmates and review onboarding progress for Batch of {stats?.passoutBatch || 'N/A'}.
                    </p>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center sm:justify-start"
                >
                    <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
                {/* Total Members */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Members Joined</span>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-900">{stats?.totalMembers || 0}</div>
                    <p className="text-xs text-gray-400 mt-2">Registered users in your passout batch</p>
                </div>

                {/* Completed Profiles */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Onboarded Profiles</span>
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-green-600">{stats?.completedProfileCount || 0}</div>
                    <p className="text-xs text-gray-400 mt-2">Onboarded with &gt;= 80% completeness</p>
                </div>

                {/* Pending Profiles */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Pending Onboarding</span>
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-amber-600">{stats?.pendingProfileCount || 0}</div>
                    <p className="text-xs text-gray-400 mt-2">Needs information update or onboarding completion</p>
                </div>
            </div>

            {/* Filter and Search Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, city, occupation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Filter Dropdown */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Members</option>
                            <option value="completed">Onboarded / Completed</option>
                            <option value="pending">Pending Profile Update</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Members Table Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Contact Details</th>
                                <th className="px-6 py-4">Professional Details</th>
                                <th className="px-6 py-4">Profile Completeness</th>
                                <th className="px-6 py-4 text-right">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member) => {
                                    const isCompleted = member.isOnboarded && member.completeness >= 80;
                                    return (
                                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Member Avatar, Name & Email */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {member.profilePhoto ? (
                                                        <img 
                                                            src={member.profilePhoto} 
                                                            alt="" 
                                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                                                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">
                                                            {member.firstName} {member.lastName}
                                                        </div>
                                                        <div className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            <span>{member.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Phone & Location */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="text-gray-600 text-xs flex items-center gap-1">
                                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{member.phone || 'N/A'}</span>
                                                    </div>
                                                    <div className="text-gray-600 text-xs flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{member.city || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Occupation */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-700 text-sm flex items-center gap-1.5">
                                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                                    <span>{member.occupation || 'N/A'}</span>
                                                </div>
                                            </td>

                                            {/* Completeness Bar */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="max-w-[150px]">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-xs font-bold ${
                                                            member.completeness >= 80 ? 'text-green-600' : 'text-amber-600'
                                                        }`}>
                                                            {member.completeness}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                        <div 
                                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                                member.completeness >= 80 ? 'bg-green-500' : 'bg-amber-500'
                                                            }`}
                                                            style={{ width: `${member.completeness}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {member.status === 'BLOCKED' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                        Blocked
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        isCompleted 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {isCompleted ? 'Onboarded' : 'Pending Update'}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {member.status === 'BLOCKED' ? (
                                                    <button
                                                        onClick={() => handleUnblockUser(member.id, `${member.firstName} ${member.lastName}`)}
                                                        className="text-green-600 hover:text-green-950 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded transition-colors"
                                                    >
                                                        Unblock
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => openBlockModal(member)}
                                                        className="text-red-600 hover:text-red-950 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition-colors"
                                                    >
                                                        Block
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No batch members found matching the current search/filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Block User Modal */}
            {showBlockModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full text-left">
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
                                {selectedUser.profilePhoto ? (
                                    <img
                                        src={selectedUser.profilePhoto}
                                        alt=""
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 flex-shrink-0 text-xs sm:text-sm">
                                        {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                                    </div>
                                )}
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
                                onClick={submitBlockUser}
                                disabled={!blockReason.trim()}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Block User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
