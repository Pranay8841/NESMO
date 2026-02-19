/**
 * @fileoverview Events Service
 * Redux async thunks for events-related operations.
 * Handles fetching events, event requests, registrations, and payments.
 * 
 * @module services/eventsService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestHeaders, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
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
    updateEventInState,
    removeEventFromState,
    updateEventRequestStatus,
    addRegistration,
    removeRegistration,
} from '../redux/slices/eventsSlice';
import type { Event, EventRequest, EventRegistration } from '../redux/slices/eventsSlice';
import { apiConnector } from '../utils/APIsConnector';
import { EVENTS_API, ADMIN_API } from '../utils/api';

/* ==================== Public Events ==================== */

/**
 * Fetch all public active events.
 */
export const fetchEvents = createAsyncThunk(
    'events/fetchEvents',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setEventsLoading(true));
            const response = await apiConnector('GET', EVENTS_API.GET_EVENTS);
            dispatch(setEvents(response.data.data));
            dispatch(setEventsLoading(false));
            return response.data.data;
        } catch (error) {
            dispatch(setEventsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch events';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch single event by ID.
 */
export const fetchEventById = createAsyncThunk(
    'events/fetchEventById',
    async (eventId: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setEventsLoading(true));
            const response = await apiConnector('GET', `${EVENTS_API.GET_EVENT_BY_ID}/${eventId}`);
            dispatch(setSelectedEvent(response.data.data));
            dispatch(setEventsLoading(false));
            return response.data.data as Event;
        } catch (error) {
            dispatch(setEventsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch event';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/* ==================== Event Requests ==================== */

interface EventRequestData {
    title: string;
    description: string;
    type: 'MEETUP' | 'SESSION' | 'CAMP';
    mode: 'ONLINE' | 'OFFLINE';
    venue?: string;
    eventDate: string;
    expectedCapacity?: number;
    isPaid: boolean;
    price?: number;
}

/**
 * Submit an event creation request.
 */
export const submitEventRequest = createAsyncThunk(
    'events/submitEventRequest',
    async (requestData: EventRequestData, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Submitting event request...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'POST',
                EVENTS_API.REQUEST_EVENT_CREATION,
                requestData,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(addEventRequest(response.data.data));
            toast.success('Event request submitted successfully!', { id: toastId });
            return response.data.data as EventRequest;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to submit request';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch user's own event requests.
 */
export const fetchMyEventRequests = createAsyncThunk(
    'events/fetchMyEventRequests',
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setRequestsLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'GET',
                EVENTS_API.GET_MY_EVENT_REQUESTS,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(setMyEventRequests(response.data.data));
            dispatch(setRequestsLoading(false));
            return response.data.data as EventRequest[];
        } catch (error) {
            dispatch(setRequestsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch requests';
            return rejectWithValue(errorMessage);
        }
    }
);

/* ==================== Event Registration ==================== */

/**
 * Register for a free event.
 */
export const registerForEvent = createAsyncThunk(
    'events/registerForEvent',
    async (eventId: string, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Registering for event...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'POST',
                `${EVENTS_API.REGISTER_FOR_EVENT}/${eventId}/register`,
                {},
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(addRegistration(response.data.data));
            toast.success('Successfully registered for event!', { id: toastId });
            return response.data.data as EventRegistration;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Registration failed';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Unregister from an event.
 */
export const unregisterFromEvent = createAsyncThunk(
    'events/unregisterFromEvent',
    async (eventId: string, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Cancelling registration...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            await apiConnector(
                'DELETE',
                `${EVENTS_API.UNREGISTER_FROM_EVENT}/${eventId}/unregister`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(removeRegistration(eventId));
            toast.success('Successfully unregistered from event', { id: toastId });
            return eventId;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to unregister';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Check registration status for an event.
 */
export const checkRegistrationStatus = createAsyncThunk(
    'events/checkRegistrationStatus',
    async (eventId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'GET',
                `${EVENTS_API.GET_REGISTRATION_STATUS}/${eventId}/registration-status`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            return response.data as { isRegistered: boolean; registration: EventRegistration | null };
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            return rejectWithValue(axiosError.response?.data?.message || 'Failed to check status');
        }
    }
);

/**
 * Fetch user's event registrations.
 */
export const fetchMyRegistrations = createAsyncThunk(
    'events/fetchMyRegistrations',
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'GET',
                EVENTS_API.GET_MY_REGISTRATIONS,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(setMyRegistrations(response.data.data));
            return response.data.data as EventRegistration[];
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch registrations');
        }
    }
);

/* ==================== Payment ==================== */

interface PaymentOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    registrationId: string;
    key: string;
}

/**
 * Create payment order for paid event.
 */
export const createEventPaymentOrder = createAsyncThunk(
    'events/createEventPaymentOrder',
    async (eventId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'POST',
                `${EVENTS_API.CREATE_EVENT_PAYMENT_ORDER}/${eventId}/payment/create-order`,
                {},
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            return response.data.data as PaymentOrderResponse;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to create payment order';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

interface VerifyPaymentData {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    registrationId: string;
}

/**
 * Verify event payment.
 */
export const verifyEventPayment = createAsyncThunk(
    'events/verifyEventPayment',
    async (paymentData: VerifyPaymentData, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Verifying payment...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'POST',
                EVENTS_API.VERIFY_EVENT_PAYMENT,
                paymentData,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            // Refresh registrations after successful payment
            dispatch(fetchMyRegistrations());
            toast.success('Payment successful! You are registered.', { id: toastId });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Payment verification failed';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/* ==================== Event Lead Functions ==================== */

/**
 * Fetch events created by user (for Event Leads).
 */
export const fetchMyCreatedEvents = createAsyncThunk(
    'events/fetchMyCreatedEvents',
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setEventsLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'GET',
                EVENTS_API.GET_MY_EVENTS,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(setMyEvents(response.data.data));
            dispatch(setEventsLoading(false));
            return response.data.data as Event[];
        } catch (error) {
            dispatch(setEventsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch events');
        }
    }
);

interface CreateEventData {
    title: string;
    description: string;
    type: 'MEETUP' | 'SESSION' | 'CAMP';
    mode: 'ONLINE' | 'OFFLINE';
    venue?: string;
    meetingLink?: string;
    location?: {
        address?: string;
        lat?: number;
        lng?: number;
    };
    eventDate: string;
    registrationDeadline?: string;
    capacity?: number;
    isPaid: boolean;
    price?: number;
    currency?: string;
}

/**
 * Create a new event (Event Lead only).
 */
export const createEvent = createAsyncThunk(
    'events/createEvent',
    async (eventData: CreateEventData, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Creating event...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'POST',
                EVENTS_API.CREATE_EVENT,
                eventData,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(addEvent(response.data.data));
            toast.success('Event created successfully!', { id: toastId });
            return response.data.data as Event;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to create event';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

interface UpdateEventData extends Partial<CreateEventData> {
    eventId: string;
    status?: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
    imageUrl?: string;
}

/**
 * Update an existing event (Event Lead only).
 */
export const updateEvent = createAsyncThunk(
    'events/updateEvent',
    async ({ eventId, ...eventData }: UpdateEventData, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Updating event...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'PUT',
                `${EVENTS_API.UPDATE_EVENT}/${eventId}`,
                eventData,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(updateEventInState(response.data.data));
            toast.success('Event updated successfully!', { id: toastId });
            return response.data.data as Event;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to update event';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Delete an event (Event Lead only).
 */
export const deleteEvent = createAsyncThunk(
    'events/deleteEvent',
    async (eventId: string, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Deleting event...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            await apiConnector(
                'DELETE',
                `${EVENTS_API.DELETE_EVENT}/${eventId}`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(removeEventFromState(eventId));
            toast.success('Event deleted successfully!', { id: toastId });
            return eventId;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to delete event';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

interface EventDashboardResponse {
    totalRegistrations: number;
    totalAmount: number;
}

/**
 * Fetch event dashboard data (Event Lead only).
 */
export const fetchEventDashboard = createAsyncThunk(
    'events/fetchEventDashboard',
    async (eventId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'GET',
                `${EVENTS_API.GET_EVENT_DASHBOARD}/${eventId}/dashboard`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            return response.data as EventDashboardResponse;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch dashboard');
        }
    }
);

/* ==================== Admin Functions ==================== */

/**
 * Fetch all event requests (Admin only).
 */
export const fetchAllEventRequests = createAsyncThunk(
    'events/fetchAllEventRequests',
    async (status: string | undefined, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setRequestsLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const url = status 
                ? `${ADMIN_API.GET_ALL_EVENT_REQUESTS}?status=${status}`
                : ADMIN_API.GET_ALL_EVENT_REQUESTS;
            
            const response = await apiConnector(
                'GET',
                url,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(setAllEventRequests(response.data.data));
            dispatch(setRequestsLoading(false));
            return response.data.data as EventRequest[];
        } catch (error) {
            dispatch(setRequestsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch event requests';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

interface ReviewEventRequestData {
    requestId: string;
    status: 'APPROVED' | 'REJECTED';
    adminRemark?: string;
}

/**
 * Review (approve/reject) an event request (Admin only).
 */
export const reviewEventRequest = createAsyncThunk(
    'events/reviewEventRequest',
    async ({ requestId, status, adminRemark }: ReviewEventRequestData, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Processing request...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            await apiConnector(
                'PUT',
                `${EVENTS_API.REVIEW_EVENT_REQUEST}/${requestId}`,
                { status, adminRemark },
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(updateEventRequestStatus({ id: requestId, status, adminRemark }));
            toast.success(`Request ${status.toLowerCase()}!`, { id: toastId });
            return { requestId, status, adminRemark };
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to process request';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

interface SendReminderData {
    eventId: string;
    message?: string;
}

/**
 * Send reminder to all event registrants (Event Lead only).
 * Uses the event reminder service endpoint.
 */
export const sendEventReminder = createAsyncThunk(
    'events/sendEventReminder',
    async ({ eventId, message }: SendReminderData, { getState, rejectWithValue }) => {
        const toastId = toast.loading('Sending reminders...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'POST',
                `${EVENTS_API.SEND_REMINDER}/${eventId}/send-reminder`,
                message ? { message } : {},
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            toast.success(response.data.message || 'Reminders sent successfully!', { id: toastId });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to send reminders';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);
