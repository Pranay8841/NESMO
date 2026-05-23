import { useEffect, useState } from 'react';
import {
    MapPin, X, ChevronDown, Search, Check
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import {
    setFilters,
    applyFilters,
    clearFilters,
    removeFilter,
    setSearchQuery,
    setPage,
} from '../redux/slices/alumniSlice';
import type { AlumniMember } from '../redux/slices/alumniSlice';
import { fetchAlumniDirectory } from '../services/alumniService';
import AlumniProfileModal from '../components/Directory/AlumniProfileModal';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// JNV first batch joined in 1986, passout after 7 years (1993)
const JOIN_BATCH_OPTIONS = Array.from({ length: 41 }, (_, i) => `${1986 + i}`); // 1986 to 2026
const PASSOUT_BATCH_OPTIONS = Array.from({ length: 41 }, (_, i) => `${1993 + i}`); // 1993 to 2033
const LIMIT = 12;

export default function Directory() {
    const dispatch = useAppDispatch();
    const [selectedMember, setSelectedMember] = useState<AlumniMember | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const {
        alumni,
        loading,
        page,
        totalCount,
        filters,
        appliedFilters,
        searchQuery,
    } = useAppSelector((state) => state.alumni);

    // Fetch alumni when page, applied filters, or search query changes
    useEffect(() => {
        dispatch(fetchAlumniDirectory({
            page,
            limit: LIMIT,
            filters: appliedFilters,
            search: searchQuery,
        }));
    }, [dispatch, page, appliedFilters, searchQuery]);

    const handleApplyFilters = () => {
        dispatch(applyFilters());
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
    };

    const handleRemoveFilter = (key: 'joinBatch' | 'passoutBatch' | 'city' | 'occupation' | 'bloodGroup' | 'isMember') => {
        dispatch(removeFilter(key));
    };

    const handleBloodGroupSelect = (bg: string) => {
        dispatch(setFilters({
            bloodGroup: filters.bloodGroup === bg ? '' : bg
        }));
    };

    const handlePageChange = (newPage: number) => {
        dispatch(setPage(newPage));
    };

    const handleViewProfile = (member: AlumniMember) => {
        setSelectedMember(member);
        setIsProfileModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedMember(null);
    };

    const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
    const totalPages = Math.ceil(totalCount / LIMIT) || 1;

    return (
        <div className="bg-slate-50/50 min-h-screen py-6 sm:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 h-fit lg:sticky lg:top-24 shadow-sm shadow-slate-100/50 transition-all duration-300">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Filters</h2>
                            <p className="text-xs text-slate-400 mt-1 mb-6">Refine the alumni list</p>

                            <div className="space-y-6">
                                {/* Join Batch */}
                                <div>
                                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">
                                        Join Batch
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.joinBatch}
                                            onChange={(e) => dispatch(setFilters({ joinBatch: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 appearance-none cursor-pointer transition-all"
                                        >
                                            <option value="">All Years</option>
                                            {JOIN_BATCH_OPTIONS.map(batch => (
                                                <option key={batch} value={batch}>{batch}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Passout Batch */}
                                <div>
                                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">
                                        Passout Batch
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.passoutBatch}
                                            onChange={(e) => dispatch(setFilters({ passoutBatch: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 appearance-none cursor-pointer transition-all"
                                        >
                                            <option value="">All Years</option>
                                            {PASSOUT_BATCH_OPTIONS.map(batch => (
                                                <option key={batch} value={batch}>{batch}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">
                                        City
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Bangalore"
                                            value={filters.city}
                                            onChange={(e) => dispatch(setFilters({ city: e.target.value }))}
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 placeholder:text-slate-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Occupation */}
                                <div>
                                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">
                                        Occupation
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Software Engineer"
                                            value={filters.occupation}
                                            onChange={(e) => dispatch(setFilters({ occupation: e.target.value }))}
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 placeholder:text-slate-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">
                                        Blood Group
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {BLOOD_GROUPS.map(bg => (
                                            <button
                                                key={bg}
                                                onClick={() => handleBloodGroupSelect(bg)}
                                                className={`py-2 border rounded-xl text-xs font-bold focus:outline-none transition-all duration-200 active:scale-[0.95] cursor-pointer ${filters.bloodGroup === bg
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                                    }`}
                                            >
                                                {bg}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* NESMO Members Only */}
                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={filters.isMember === 'true'}
                                                onChange={(e) => dispatch(setFilters({ isMember: e.target.checked ? 'true' : '' }))}
                                                className="w-5 h-5 border border-slate-300 rounded-lg checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10 cursor-pointer appearance-none transition-all"
                                            />
                                            {filters.isMember === 'true' && (
                                                <Check className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none" />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">NESMO Members Only</span>
                                    </label>
                                </div>

                                {/* Apply Filters Button */}
                                <button
                                    onClick={handleApplyFilters}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Apply Filters
                                </button>

                                {/* Clear All */}
                                <button
                                    onClick={handleClearFilters}
                                    className="w-full text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-center"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-1">Alumni Directory</h1>
                                    <p className="text-slate-500 text-sm">
                                        {loading ? 'Loading alumni...' : `Found ${totalCount} Navodaya Ex-Students`}
                                    </p>
                                </div>
                                {/* Search */}
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, city..."
                                        value={searchQuery}
                                        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 placeholder:text-slate-400 shadow-sm transition-all"
                                    />
                                </div>
                            </div>

                            {/* Active Filters */}
                            {activeFilterCount > 0 && (
                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                    {appliedFilters.joinBatch && (
                                        <span className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                                            Join {appliedFilters.joinBatch}
                                            <X className="w-3.5 h-3.5 cursor-pointer hover:text-blue-900" onClick={() => handleRemoveFilter('joinBatch')} />
                                        </span>
                                    )}
                                    {appliedFilters.passoutBatch && (
                                        <span className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                                            Passout {appliedFilters.passoutBatch}
                                            <X className="w-3.5 h-3.5 cursor-pointer hover:text-blue-900" onClick={() => handleRemoveFilter('passoutBatch')} />
                                        </span>
                                    )}
                                    {appliedFilters.city && (
                                        <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                                            {appliedFilters.city}
                                            <X className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900" onClick={() => handleRemoveFilter('city')} />
                                        </span>
                                    )}
                                    {appliedFilters.occupation && (
                                        <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                                            {appliedFilters.occupation}
                                            <X className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900" onClick={() => handleRemoveFilter('occupation')} />
                                        </span>
                                    )}
                                    {appliedFilters.bloodGroup && (
                                        <span className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                                            Blood: {appliedFilters.bloodGroup}
                                            <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-900" onClick={() => handleRemoveFilter('bloodGroup')} />
                                        </span>
                                    )}
                                    {appliedFilters.isMember === 'true' && (
                                        <span className="px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                                            NESMO Members
                                            <X className="w-3.5 h-3.5 cursor-pointer hover:text-green-900" onClick={() => handleRemoveFilter('isMember')} />
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div key={`skeleton-${i}`} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-slate-100"></div>
                                        </div>
                                        <div className="text-center mb-2">
                                            <div className="h-4 bg-slate-100 rounded-md w-28 mx-auto"></div>
                                        </div>
                                        <div className="text-center mb-2">
                                            <div className="h-3 bg-slate-100 rounded-md w-20 mx-auto"></div>
                                        </div>
                                        <div className="flex justify-center mb-4">
                                            <div className="h-3 bg-slate-100 rounded-md w-16"></div>
                                        </div>
                                        <div className="h-9 bg-slate-100 rounded-xl"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Alumni Grid */}
                        {!loading && (
                            <>
                                {alumni.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center shadow-sm">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">No alumni found</h3>
                                        <p className="text-slate-500 text-sm mb-5">Try adjusting your filters or search query</p>
                                        <button
                                            onClick={handleClearFilters}
                                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-sm shadow-blue-500/10"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">
                                        {alumni.map((member) => {
                                            const isPaidMember = member.role !== 'ALUMNI' || member.isMember;
                                            const roleConfig: Record<string, { label: string; bgColor: string; textColor: string; border: string }> = {
                                                ADMIN: { label: 'Admin', bgColor: 'bg-red-50/80', textColor: 'text-red-600', border: 'border-red-100/50' },
                                                EVENT_LEAD: { label: 'Event Lead', bgColor: 'bg-purple-50/80', textColor: 'text-purple-600', border: 'border-purple-100/50' },
                                                MEMBER: { label: 'Member', bgColor: 'bg-blue-50/80', textColor: 'text-blue-600', border: 'border-blue-100/50' },
                                                ALUMNI: { label: 'Alumni', bgColor: 'bg-slate-50', textColor: 'text-slate-500', border: 'border-slate-100' },
                                            };
                                            const roleInfo = roleConfig[member.role] || roleConfig.ALUMNI;
                                            
                                            return (
                                            <div 
                                                key={member.id} 
                                                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between group"
                                                onClick={() => handleViewProfile(member)}
                                            >
                                                {/* Role Badge - Top Right */}
                                                <div className={`absolute top-0 right-0 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded-bl-xl border-l border-b ${roleInfo.bgColor} ${roleInfo.textColor} ${roleInfo.border} whitespace-nowrap`}>
                                                    {member.role !== 'ALUMNI' && '✓ '}{roleInfo.label}
                                                </div>

                                                {/* Card Content Top */}
                                                <div>
                                                    {/* Avatar */}
                                                    <div className="flex justify-center mb-4 mt-4">
                                                        <div className="relative">
                                                            {member.photo ? (
                                                                <img
                                                                    src={member.photo}
                                                                    alt={member.name}
                                                                    className={`w-16 h-16 rounded-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                                                        isPaidMember ? 'ring-2 ring-blue-500 ring-offset-2' : 'ring-2 ring-slate-100 ring-offset-2'
                                                                    }`}
                                                                />
                                                            ) : (
                                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold group-hover:scale-105 transition-transform duration-300 ${
                                                                    isPaidMember
                                                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-blue-500 ring-offset-2'
                                                                        : 'bg-gradient-to-br from-slate-400 to-slate-500 ring-2 ring-slate-100 ring-offset-2'
                                                                }`}>
                                                                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Name */}
                                                    <div className="text-center mb-1">
                                                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate px-1">
                                                            {member.name}
                                                        </h3>
                                                    </div>

                                                    {/* Occupation */}
                                                    {member.occupation && (
                                                        <div className="text-center text-xs text-slate-500 font-medium mb-2.5 truncate px-1">
                                                            {member.occupation}
                                                        </div>
                                                    )}

                                                    {/* Batch & Blood Group */}
                                                    <div className="flex items-center justify-center gap-2 text-xs mb-2">
                                                        {(member.joinBatch || member.passoutBatch) && (
                                                            <span className="font-semibold text-slate-600">{member.joinBatch || '?'} - {member.passoutBatch || '?'}</span>
                                                        )}
                                                        {(member.joinBatch || member.passoutBatch) && member.bloodGroup && <span className="text-slate-300">•</span>}
                                                        {member.bloodGroup && (
                                                            <span className="px-1.5 py-0.5 bg-red-50 text-red-500 rounded-md text-[10px] font-bold border border-red-100/50">
                                                                🩸 {member.bloodGroup}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Location */}
                                                    {member.city && (
                                                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-4">
                                                            <MapPin className="w-3 h-3 text-slate-300" />
                                                            <span className="truncate max-w-[130px] font-medium">{member.city}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* View Profile Button */}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewProfile(member);
                                                    }}
                                                    className="w-full py-2 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl font-bold text-xs border border-slate-200 hover:border-blue-600 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-1.5">
                                        <button
                                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (page <= 3) {
                                                pageNum = i + 1;
                                            } else if (page >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 cursor-pointer ${page === pageNum
                                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 border border-blue-600'
                                                        : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        {totalPages > 5 && page < totalPages - 2 && (
                                            <>
                                                <span className="text-slate-400 font-bold px-1 select-none">...</span>
                                                <button
                                                    onClick={() => handlePageChange(totalPages)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm cursor-pointer transition-all active:scale-95"
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                            disabled={page === totalPages}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* Alumni Profile Modal */}
            <AlumniProfileModal
                isOpen={isProfileModalOpen}
                onClose={handleCloseProfileModal}
                member={selectedMember}
            />
        </div>
    );
}
