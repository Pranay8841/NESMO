/**
 * @fileoverview Album Detail Page
 * Full page view displaying album information and photo gallery with lightbox.
 * 
 * @module pages/AlbumDetail
 */

import { type JSX, useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchAlbumById, fetchAlbumMedia, uploadMediaToAlbum, deleteMedia } from "../services/galleryService";
import { clearAlbumMedia } from "../redux/slices/gallerySlice";
import type { MediaItem } from "../redux/slices/gallerySlice";
import { 
    ArrowLeft, 
    X, 
    ChevronLeft, 
    ChevronRight, 
    MapPin, 
    Calendar, 
    Loader2, 
    Upload, 
    Trash2,
    Image,
    Share2,
    RefreshCw,
    Download,
    Flag,
    User
} from "lucide-react";
import toast from "react-hot-toast";

/** Format date to full readable format */
const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
        month: "long", 
        day: "numeric",
        year: "numeric" 
    });
};

export default function AlbumDetailPage(): JSX.Element {
    const { albumId } = useParams<{ albumId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    const { selectedAlbum, albumMedia, mediaLoading, albumsLoading, uploadLoading, mediaPagination } = useAppSelector((state) => state.gallery);
    const { user } = useAppSelector((state) => state.auth);

    const [lightboxImage, setLightboxImage] = useState<MediaItem | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number>(0);
    const [loadingAllMedia, setLoadingAllMedia] = useState<boolean>(false);

    // Check if user can upload media (Admin or Event Lead)
    const canUploadMedia = user && (user.role === "ADMIN" || user.role === "EVENT_LEAD");

    // Check if user can delete a specific media item (Admin or original uploader)
    const canDeleteMedia = (media: MediaItem): boolean => {
        if (!user) return false;
        if (user.role === "ADMIN") return true;
        
        // Check if user is the uploader
        const uploaderId = typeof media.uploadedBy === 'object' 
            ? media.uploadedBy._id 
            : media.uploadedBy;
        return uploaderId === user._id;
    };

    // Navigate lightbox
    const navigateLightbox = useCallback((direction: number) => {
        const newIndex = lightboxIndex + direction;
        if (newIndex >= 0 && newIndex < albumMedia.length) {
            setLightboxIndex(newIndex);
            setLightboxImage(albumMedia[newIndex]);
        }
    }, [lightboxIndex, albumMedia]);

    // Keep lightbox image in sync when more media is loaded
    useEffect(() => {
        if (lightboxImage && albumMedia[lightboxIndex]) {
            setLightboxImage(albumMedia[lightboxIndex]);
        }
    }, [albumMedia, lightboxIndex, lightboxImage]);

    // Fetch album and media on mount
    useEffect(() => {
        if (albumId) {
            dispatch(fetchAlbumById(albumId));
            dispatch(fetchAlbumMedia({ albumId, page: 1 }));
        }

        // Cleanup on unmount
        return () => {
            dispatch(clearAlbumMedia());
        };
    }, [dispatch, albumId]);

    // Handle keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxImage) return;

            switch (e.key) {
                case "Escape":
                    setLightboxImage(null);
                    break;
                case "ArrowLeft":
                    navigateLightbox(-1);
                    break;
                case "ArrowRight":
                    navigateLightbox(1);
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [lightboxImage, navigateLightbox]);

    // Open lightbox and load all remaining media if needed
    const openLightbox = async (index: number) => {
        setLightboxImage(albumMedia[index]);
        setLightboxIndex(index);

        // If there are more pages, load all remaining images for seamless navigation
        if (albumId && mediaPagination && mediaPagination.currentPage < mediaPagination.totalPages) {
            setLoadingAllMedia(true);
            try {
                // Fetch remaining pages sequentially
                for (let page = mediaPagination.currentPage + 1; page <= mediaPagination.totalPages; page++) {
                    await dispatch(fetchAlbumMedia({ albumId, page }));
                }
            } finally {
                setLoadingAllMedia(false);
            }
        }
    };

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !albumId) return;
        
        const files = Array.from(e.target.files);
        await dispatch(uploadMediaToAlbum({ albumId, files }));
        
        // Reset file input
        e.target.value = "";
    };

    // Handle delete media
    const handleDeleteMedia = async (mediaId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!albumId) return;
        if (window.confirm("Are you sure you want to delete this photo?")) {
            await dispatch(deleteMedia({ albumId, mediaId }));
        }
    };

    // Load more media
    const handleLoadMore = () => {
        if (albumId && mediaPagination && mediaPagination.currentPage < mediaPagination.totalPages) {
            dispatch(fetchAlbumMedia({ 
                albumId, 
                page: mediaPagination.currentPage + 1 
            }));
        }
    };

    // Handle share album
    const handleShareAlbum = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: selectedAlbum?.title,
                    text: selectedAlbum?.description || `Check out this album: ${selectedAlbum?.title}`,
                    url
                });
            } catch {
                // User cancelled or share failed
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        }
    };

    // Loading state
    if (albumsLoading && !selectedAlbum) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    // Album not found
    if (!selectedAlbum && !albumsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <Image className="w-16 h-16 text-gray-300" />
                <p className="text-gray-600 text-lg">Album not found</p>
                <button 
                    onClick={() => navigate("/gallery")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Albums
                </button>
            </div>
        );
    }

    const hasMoreMedia = mediaPagination && mediaPagination.currentPage < mediaPagination.totalPages;
    const photoCount = selectedAlbum?.mediaCount || albumMedia.length;

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate("/gallery")}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Albums</span>
                    </button>

                    {/* Album Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                        <div>
                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                {selectedAlbum?.title}
                            </h1>

                            {/* Meta Info Row */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500">
                                {selectedAlbum?.eventDate && (
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        {formatDate(selectedAlbum.eventDate)}
                                    </span>
                                )}
                                {selectedAlbum?.location && (
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        {selectedAlbum.location}
                                    </span>
                                )}
                                <span className="flex items-center gap-2">
                                    <Image className="w-5 h-5" />
                                    {photoCount} {photoCount === 1 ? "Photo" : "Photos"}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShareAlbum}
                                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                Share Album
                            </button>

                            {/* Upload Button - Admin/Event Lead only */}
                            {canUploadMedia && (
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={uploadLoading}
                                    />
                                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                                        uploadLoading 
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}>
                                        {uploadLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                Add Photos
                                            </>
                                        )}
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Photo Grid - Masonry Style */}
                    {mediaLoading && albumMedia.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : albumMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Image className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-lg">No photos in this album yet</p>
                            {canUploadMedia && (
                                <p className="text-sm mt-2">Add photos using the button above</p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {albumMedia.map((media, index) => (
                                    <div 
                                        key={media._id} 
                                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-200 cursor-pointer"
                                        onClick={() => openLightbox(index)}
                                    >
                                        <img 
                                            src={media.url} 
                                            alt={`Photo ${index + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                        
                                        {/* Delete button - Admin or original uploader only */}
                                        {canDeleteMedia(media) && (
                                            <button
                                                onClick={(e) => handleDeleteMedia(media._id, e)}
                                                className="absolute top-3 right-3 p-2 bg-red-500/90 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Load More Button */}
                            {hasMoreMedia && (
                                <div className="flex justify-center mt-10">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={mediaLoading}
                                        className="flex items-center gap-2 px-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        {mediaLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-5 h-5" />
                                                Load More Photos
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between p-4">
                        {/* Counter */}
                        <div className="bg-gray-800/80 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                            {lightboxIndex + 1} of {mediaPagination?.totalMedia || albumMedia.length}
                            {loadingAllMedia && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="p-2 text-white/80 hover:text-white bg-gray-800/80 hover:bg-gray-700 rounded-full transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Image Container */}
                    <div className="flex-1 flex items-center justify-center relative px-16">
                        {/* Navigation - Previous */}
                        {lightboxIndex > 0 && (
                            <button
                                onClick={() => navigateLightbox(-1)}
                                className="absolute left-4 p-3 text-white/80 hover:text-white bg-gray-800/50 hover:bg-gray-700/80 rounded-full transition"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Image */}
                        <img
                            src={lightboxImage.url}
                            alt={`Photo ${lightboxIndex + 1}`}
                            className="max-h-[calc(100vh-200px)] max-w-full object-contain rounded-xl"
                        />

                        {/* Navigation - Next */}
                        {lightboxIndex < albumMedia.length - 1 && (
                            <button
                                onClick={() => navigateLightbox(1)}
                                className="absolute right-4 p-3 text-white/80 hover:text-white bg-gray-800/50 hover:bg-gray-700/80 rounded-full transition"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Bottom Info Panel */}
                    <div className="p-6 flex items-end justify-between">
                        <div className="text-white max-w-2xl">
                            {/* Album Title */}
                            <h3 className="text-xl font-bold mb-1">{selectedAlbum?.title}</h3>
                            
                            {/* Description */}
                            {selectedAlbum?.description && (
                                <p className="text-gray-300 text-sm mb-2">{selectedAlbum.description}</p>
                            )}
                            
                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-gray-400 text-sm">
                                {selectedAlbum?.eventDate && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(selectedAlbum.eventDate)}
                                    </span>
                                )}
                                {typeof lightboxImage.uploadedBy === 'object' && lightboxImage.uploadedBy && (
                                    <>
                                        <span className="text-gray-500">•</span>
                                        <span className="flex items-center gap-1.5">
                                            <User className="w-4 h-4" />
                                            Uploaded by {lightboxImage.uploadedBy.firstName} {lightboxImage.uploadedBy.lastName}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <a
                                href={lightboxImage.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </a>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
                            >
                                <Flag className="w-4 h-4" />
                                Report
                            </button>
                            <button
                                onClick={handleShareAlbum}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
