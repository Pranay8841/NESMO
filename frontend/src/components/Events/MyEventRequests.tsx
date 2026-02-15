/**
 * @fileoverview My Event Requests Component
 * Shows user's submitted event requests and their status.
 * 
 * @module components/Events/MyEventRequests
 */

import { type JSX, useEffect } from "react";
import { 
    Calendar, MapPin, Video, Users, IndianRupee, 
    Clock, CheckCircle, XCircle, Loader2, FileText
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchMyEventRequests } from "../../services/eventsService";
import type { EventRequestStatus } from "../../redux/slices/eventsSlice";

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

/**
 * Get status badge styles
 */
const getStatusBadge = (status: EventRequestStatus) => {
    switch (status) {
        case "PENDING":
            return { 
                bg: "bg-yellow-100", 
                text: "text-yellow-700", 
                icon: Clock,
                label: "Under Review"
            };
        case "APPROVED":
            return { 
                bg: "bg-green-100", 
                text: "text-green-700", 
                icon: CheckCircle,
                label: "Approved"
            };
        case "REJECTED":
            return { 
                bg: "bg-red-100", 
                text: "text-red-700", 
                icon: XCircle,
                label: "Rejected"
            };
    }
};

export default function MyEventRequests(): JSX.Element {
    const dispatch = useAppDispatch();
    const { myEventRequests, requestsLoading } = useAppSelector((state) => state.events);

    useEffect(() => {
        dispatch(fetchMyEventRequests());
    }, [dispatch]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Event Requests</h1>
                <p className="text-gray-600 mt-1">Track the status of your event creation requests</p>
            </div>

            {/* Loading */}
            {requestsLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* Empty State */}
            {!requestsLoading && myEventRequests.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        You haven't submitted any event requests. Go to the Events page to request hosting an event.
                    </p>
                </div>
            )}

            {/* Requests List */}
            {!requestsLoading && myEventRequests.length > 0 && (
                <div className="space-y-4">
                    {myEventRequests.map((request) => {
                        const statusBadge = getStatusBadge(request.status);
                        const StatusIcon = statusBadge.icon;
                        
                        return (
                            <div 
                                key={request._id} 
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                <div className="p-4">
                                    {/* Status and Type */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {statusBadge.label}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                            {request.type}
                                        </span>
                                        <span className={`flex items-center gap-1 text-xs ${
                                            request.mode === "ONLINE" ? "text-green-600" : "text-blue-600"
                                        }`}>
                                            {request.mode === "ONLINE" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                            {request.mode}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h3>
                                    
                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{request.description}</p>

                                    {/* Details */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            {formatDate(request.eventDate)}
                                        </span>
                                        {request.expectedCapacity && (
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {request.expectedCapacity} expected
                                            </span>
                                        )}
                                        <span className={`flex items-center gap-1 ${request.isPaid ? "text-blue-600" : "text-green-600"}`}>
                                            {request.isPaid ? (
                                                <>
                                                    <IndianRupee className="w-4 h-4" />
                                                    {request.price}
                                                </>
                                            ) : (
                                                "Free"
                                            )}
                                        </span>
                                    </div>

                                    {/* Venue */}
                                    {request.mode === "OFFLINE" && request.venue && (
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            {request.venue}
                                        </div>
                                    )}

                                    {/* Admin Remark */}
                                    {request.adminRemark && (
                                        <div className={`mt-4 p-3 rounded-lg ${
                                            request.status === "APPROVED" 
                                                ? "bg-green-50 border border-green-200" 
                                                : "bg-red-50 border border-red-200"
                                        }`}>
                                            <p className={`text-sm font-medium ${
                                                request.status === "APPROVED" ? "text-green-700" : "text-red-700"
                                            }`}>
                                                Admin Remark:
                                            </p>
                                            <p className={`text-sm ${
                                                request.status === "APPROVED" ? "text-green-600" : "text-red-600"
                                            }`}>
                                                {request.adminRemark}
                                            </p>
                                        </div>
                                    )}

                                    {/* Approved Message */}
                                    {request.status === "APPROVED" && !request.adminRemark && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-700">
                                                🎉 Your request has been approved! You are now an Event Lead and can create events.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                        Submitted on {formatDate(request.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
