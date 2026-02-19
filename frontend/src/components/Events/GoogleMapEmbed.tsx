/**
 * @fileoverview Google Maps Component
 * Displays venue location with Google Maps links for directions.
 * Works with just venue name - no coordinates required.
 * 
 * @module components/Events/GoogleMapEmbed
 */

import { type JSX } from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";

interface GoogleMapEmbedProps {
    /** Venue name (required) - used for Google Maps search */
    venueName: string;
    /** Whether to show compact version */
    compact?: boolean;
}

/**
 * Generate Google Maps directions URL using venue name
 * Google Maps will automatically find the location
 */
const getDirectionsUrl = (venueName: string): string => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venueName)}`;
};

/**
 * Generate Google Maps search URL using venue name
 */
const getMapViewUrl = (venueName: string): string => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueName)}`;
};

export default function GoogleMapEmbed({ 
    venueName,
    compact = false
}: GoogleMapEmbedProps): JSX.Element {
    const directionsUrl = getDirectionsUrl(venueName);
    const mapViewUrl = getMapViewUrl(venueName);

    if (compact) {
        return (
            <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{venueName}</span>
                </div>
                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0"
                >
                    <Navigation className="w-4 h-4" />
                    Directions
                </a>
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
            {/* Location Info */}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">
                            {venueName}
                        </h4>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Click below to view on Google Maps
                        </p>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                    <a
                        href={mapViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View Map
                    </a>
                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                    </a>
                </div>
            </div>
        </div>
    );
}
