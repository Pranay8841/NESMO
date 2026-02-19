/**
 * @fileoverview Events Page
 * Public page displaying all active events with filtering and detail modal.
 * 
 * @module pages/Events
 */

import { type JSX, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchEvents } from "../services/eventsService";
import EventCard from "../components/Events/EventCard";
import EventDetailModal from "../components/Events/EventDetailModal";
import EventRequestModal from "../components/Events/EventRequestModal";
import { Calendar, Filter, Plus, Search, Loader2 } from "lucide-react";
import type { Event, EventType, EventMode } from "../redux/slices/eventsSlice";

export default function EventsPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { events, eventsLoading } = useAppSelector((state) => state.events);
  const { user } = useAppSelector((state) => state.auth);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<EventType | "ALL">("ALL");
  const [filterMode, setFilterMode] = useState<EventMode | "ALL">("ALL");

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || event.type === filterType;
    const matchesMode = filterMode === "ALL" || event.mode === filterMode;
    return matchesSearch && matchesType && matchesMode;
  });

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = filteredEvents.filter(e => new Date(e.eventDate) >= now);
  const pastEvents = filteredEvents.filter(e => new Date(e.eventDate) < now);

  return (
    <section className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Events</h1>
            <p className="text-gray-600">
              Discover and join NESMO community events and activities
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Request to Host Event
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as EventType | "ALL")}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="ALL">All Types</option>
                <option value="MEETUP">Meetup</option>
                <option value="SESSION">Session</option>
                <option value="CAMP">Camp</option>
              </select>
            </div>

            {/* Mode Filter */}
            <div>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as EventMode | "ALL")}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="ALL">All Modes</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {eventsLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* No Events */}
        {!eventsLoading && filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== "ALL" || filterMode !== "ALL"
                ? "Try adjusting your search or filters"
                : "Check back later for upcoming events"}
            </p>
          </div>
        )}

        {/* Upcoming Events */}
        {!eventsLoading && upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {!eventsLoading && pastEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Past Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
              {pastEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                  isPast
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Event Request Modal */}
      {showRequestModal && (
        <EventRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </section>
  );
}
