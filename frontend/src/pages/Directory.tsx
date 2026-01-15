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
const BATCH_OPTIONS = Array.from({ length: 30 }, (_, i) => `${1990 + i}`);
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

    const handleRemoveFilter = (key: 'jnvBatch' | 'city' | 'occupation' | 'bloodGroup' | 'isMember') => {
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
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 h-fit lg:sticky lg:top-24">
                        <div>
                            <h2 className="text-lg font-black text-gray-900 mb-1">Filters</h2>
                            <p className="text-xs text-gray-500 mb-6">Refine the alumni list</p>

                            <div className="space-y-6">
                                {/* JNV Batch */}
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                                        JNV BATCH
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.jnvBatch}
                                            onChange={(e) => dispatch(setFilters({ jnvBatch: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                                        >
                                            <option value="">All Batches</option>
                                            {BATCH_OPTIONS.map(batch => (
                                                <option key={batch} value={batch}>{batch}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                                        CITY
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Bangalore"
                                            value={filters.city}
                                            onChange={(e) => dispatch(setFilters({ city: e.target.value }))}
                                            className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Occupation */}
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                                        OCCUPATION
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Software Engineer"
                                            value={filters.occupation}
                                            onChange={(e) => dispatch(setFilters({ occupation: e.target.value }))}
                                            className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
                                        BLOOD GROUP
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {BLOOD_GROUPS.map(bg => (
                                            <button
                                                key={bg}
                                                onClick={() => handleBloodGroupSelect(bg)}
                                                className={`px-2 py-2 border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors cursor-pointer ${filters.bloodGroup === bg
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {bg}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* NESMO Members Only */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={filters.isMember === 'true'}
                                                onChange={(e) => dispatch(setFilters({ isMember: e.target.checked ? 'true' : '' }))}
                                                className="w-5 h-5 border-2 border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none"
                                            />
                                            {filters.isMember === 'true' && (
                                                <Check className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none" />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">NESMO Members Only</span>
                                    </label>
                                </div>

                                {/* Apply Filters Button */}
                                <button
                                    onClick={handleApplyFilters}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Apply Filters
                                </button>

                                {/* Clear All */}
                                <button
                                    onClick={handleClearFilters}
                                    className="w-full text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Alumni Directory</h1>
                                    <p className="text-gray-600">
                                        {loading ? 'Loading alumni...' : `Found ${totalCount} Navodaya Ex-Students`}
                                    </p>
                                </div>
                                {/* Search */}
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, city..."
                                        value={searchQuery}
                                        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Active Filters */}
                            {activeFilterCount > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {appliedFilters.jnvBatch && (
                                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                                            Batch {appliedFilters.jnvBatch}
                                            <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => handleRemoveFilter('jnvBatch')} />
                                        </span>
                                    )}
                                    {appliedFilters.city && (
                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                                            {appliedFilters.city}
                                            <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => handleRemoveFilter('city')} />
                                        </span>
                                    )}
                                    {appliedFilters.occupation && (
                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                                            {appliedFilters.occupation}
                                            <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => handleRemoveFilter('occupation')} />
                                        </span>
                                    )}
                                    {appliedFilters.bloodGroup && (
                                        <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                                            Blood: {appliedFilters.bloodGroup}
                                            <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => handleRemoveFilter('bloodGroup')} />
                                        </span>
                                    )}
                                    {appliedFilters.isMember === 'true' && (
                                        <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                                            NESMO Members
                                            <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => handleRemoveFilter('isMember')} />
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div key={`skeleton-${i}`} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
                                        <div className="flex justify-center mb-3">
                                            <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                                        </div>
                                        <div className="text-center mb-1">
                                            <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                                        </div>
                                        <div className="text-center mb-1">
                                            <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                                        </div>
                                        <div className="flex justify-center mb-2">
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                        <div className="h-8 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Alumni Grid */}
                        {!loading && (
                            <>
                                {alumni.length === 0 ? (
                                    <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">No alumni found</h3>
                                        <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
                                        <button
                                            onClick={handleClearFilters}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 cursor-pointer"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                                        {alumni.map((member) => (
                                            <div key={member.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
                                                {/* NESMO Status Badge - Top Right */}
                                                <div className={`absolute top-0 right-0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-bl-md ${
                                                    member.nesmoStatus === 'NESMO Member'
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {member.nesmoStatus === 'NESMO Member' ? '✓ Member' : 'Alumni'}
                                                </div>

                                                {/* Avatar */}
                                                <div className="flex justify-center mb-3 mt-2">
                                                    <div className="relative">
                                                        {member.photo ? (
                                                            <img
                                                                src={member.photo}
                                                                alt={member.name}
                                                                className={`w-16 h-16 rounded-full object-cover ${
                                                                    member.nesmoStatus === 'NESMO Member' ? 'ring-2 ring-blue-400' : ''
                                                                }`}
                                                            />
                                                        ) : (
                                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                                                                member.nesmoStatus === 'NESMO Member'
                                                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-400'
                                                                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                                            }`}>
                                                                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Name */}
                                                <div className="text-center mb-1">
                                                    <h3 className="text-sm font-bold text-gray-900 truncate">{member.name}</h3>
                                                </div>

                                                {/* Occupation */}
                                                {member.occupation && (
                                                    <div className="text-center text-xs text-gray-600 font-medium mb-1 truncate">
                                                        {member.occupation}
                                                    </div>
                                                )}

                                                {/* Location & Batch */}
                                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
                                                    {member.city && (
                                                        <>
                                                            <MapPin className="w-2.5 h-2.5" />
                                                            <span className="truncate max-w-[100px]">{member.city}</span>
                                                        </>
                                                    )}
                                                    {member.city && member.batch && <span>•</span>}
                                                    {member.batch && <span className="font-semibold">{member.batch}</span>}
                                                </div>

                                                {/* Blood Group */}
                                                {member.bloodGroup && (
                                                    <div className="text-center mb-2">
                                                        <span className="inline-block px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-semibold">
                                                            🩸 {member.bloodGroup}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* View Profile Button */}
                                                <button 
                                                    onClick={() => handleViewProfile(member)}
                                                    className="w-full py-2 bg-blue-600 text-white rounded-md font-semibold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                                                    className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm transition-colors cursor-pointer ${page === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'hover:bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        {totalPages > 5 && page < totalPages - 2 && (
                                            <>
                                                <span className="text-gray-400 font-bold">...</span>
                                                <button
                                                    onClick={() => handlePageChange(totalPages)}
                                                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 font-bold text-sm cursor-pointer"
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                            disabled={page === totalPages}
                                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
