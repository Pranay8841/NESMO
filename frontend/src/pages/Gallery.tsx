/**
 * @fileoverview Gallery Page
 * Public page displaying photo albums with filtering, search, and pagination.
 * 
 * @module pages/Gallery
 */

import { type JSX, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchAlbums, fetchLocations, fetchYears } from "../services/galleryService";
import type { AlbumFilters } from "../services/galleryService";
import type { Album, AlbumCategory } from "../redux/slices/gallerySlice";
import AlbumCard from "../components/Gallery/AlbumCard";
import UploadMediaModal from "../components/Gallery/UploadMediaModal";
import { Image, Search, MapPin, Calendar, ChevronDown, ChevronLeft, ChevronRight, Loader2, Upload } from "lucide-react";

/** Category filter options */
const CATEGORY_OPTIONS: { value: AlbumCategory | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Events" },
    { value: "ANNUAL_MEET", label: "Annual Meet" },
    { value: "REGIONAL_MEETUP", label: "Regional Meetups" },
    { value: "CHARITY_DRIVE", label: "Charity Drive" },
    { value: "OTHER", label: "Other" },
];

export default function GalleryPage(): JSX.Element {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { albums, pagination, albumsLoading, locations, years } = useAppSelector((state) => state.gallery);
    const { user } = useAppSelector((state) => state.auth);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<AlbumCategory | "ALL">("ALL");
    const [filterYear, setFilterYear] = useState<string>("");
    const [filterCity, setFilterCity] = useState<string>("");

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch albums with filters
    const loadAlbums = useCallback((page: number = 1) => {
        const filters: AlbumFilters = {
            page,
            limit: 12,
        };
        if (filterCategory !== "ALL") filters.category = filterCategory;
        if (filterYear) filters.year = filterYear;
        if (filterCity) filters.city = filterCity;
        if (debouncedSearch) filters.search = debouncedSearch;

        dispatch(fetchAlbums(filters));
    }, [dispatch, filterCategory, filterYear, filterCity, debouncedSearch]);

    // Initial load and reload when filters change
    useEffect(() => {
        dispatch(fetchLocations());
        dispatch(fetchYears());
        loadAlbums(1);
    }, [dispatch, loadAlbums]);

    // Handle pagination
    const handlePageChange = (page: number) => {
        loadAlbums(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle album click - navigate to album detail page
    const handleAlbumClick = (album: Album) => {
        navigate(`/gallery/${album._id}`);
    };

    // Check if user can upload (Admin or Event Lead)
    const canUpload = user && (user.role === "ADMIN" || user.role === "EVENT_LEAD");

    // Render pagination
    const renderPagination = () => {
        if (!pagination || pagination.totalPages <= 1) return null;

        const pages: (number | string)[] = [];
        const { currentPage: current, totalPages } = pagination;

        // Always show first page
        pages.push(1);

        // Show ellipsis if needed
        if (current > 3) {
            pages.push('...');
        }

        // Show pages around current
        for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
            if (!pages.includes(i)) {
                pages.push(i);
            }
        }

        // Show ellipsis before last page if needed
        if (current < totalPages - 2) {
            pages.push('...');
        }

        // Always show last page if more than 1 page
        if (totalPages > 1 && !pages.includes(totalPages)) {
            pages.push(totalPages);
        }

        return (
            <div className="flex items-center justify-center gap-2 mt-12">
                <button
                    onClick={() => handlePageChange(current - 1)}
                    disabled={current === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {pages.map((page, index) => (
                    typeof page === 'number' ? (
                        <button
                            key={index}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition ${
                                page === current
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={index} className="px-2 text-gray-500">...</span>
                    )
                ))}

                <button
                    onClick={() => handlePageChange(current + 1)}
                    disabled={current === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        );
    };

    return (
        <section className="bg-gray-50 min-h-screen py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Photo Gallery</h1>
                        <p className="text-gray-600">
                            Relive the moments from our global NESMO alumni gatherings and charity events.
                        </p>
                    </div>
                    {canUpload && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Media
                        </button>
                    )}
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
                    {/* Filter by text */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span className="font-medium">✦ FILTER BY</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Category Filters */}
                        {CATEGORY_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFilterCategory(option.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                    filterCategory === option.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {option.label}
                                {option.value !== "ALL" && (
                                    <ChevronDown className="w-4 h-4 inline-block ml-1" />
                                )}
                            </button>
                        ))}

                        {/* Year Filter */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowYearDropdown(!showYearDropdown);
                                    setShowCityDropdown(false);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                                    filterYear ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <Calendar className="w-4 h-4" />
                                {filterYear || 'Year'}
                            </button>
                            {showYearDropdown && (
                                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
                                    <button
                                        onClick={() => {
                                            setFilterYear("");
                                            setShowYearDropdown(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                                    >
                                        All Years
                                    </button>
                                    {years.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setFilterYear(year.toString());
                                                setShowYearDropdown(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                                filterYear === year.toString() ? 'bg-blue-50 text-blue-600' : ''
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* City Filter */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowCityDropdown(!showCityDropdown);
                                    setShowYearDropdown(false);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                                    filterCity ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <MapPin className="w-4 h-4" />
                                {filterCity || 'City'}
                            </button>
                            {showCityDropdown && (
                                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px] max-h-64 overflow-y-auto">
                                    <button
                                        onClick={() => {
                                            setFilterCity("");
                                            setShowCityDropdown(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                                    >
                                        All Cities
                                    </button>
                                    {locations.map((city) => (
                                        <button
                                            key={city}
                                            onClick={() => {
                                                setFilterCity(city);
                                                setShowCityDropdown(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                                filterCity === city ? 'bg-blue-50 text-blue-600' : ''
                                            }`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search albums..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Close dropdowns when clicking outside */}
                {(showYearDropdown || showCityDropdown) && (
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => {
                            setShowYearDropdown(false);
                            setShowCityDropdown(false);
                        }}
                    />
                )}

                {/* Loading State */}
                {albumsLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}

                {/* No Albums */}
                {!albumsLoading && albums.length === 0 && (
                    <div className="text-center py-20">
                        <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Albums Found</h3>
                        <p className="text-gray-500">
                            {searchTerm || filterCategory !== "ALL" || filterYear || filterCity
                                ? "Try adjusting your search or filters"
                                : "Check back later for new photo albums"}
                        </p>
                    </div>
                )}

                {/* Album Grid */}
                {!albumsLoading && albums.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {albums.map((album) => (
                            <AlbumCard
                                key={album._id}
                                album={album}
                                onClick={() => handleAlbumClick(album)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!albumsLoading && renderPagination()}
            </div>

            {/* Upload Media Modal */}
            {showUploadModal && (
                <UploadMediaModal
                    onClose={() => setShowUploadModal(false)}
                />
            )}
        </section>
    );
}
