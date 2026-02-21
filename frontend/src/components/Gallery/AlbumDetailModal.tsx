/**
 * @fileoverview Album Detail Modal Component
 * Displays album information and media gallery with lightbox functionality.
 * 
 * @module components/Gallery/AlbumDetailModal
 */

import { type JSX, useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchAlbumMedia, uploadMediaToAlbum, deleteMedia } from "../../services/galleryService";
import type { Album, MediaItem } from "../../redux/slices/gallerySlice";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Loader2, Upload, Trash2, ZoomIn } from "lucide-react";

interface AlbumDetailModalProps {
    album: Album;
    onClose: () => void;
}

/** Format date to readable format */
const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
        weekday: "long",
        month: "long", 
        day: "numeric",
        year: "numeric" 
    });
};

export default function AlbumDetailModal({ album, onClose }: AlbumDetailModalProps): JSX.Element {
    const dispatch = useAppDispatch();
    const { albumMedia, mediaLoading, uploadLoading, mediaPagination } = useAppSelector((state) => state.gallery);
    const { user } = useAppSelector((state) => state.auth);

    const [lightboxImage, setLightboxImage] = useState<MediaItem | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number>(0);
    const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);

    // Check if user can upload/delete media
    const canManageMedia = user && (user.role === "ADMIN" || user.role === "EVENT_LEAD");

    // Navigate lightbox
    const navigateLightbox = useCallback((direction: number) => {
        const newIndex = lightboxIndex + direction;
        if (newIndex >= 0 && newIndex < albumMedia.length) {
            setLightboxIndex(newIndex);
            setLightboxImage(albumMedia[newIndex]);
        }
    }, [lightboxIndex, albumMedia]);

    // Fetch album media on mount
    useEffect(() => {
        dispatch(fetchAlbumMedia({ albumId: album._id, page: 1 }));
    }, [dispatch, album._id]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxImage) {
                if (e.key === "Escape") onClose();
                return;
            }

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
    }, [lightboxImage, navigateLightbox, onClose]);

    // Open lightbox
    const openLightbox = (media: MediaItem, index: number) => {
        setLightboxImage(media);
        setLightboxIndex(index);
    };

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploadFiles(e.target.files);
        }
    };

    const handleUpload = async () => {
        if (!uploadFiles || uploadFiles.length === 0) return;

        const files = Array.from(uploadFiles);
        await dispatch(uploadMediaToAlbum({ albumId: album._id, files }));
        setUploadFiles(null);

        // Reset file input
        const fileInput = document.getElementById("media-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    // Handle delete media
    const handleDeleteMedia = async (mediaId: string) => {
        if (window.confirm("Are you sure you want to delete this media?")) {
            await dispatch(deleteMedia({ albumId: album._id, mediaId }));
        }
    };

    // Load more media
    const handleLoadMore = () => {
        if (mediaPagination && mediaPagination.currentPage < mediaPagination.totalPages) {
            dispatch(fetchAlbumMedia({ 
                albumId: album._id, 
                page: mediaPagination.currentPage + 1 
            }));
        }
    };

    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                
                <div className="min-h-screen flex items-start justify-center p-4 pt-20">
                    <div className="relative bg-white rounded-2xl w-full max-w-5xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 flex-shrink-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 pr-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {album.title}
                                    </h2>
                                    
                                    {album.description && (
                                        <p className="text-gray-600 mb-3">{album.description}</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        {album.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4 text-blue-600" />
                                                <span>{album.location}</span>
                                            </div>
                                        )}

                                        {album.eventDate && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                                <span>{formatDate(album.eventDate)}</span>
                                            </div>
                                        )}

                                        <span className="text-gray-400">•</span>
                                        <span>{album.mediaCount} photos</span>

                                        {album.isFeatured && (
                                            <>
                                                <span className="text-gray-400">•</span>
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    Featured
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Upload Section */}
                            {canManageMedia && (
                                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                                    <input
                                        type="file"
                                        id="media-upload"
                                        multiple
                                        accept="image/*,video/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="media-upload"
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Select Files
                                    </label>
                                    
                                    {uploadFiles && uploadFiles.length > 0 && (
                                        <>
                                            <span className="text-sm text-gray-600">
                                                {uploadFiles.length} file(s) selected
                                            </span>
                                            <button
                                                onClick={handleUpload}
                                                disabled={uploadLoading}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                                            >
                                                {uploadLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Upload className="w-4 h-4" />
                                                )}
                                                Upload
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Media Grid */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {mediaLoading && albumMedia.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : albumMedia.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ZoomIn className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Photos Yet</h3>
                                    <p className="text-gray-500">
                                        {canManageMedia 
                                            ? "Upload some photos to this album"
                                            : "Check back later for photos"
                                        }
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {albumMedia.map((media, index) => (
                                            <div
                                                key={media._id}
                                                className="relative aspect-square group rounded-lg overflow-hidden"
                                            >
                                                <img
                                                    src={media.url}
                                                    alt={`Photo ${index + 1}`}
                                                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                                                    onClick={() => openLightbox(media, index)}
                                                />

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />

                                                {/* Zoom Icon */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <div className="bg-white/90 p-2 rounded-full">
                                                        <ZoomIn className="w-5 h-5 text-gray-700" />
                                                    </div>
                                                </div>

                                                {/* Delete Button (Admin only) */}
                                                {user?.role === "ADMIN" && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMedia(media._id);
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Load More */}
                                    {mediaPagination && mediaPagination.currentPage < mediaPagination.totalPages && (
                                        <div className="mt-6 text-center">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={mediaLoading}
                                                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                                            >
                                                {mediaLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : null}
                                                Load More Photos
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div className="fixed inset-0 z-60 bg-black flex items-center justify-center">
                    {/* Close button */}
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition z-10"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Navigation */}
                    {lightboxIndex > 0 && (
                        <button
                            onClick={() => navigateLightbox(-1)}
                            className="absolute left-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>
                    )}

                    {lightboxIndex < albumMedia.length - 1 && (
                        <button
                            onClick={() => navigateLightbox(1)}
                            className="absolute right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>
                    )}

                    {/* Image */}
                    <img
                        src={lightboxImage.url}
                        alt={`Photo ${lightboxIndex + 1}`}
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                    />

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                        {lightboxIndex + 1} / {albumMedia.length}
                    </div>
                </div>
            )}
        </>
    );
}
