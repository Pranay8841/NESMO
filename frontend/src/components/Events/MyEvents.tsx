/**
 * @fileoverview My Events Page (Event Lead Dashboard)
 * Dashboard for Event Leads to manage their created events.
 * 
 * @module components/Events/MyEvents
 */

import { type JSX, useEffect, useState, useCallback } from "react";
import { 
    Calendar, MapPin, Video, Users, IndianRupee, Plus,
    Loader2, BarChart3, Clock, CheckCircle
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchMyCreatedEvents, fetchEventDashboard } from "../../services/eventsService";
import CreateEventModal from "./CreateEventModal";
import type { Event } from "../../redux/slices/eventsSlice";

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
 * Get status badge color
 */
const getStatusBadge = (status: string) => {
    switch (status) {
        case "ACTIVE":
            return { bg: "bg-green-100", text: "text-green-700" };
        case "CLOSED":
            return { bg: "bg-gray-100", text: "text-gray-700" };
        case "CANCELLED":
            return { bg: "bg-red-100", text: "text-red-700" };
        default:
            return { bg: "bg-gray-100", text: "text-gray-700" };
    }
};

interface EventDashboardData {
    totalRegistrations: number;
    totalAmount: number;
}

interface EventRowProps {
    event: Event;
    onViewDashboard: (event: Event) => void;
}

function EventRow({ event, onViewDashboard }: EventRowProps): JSX.Element {
    const statusBadge = getStatusBadge(event.status);
    const isPast = new Date(event.eventDate) < new Date();

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            {event.status}
                        </span>
                        {isPast && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                Past
                            </span>
                        )}
                        <span className={`flex items-center gap-1 text-xs ${
                            event.mode === "ONLINE" ? "text-green-600" : "text-blue-600"
                        }`}>
                            {event.mode === "ONLINE" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {event.mode}
                        </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(event.eventDate)}
                        </span>
                        {event.capacity && (
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {event.capacity} spots
                            </span>
                        )}
                        <span className={`flex items-center gap-1 ${event.isPaid ? "text-blue-600" : "text-green-600"}`}>
                            {event.isPaid ? (
                                <>
                                    <IndianRupee className="w-4 h-4" />
                                    {event.price}
                                </>
                            ) : (
                                "Free"
                            )}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewDashboard(event)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

interface DashboardModalProps {
    event: Event;
    onClose: () => void;
}

function DashboardModal({ event, onClose }: DashboardModalProps): JSX.Element {
    const dispatch = useAppDispatch();
    const [dashboardData, setDashboardData] = useState<EventDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const data = await dispatch(fetchEventDashboard(event._id)).unwrap();
            setDashboardData(data);
        } finally {
            setLoading(false);
        }
    }, [dispatch, event._id]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
                        <p className="text-gray-500 text-sm mt-1">Event Dashboard</p>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : dashboardData ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-xl p-4 text-center">
                                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-blue-700">
                                        {dashboardData.totalRegistrations}
                                    </p>
                                    <p className="text-blue-600 text-sm">Registrations</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <IndianRupee className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-green-700">
                                        ₹{dashboardData.totalAmount}
                                    </p>
                                    <p className="text-green-600 text-sm">Collected</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Unable to load dashboard data</p>
                        )}

                        {/* Event Details */}
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Event Date</span>
                                <span className="font-medium">{formatDate(event.eventDate)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Mode</span>
                                <span className="font-medium">{event.mode}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Capacity</span>
                                <span className="font-medium">{event.capacity || "Unlimited"}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Price</span>
                                <span className="font-medium">
                                    {event.isPaid ? `₹${event.price}` : "Free"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MyEvents(): JSX.Element {
    const dispatch = useAppDispatch();
    const { myEvents, eventsLoading } = useAppSelector((state) => state.events);
    const { user } = useAppSelector((state) => state.auth);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const canCreateEvent = user?.role === "EVENT_LEAD" || user?.role === "ADMIN";

    useEffect(() => {
        if (canCreateEvent) {
            dispatch(fetchMyCreatedEvents());
        }
    }, [dispatch, canCreateEvent]);

    // Separate active and past events
    const now = new Date();
    const activeEvents = myEvents.filter(e => e.status === "ACTIVE" && new Date(e.eventDate) >= now);
    const pastEvents = myEvents.filter(e => e.status !== "ACTIVE" || new Date(e.eventDate) < now);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
                    <p className="text-gray-600 mt-1">Manage events you've created</p>
                </div>
                {canCreateEvent && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Event
                    </button>
                )}
            </div>

            {/* Loading */}
            {eventsLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* Not Event Lead */}
            {!canCreateEvent && (
                <div className="text-center py-12 bg-white rounded-xl">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Become an Event Lead
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Submit an event request from the Events page. Once approved by admin, 
                        you'll become an Event Lead and can create events.
                    </p>
                </div>
            )}

            {/* Empty State */}
            {canCreateEvent && !eventsLoading && myEvents.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first event to get started</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Event
                    </button>
                </div>
            )}

            {/* Active Events */}
            {canCreateEvent && !eventsLoading && activeEvents.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Active Events ({activeEvents.length})
                    </h2>
                    <div className="space-y-3">
                        {activeEvents.map((event) => (
                            <EventRow 
                                key={event._id} 
                                event={event} 
                                onViewDashboard={setSelectedEvent}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Past Events */}
            {canCreateEvent && !eventsLoading && pastEvents.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Past & Closed Events ({pastEvents.length})
                    </h2>
                    <div className="space-y-3 opacity-75">
                        {pastEvents.map((event) => (
                            <EventRow 
                                key={event._id} 
                                event={event} 
                                onViewDashboard={setSelectedEvent}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {showCreateModal && (
                <CreateEventModal onClose={() => setShowCreateModal(false)} />
            )}

            {/* Dashboard Modal */}
            {selectedEvent && (
                <DashboardModal 
                    event={selectedEvent} 
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </div>
    );
}
