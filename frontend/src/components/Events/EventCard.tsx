/**
 * @fileoverview Event Card Component
 * Displays a single event in a card format for listings.
 * 
 * @module components/Events/EventCard
 */

import { type JSX } from "react";
import { Calendar, MapPin, Users, Video, IndianRupee, Clock } from "lucide-react";
import type { Event } from "../../redux/slices/eventsSlice";

interface EventCardProps {
    event: Event;
    onClick: () => void;
    isPast?: boolean;
}

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

/**
 * Format time for display
 */
const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Get badge color based on event type
 */
const getTypeBadgeColor = (type: string): string => {
    switch (type) {
        case "MEETUP":
            return "bg-blue-100 text-blue-700";
        case "SESSION":
            return "bg-purple-100 text-purple-700";
        case "CAMP":
            return "bg-green-100 text-green-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

export default function EventCard({ event, onClick, isPast }: EventCardProps): JSX.Element {
    const isRegistrationClosed = event.registrationDeadline && 
        new Date(event.registrationDeadline) < new Date();

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-100 ${
                isPast ? "opacity-75" : ""
            }`}
        >
            {/* Event Type Badge */}
            <div className="p-4 pb-0">
                <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(event.type)}`}>
                        {event.type}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${
                        event.mode === "ONLINE" ? "text-green-600" : "text-blue-600"
                    }`}>
                        {event.mode === "ONLINE" ? (
                            <Video className="w-3.5 h-3.5" />
                        ) : (
                            <MapPin className="w-3.5 h-3.5" />
                        )}
                        {event.mode}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 pt-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                </p>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{formatDate(event.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{formatTime(event.eventDate)}</span>
                </div>

                {/* Venue for offline events */}
                {event.mode === "OFFLINE" && event.venue && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm truncate">{event.venue}</span>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    {/* Capacity */}
                    {event.capacity && (
                        <div className="flex items-center gap-1 text-gray-500">
                            <Users className="w-4 h-4" />
                            <span className="text-xs">{event.capacity} spots</span>
                        </div>
                    )}

                    {/* Price */}
                    <div className={`flex items-center gap-1 font-semibold ${
                        event.isPaid ? "text-blue-600" : "text-green-600"
                    }`}>
                        {event.isPaid ? (
                            <>
                                <IndianRupee className="w-4 h-4" />
                                <span>{event.price}</span>
                            </>
                        ) : (
                            <span className="text-sm">Free</span>
                        )}
                    </div>
                </div>

                {/* Status indicators */}
                {isPast && (
                    <div className="mt-3 text-center">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Event Ended
                        </span>
                    </div>
                )}
                {!isPast && isRegistrationClosed && (
                    <div className="mt-3 text-center">
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                            Registration Closed
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
