/**
 * @fileoverview Admin Event Requests Component
 * Admin panel for reviewing and managing event creation requests.
 * 
 * @module components/Admin/EventRequests
 */

import { type JSX, useEffect, useState } from "react";
import { 
    Calendar, MapPin, Video, Users, IndianRupee, 
    CheckCircle, XCircle, Clock, Loader2, Filter,
    ChevronDown, ChevronUp, User, Mail
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchAllEventRequests, reviewEventRequest } from "../../services/eventsService";
import type { EventRequest, EventRequestStatus } from "../../redux/slices/eventsSlice";

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
            return { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock };
        case "APPROVED":
            return { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle };
        case "REJECTED":
            return { bg: "bg-red-100", text: "text-red-700", icon: XCircle };
    }
};

/**
 * Get type badge color
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

interface RequestCardProps {
    request: EventRequest;
    onReview: (id: string, status: "APPROVED" | "REJECTED", remark?: string) => void;
    processing: boolean;
}

function RequestCard({ request, onReview, processing }: RequestCardProps): JSX.Element {
    const [expanded, setExpanded] = useState(false);
    const [adminRemark, setAdminRemark] = useState("");
    const [showReviewForm, setShowReviewForm] = useState(false);

    const statusBadge = getStatusBadge(request.status);
    const StatusIcon = statusBadge.icon;

    const requesterName = typeof request.requestedBy === "object"
        ? `${request.requestedBy.firstName} ${request.requestedBy.lastName}`
        : "Unknown User";
    
    const requesterEmail = typeof request.requestedBy === "object"
        ? request.requestedBy.email
        : "";

    const handleApprove = () => {
        onReview(request._id, "APPROVED", adminRemark || undefined);
    };

    const handleReject = () => {
        onReview(request._id, "REJECTED", adminRemark || undefined);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(request.type)}`}>
                                {request.type}
                            </span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                <StatusIcon className="w-3 h-3" />
                                {request.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Submitted on {formatDate(request.createdAt)}
                        </p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        {expanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                    {/* Requester Info */}
                    <div className="flex items-center gap-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">{requesterName}</span>
                        </div>
                        {requesterEmail && (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">{requesterEmail}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="py-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{request.description}</p>
                    </div>

                    {/* Event Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">{formatDate(request.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            {request.mode === "ONLINE" ? (
                                <Video className="w-4 h-4 text-green-600" />
                            ) : (
                                <MapPin className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="text-gray-700">{request.mode}</span>
                        </div>
                        {request.expectedCapacity && (
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{request.expectedCapacity} expected</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <IndianRupee className="w-4 h-4 text-gray-500" />
                            <span className={request.isPaid ? "text-blue-600 font-medium" : "text-green-600"}>
                                {request.isPaid ? `₹${request.price}` : "Free"}
                            </span>
                        </div>
                    </div>

                    {/* Venue for offline */}
                    {request.mode === "OFFLINE" && request.venue && (
                        <div className="py-2 text-sm text-gray-600">
                            <span className="font-medium">Venue:</span> {request.venue}
                        </div>
                    )}

                    {/* Admin Remark (if reviewed) */}
                    {request.status !== "PENDING" && request.adminRemark && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Admin Remark</h4>
                            <p className="text-gray-600 text-sm">{request.adminRemark}</p>
                        </div>
                    )}

                    {/* Review Actions (only for pending) */}
                    {request.status === "PENDING" && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            {!showReviewForm ? (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    Review this request →
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Admin Remark (optional)
                                        </label>
                                        <textarea
                                            value={adminRemark}
                                            onChange={(e) => setAdminRemark(e.target.value)}
                                            rows={2}
                                            placeholder="Add a note for the requester..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleApprove}
                                            disabled={processing}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
                                        >
                                            {processing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Approve
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={processing}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
                                        >
                                            {processing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )}
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => setShowReviewForm(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function EventRequests(): JSX.Element {
    const dispatch = useAppDispatch();
    const { allEventRequests, requestsLoading } = useAppSelector((state) => state.events);
    const [filterStatus, setFilterStatus] = useState<EventRequestStatus | "ALL">("PENDING");
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const status = filterStatus === "ALL" ? undefined : filterStatus;
        dispatch(fetchAllEventRequests(status));
    }, [dispatch, filterStatus]);

    const handleReview = async (id: string, status: "APPROVED" | "REJECTED", remark?: string) => {
        setProcessingId(id);
        try {
            await dispatch(reviewEventRequest({ requestId: id, status, adminRemark: remark })).unwrap();
        } finally {
            setProcessingId(null);
        }
    };

    const pendingCount = allEventRequests.filter(r => r.status === "PENDING").length;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Event Requests</h1>
                    <p className="text-gray-600 mt-1">
                        Review and manage event creation requests from users
                    </p>
                </div>
                
                {/* Filter */}
                <div className="mt-4 md:mt-0 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as EventRequestStatus | "ALL")}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                        <option value="ALL">All Requests</option>
                        <option value="PENDING">Pending ({pendingCount})</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Loading */}
            {requestsLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* Empty State */}
            {!requestsLoading && allEventRequests.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Found</h3>
                    <p className="text-gray-500">
                        {filterStatus !== "ALL" 
                            ? `No ${filterStatus.toLowerCase()} requests at the moment`
                            : "No event requests have been submitted yet"}
                    </p>
                </div>
            )}

            {/* Requests List */}
            {!requestsLoading && allEventRequests.length > 0 && (
                <div className="space-y-4">
                    {allEventRequests.map((request) => (
                        <RequestCard
                            key={request._id}
                            request={request}
                            onReview={handleReview}
                            processing={processingId === request._id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
