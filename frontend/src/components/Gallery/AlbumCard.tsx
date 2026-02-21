/**
 * @fileoverview Album Card Component
 * Displays album thumbnail with cover image, title, location, date, and photo count.
 * 
 * @module components/Gallery/AlbumCard
 */

import { type JSX } from "react";
import { MapPin, Calendar, Image } from "lucide-react";
import type { Album } from "../../redux/slices/gallerySlice";

interface AlbumCardProps {
    album: Album;
    onClick: () => void;
}

/** Default placeholder image */
const DEFAULT_COVER = "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop";

/** Format date to display format */
const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function AlbumCard({ album, onClick }: AlbumCardProps): JSX.Element {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
            {/* Cover Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={album.coverImage || DEFAULT_COVER}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Photo Count Badge */}
                <div className="absolute top-3 right-3 bg-gray-900/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {album.mediaCount} Photos
                </div>

                {/* Featured Badge */}
                {album.isFeatured && (
                    <div className="absolute bottom-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Featured
                    </div>
                )}
            </div>

            {/* Album Info */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {album.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {album.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{album.location}</span>
                        </div>
                    )}

                    {album.eventDate && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(album.eventDate)}</span>
                        </div>
                    )}

                    {!album.location && !album.eventDate && (
                        <div className="flex items-center gap-1">
                            <Image className="w-4 h-4" />
                            <span>{album.mediaCount} photos</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
