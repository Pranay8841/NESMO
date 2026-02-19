/**
 * @fileoverview Events Redux Slice
 * Manages global events state including events list, event requests, and registrations.
 * 
 * @module redux/slices/eventsSlice
 */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/** Event type options */
export type EventType = "MEETUP" | "SESSION" | "CAMP";

/** Event mode options */
export type EventMode = "ONLINE" | "OFFLINE";

/** Event status */
export type EventStatus = "ACTIVE" | "CLOSED" | "CANCELLED";

/** Event request status */
export type EventRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Registration status */
export type RegistrationStatus = "PENDING" | "CONFIRMED" | "FAILED";

/**
 * Event data structure matching backend Event model.
 */
export interface Event {
    _id: string;
    createdBy: string | { _id: string; firstName: string; lastName: string };
    title: string;
    description: string;
    type: EventType;
    mode: EventMode;
    venue?: string;
    eventDate: string;
    registrationDeadline?: string;
    capacity?: number;
    isPaid: boolean;
    price?: number;
    currency: string;
    totalCollected: number;
    status: EventStatus;
    createdAt: string;
    updatedAt: string;
}

/**
 * Event request data structure matching backend EventRequest model.
 */
export interface EventRequest {
    _id: string;
    requestedBy: string | { _id: string; firstName: string; lastName: string; email: string };
    title: string;
    description: string;
    type: EventType;
    mode: EventMode;
    venue?: string;
    eventDate: string;
    expectedCapacity?: number;
    isPaid: boolean;
    price?: number;
    status: EventRequestStatus;
    adminRemark?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Event registration data structure.
 */
export interface EventRegistration {
    _id: string;
    event: string | Event;
    user: string;
    isPaid: boolean;
    amount?: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: RegistrationStatus;
    createdAt: string;
}

/**
 * Events state structure.
 */
interface EventsState {
    /** List of all public events */
    events: Event[];
    /** Currently selected event for detail view */
    selectedEvent: Event | null;
    /** User's event requests */
    myEventRequests: EventRequest[];
    /** User's event registrations */
    myRegistrations: EventRegistration[];
    /** Events created by user (for Event Leads) */
    myEvents: Event[];
    /** All event requests (for admin) */
    allEventRequests: EventRequest[];
    /** Loading states */
    loading: boolean;
    eventsLoading: boolean;
    requestsLoading: boolean;
}

const initialState: EventsState = {
    events: [],
    selectedEvent: null,
    myEventRequests: [],
    myRegistrations: [],
    myEvents: [],
    allEventRequests: [],
    loading: false,
    eventsLoading: false,
    requestsLoading: false,
};

export const eventsSlice = createSlice({
    name: "events",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setEventsLoading: (state, action: PayloadAction<boolean>) => {
            state.eventsLoading = action.payload;
        },
        setRequestsLoading: (state, action: PayloadAction<boolean>) => {
            state.requestsLoading = action.payload;
        },
        setEvents: (state, action: PayloadAction<Event[]>) => {
            state.events = action.payload;
        },
        setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
            state.selectedEvent = action.payload;
        },
        setMyEventRequests: (state, action: PayloadAction<EventRequest[]>) => {
            state.myEventRequests = action.payload;
        },
        setMyRegistrations: (state, action: PayloadAction<EventRegistration[]>) => {
            state.myRegistrations = action.payload;
        },
        setMyEvents: (state, action: PayloadAction<Event[]>) => {
            state.myEvents = action.payload;
        },
        setAllEventRequests: (state, action: PayloadAction<EventRequest[]>) => {
            state.allEventRequests = action.payload;
        },
        addEventRequest: (state, action: PayloadAction<EventRequest>) => {
            state.myEventRequests.unshift(action.payload);
        },
        addEvent: (state, action: PayloadAction<Event>) => {
            state.myEvents.unshift(action.payload);
            state.events.unshift(action.payload);
        },
        updateEventRequestStatus: (state, action: PayloadAction<{ id: string; status: EventRequestStatus; adminRemark?: string }>) => {
            const request = state.allEventRequests.find(r => r._id === action.payload.id);
            if (request) {
                request.status = action.payload.status;
                request.adminRemark = action.payload.adminRemark;
            }
        },
        addRegistration: (state, action: PayloadAction<EventRegistration>) => {
            state.myRegistrations.unshift(action.payload);
        },
        removeRegistration: (state, action: PayloadAction<string>) => {
            state.myRegistrations = state.myRegistrations.filter(
                (reg) => typeof reg.event === 'string' 
                    ? reg.event !== action.payload 
                    : reg.event._id !== action.payload
            );
        },
    },
});

export const {
    setLoading,
    setEventsLoading,
    setRequestsLoading,
    setEvents,
    setSelectedEvent,
    setMyEventRequests,
    setMyRegistrations,
    setMyEvents,
    setAllEventRequests,
    addEventRequest,
    addEvent,
    updateEventRequestStatus,
    addRegistration,
    removeRegistration,
} = eventsSlice.actions;

export default eventsSlice.reducer;
