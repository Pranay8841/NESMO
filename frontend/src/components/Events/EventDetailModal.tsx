/**
 * @fileoverview Event Detail Modal Component
 * Displays full event details and allows user registration/payment.
 * 
 * @module components/Events/EventDetailModal
 */

import { type JSX, useEffect, useState } from "react";
import { 
    X, Calendar, Clock, MapPin, Video, Users, IndianRupee, 
    User, CheckCircle, Loader2, AlertCircle, XCircle, ExternalLink 
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { 
    registerForEvent, 
    unregisterFromEvent,
    checkRegistrationStatus,
    createEventPaymentOrder,
    verifyEventPayment 
} from "../../services/eventsService";
import type { Event, EventRegistration } from "../../redux/slices/eventsSlice";
import GoogleMapEmbed from "./GoogleMapEmbed";

interface EventDetailModalProps {
    event: Event;
    onClose: () => void;
}

interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayPaymentResponse) => void;
    prefill: {
        name: string;
        email: string;
    };
    theme: {
        color: string;
    };
}

interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayCheckoutOptions) => {
            open: () => void;
        };
    }
}

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
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

export default function EventDetailModal({ event, onClose }: EventDetailModalProps): JSX.Element {
    const dispatch = useAppDispatch();
    const { user, token } = useAppSelector((state) => state.auth);
    
    const [isRegistered, setIsRegistered] = useState(false);
    const [registration, setRegistration] = useState<EventRegistration | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [unregistering, setUnregistering] = useState(false);

    const isPast = new Date(event.eventDate) < new Date();
    const isRegistrationClosed = event.registrationDeadline && 
        new Date(event.registrationDeadline) < new Date();

    // Check if user is already registered
    useEffect(() => {
        if (user && token) {
            setCheckingStatus(true);
            dispatch(checkRegistrationStatus(event._id))
                .unwrap()
                .then((result) => {
                    setIsRegistered(result.isRegistered);
                    setRegistration(result.registration);
                })
                .finally(() => setCheckingStatus(false));
        }
    }, [dispatch, event._id, user, token]);

    // Load Razorpay script
    useEffect(() => {
        if (event.isPaid && !window.Razorpay) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, [event.isPaid]);

    const handleRegister = async () => {
        if (!user) {
            // Could redirect to login
            return;
        }

        setRegistering(true);
        
        try {
            if (event.isPaid) {
                // Create payment order
                const orderResult = await dispatch(createEventPaymentOrder(event._id)).unwrap();
                
                // Open Razorpay checkout
                const options = {
                    key: orderResult.key,
                    amount: orderResult.amount,
                    currency: orderResult.currency,
                    name: "NESMO",
                    description: `Registration for ${event.title}`,
                    order_id: orderResult.orderId,
                    handler: async (response: RazorpayPaymentResponse) => {
                        // Verify payment
                        await dispatch(verifyEventPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            registrationId: orderResult.registrationId,
                        })).unwrap();
                        
                        setIsRegistered(true);
                    },
                    prefill: {
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                    },
                    theme: {
                        color: "#D97706",
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            } else {
                // Free event - direct registration
                await dispatch(registerForEvent(event._id)).unwrap();
                setIsRegistered(true);
            }
        } finally {
            setRegistering(false);
        }
    };

    const handleUnregister = async () => {
        if (!user) return;
        
        setUnregistering(true);
        try {
            await dispatch(unregisterFromEvent(event._id)).unwrap();
            setIsRegistered(false);
            setRegistration(null);
        } finally {
            setUnregistering(false);
        }
    };

    // Get organizer name
    const organizerName = typeof event.createdBy === "object" 
        ? `${event.createdBy.firstName} ${event.createdBy.lastName}`
        : "NESMO Team";
    
    console.log("EventDetailModal render - event:", event);
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 bg-white/80 backdrop-blur-sm"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>

                    {/* Event Image */}
                    {event.imageUrl && (
                        <div className="relative h-56 overflow-hidden rounded-t-2xl">
                            <img 
                                src={event.imageUrl} 
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                    )}

                    {/* Header */}
                    <div className={`p-6 pb-4 border-b border-gray-100 ${event.imageUrl ? '-mt-16 relative z-10' : ''}`}>
                        <div className={`flex items-center gap-3 mb-3 ${event.imageUrl ? 'text-white' : ''}`}>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.imageUrl ? 'bg-white/90' : ''} ${getTypeBadgeColor(event.type)}`}>
                                {event.type}
                            </span>
                            <span className={`flex items-center gap-1 text-sm font-medium ${
                                event.imageUrl 
                                    ? 'text-white' 
                                    : event.mode === "ONLINE" ? "text-green-600" : "text-blue-600"
                            }`}>
                                {event.mode === "ONLINE" ? (
                                    <Video className="w-4 h-4" />
                                ) : (
                                    <MapPin className="w-4 h-4" />
                                )}
                                {event.mode}
                            </span>
                        </div>
                        <h2 className={`text-2xl font-bold pr-8 ${event.imageUrl ? 'text-white drop-shadow-md' : 'text-gray-900'}`}>{event.title}</h2>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                About this Event
                            </h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                        </div>

                        {/* Event Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Date */}
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium text-gray-900">{formatDate(event.eventDate)}</p>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium text-gray-900">{formatTime(event.eventDate)}</p>
                                </div>
                            </div>

                            {/* Venue/Mode */}
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                {event.mode === "ONLINE" ? (
                                    <Video className="w-5 h-5 text-green-600 mt-0.5" />
                                ) : (
                                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">
                                        {event.mode === "ONLINE" ? "Platform" : "Venue"}
                                    </p>
                                    {event.mode === "ONLINE" ? (
                                        isRegistered && registration?.status === "CONFIRMED" && event.meetingLink ? (
                                            <a 
                                                href={event.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                Join Meeting
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        ) : (
                                            <p className="font-medium text-gray-900">
                                                Online (Link available after registration)
                                            </p>
                                        )
                                    ) : (
                                        <p className="font-medium text-gray-900">
                                            {event.venue || "TBA"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Capacity */}
                            {event.capacity && (
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Capacity</p>
                                        <p className="font-medium text-gray-900">{event.capacity} attendees</p>
                                    </div>
                                </div>
                            )}

                            {/* Organizer */}
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Organized by</p>
                                    <p className="font-medium text-gray-900">{organizerName}</p>
                                </div>
                            </div>

                            {/* Registration Deadline */}
                            {event.registrationDeadline && (
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Registration Deadline</p>
                                        <p className="font-medium text-gray-900">
                                            {formatDate(event.registrationDeadline)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Google Maps for Offline Events */}
                        {event.mode === "OFFLINE" && event.venue && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Event Location
                                </h3>
                                <GoogleMapEmbed
                                    venueName={event.venue}
                                />
                            </div>
                        )}

                        {/* Price Section */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium">Registration Fee</span>
                                <span className={`text-xl font-bold ${event.isPaid ? "text-blue-600" : "text-green-600"}`}>
                                    {event.isPaid ? (
                                        <span className="flex items-center gap-1">
                                            <IndianRupee className="w-5 h-5" />
                                            {event.price}
                                        </span>
                                    ) : (
                                        "Free"
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Registration Button */}
                        <div className="space-y-3">
                            {checkingStatus ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                </div>
                            ) : isRegistered ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-center gap-2 py-4 bg-green-50 rounded-lg text-green-700">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">
                                            {registration?.status === "CONFIRMED" 
                                                ? "You're registered for this event!"
                                                : "Registration pending confirmation"}
                                        </span>
                                    </div>
                                    {/* Show unregister button only for free events or pending paid registrations */}
                                    {(!registration?.isPaid || registration?.status !== "CONFIRMED") && !isPast && (
                                        <button
                                            onClick={handleUnregister}
                                            disabled={unregistering}
                                            className="w-full py-2.5 border border-red-300 hover:bg-red-50 text-red-600 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {unregistering ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Cancelling...
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4" />
                                                    Cancel Registration
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            ) : isPast ? (
                                <div className="py-4 text-center text-gray-500 bg-gray-100 rounded-lg">
                                    This event has ended
                                </div>
                            ) : isRegistrationClosed ? (
                                <div className="py-4 text-center text-red-600 bg-red-50 rounded-lg">
                                    Registration is closed
                                </div>
                            ) : !user ? (
                                <div className="py-4 text-center text-gray-600 bg-gray-100 rounded-lg">
                                    Please log in to register for this event
                                </div>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={registering}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {registering ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : event.isPaid ? (
                                        <>
                                            Pay & Register
                                            <IndianRupee className="w-4 h-4" />
                                            {event.price}
                                        </>
                                    ) : (
                                        "Register Now"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
