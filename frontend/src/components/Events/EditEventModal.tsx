/**
 * @fileoverview Edit Event Modal Component
 * Allows Event Leads to edit their existing events.
 * 
 * @module components/Events/EditEventModal
 */

import { type JSX, useState } from "react";
import { 
    X, Loader2, Calendar, MapPin, Users, IndianRupee, 
    Video, Link2, AlertTriangle
} from "lucide-react";
import { useAppDispatch } from "../../redux/hooks";
import { updateEvent, deleteEvent } from "../../services/eventsService";
import type { Event } from "../../redux/slices/eventsSlice";

interface EditEventModalProps {
    event: Event;
    onClose: () => void;
    onDeleted?: () => void;
}

/** Event categories */
const CATEGORIES = [
    { value: "MEETUP", label: "Meetup / Networking" },
    { value: "SESSION", label: "Workshop / Session" },
    { value: "CAMP", label: "Camp / Multi-day" },
];

/** Event status options */
const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active", color: "text-green-600" },
    { value: "CLOSED", label: "Closed", color: "text-gray-600" },
    { value: "CANCELLED", label: "Cancelled", color: "text-red-600" },
];

/**
 * Format date string to YYYY-MM-DD for input field
 */
const formatDateForInput = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

/**
 * Format date string to HH:MM for input field
 */
const formatTimeForInput = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toTimeString().slice(0, 5);
};

export default function EditEventModal({ event, onClose, onDeleted }: EditEventModalProps): JSX.Element {
    const dispatch = useAppDispatch();
    
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [formData, setFormData] = useState({
        title: event.title,
        description: event.description,
        type: event.type,
        mode: event.mode,
        venue: event.venue || "",
        meetingLink: event.meetingLink || "",
        eventDate: formatDateForInput(event.eventDate),
        eventTime: formatTimeForInput(event.eventDate),
        registrationDeadline: event.registrationDeadline 
            ? formatDateForInput(event.registrationDeadline) 
            : "",
        capacity: event.capacity?.toString() || "",
        isPaid: event.isPaid,
        price: event.price?.toString() || "",
        status: event.status,
    });

    /**
     * Handle form field changes
     */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    /**
     * Validate form
     */
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.title.trim()) {
            newErrors.title = "Event title is required";
        }
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }
        if (!formData.eventDate) {
            newErrors.eventDate = "Event date is required";
        }
        if (!formData.eventTime) {
            newErrors.eventTime = "Event time is required";
        }
        if (formData.mode === "OFFLINE" && !formData.venue.trim()) {
            newErrors.venue = "Venue is required for offline events";
        }
        if (formData.mode === "ONLINE" && !formData.meetingLink.trim()) {
            newErrors.meetingLink = "Meeting link is required for online events";
        }
        if (formData.isPaid && (!formData.price || parseFloat(formData.price) <= 0)) {
            newErrors.price = "Please enter a valid price";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Submit the form
     */
    const handleSubmit = async () => {
        if (!validateForm()) return;
        
        setSubmitting(true);
        
        try {
            const eventDateTime = `${formData.eventDate}T${formData.eventTime}`;
            
            await dispatch(updateEvent({
                eventId: event._id,
                title: formData.title.trim(),
                description: formData.description.trim(),
                type: formData.type as "MEETUP" | "SESSION" | "CAMP",
                mode: formData.mode as "ONLINE" | "OFFLINE",
                venue: formData.mode === "OFFLINE" ? formData.venue.trim() : undefined,
                meetingLink: formData.mode === "ONLINE" ? formData.meetingLink.trim() : undefined,
                eventDate: eventDateTime,
                registrationDeadline: formData.registrationDeadline || undefined,
                capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
                isPaid: formData.isPaid,
                price: formData.isPaid ? parseFloat(formData.price) : undefined,
                status: formData.status as "ACTIVE" | "CLOSED" | "CANCELLED",
            })).unwrap();
            
            onClose();
        } catch {
            // Error handled by service
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Handle event deletion
     */
    const handleDelete = async () => {
        setDeleting(true);
        
        try {
            await dispatch(deleteEvent(event._id)).unwrap();
            onDeleted?.();
            onClose();
        } catch {
            // Error handled by service
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

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
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>

                    {/* Header */}
                    <div className="p-6 pb-4 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
                        <p className="text-gray-600 mt-1">
                            Update event details
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                    errors.title ? "border-red-500" : "border-gray-300"
                                }`}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${
                                    errors.description ? "border-red-500" : "border-gray-300"
                                }`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        {/* Type & Status Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Event Type
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    {STATUS_OPTIONS.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date & Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Event Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="eventDate"
                                    value={formData.eventDate}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                        errors.eventDate ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                {errors.eventDate && (
                                    <p className="mt-1 text-sm text-red-500">{errors.eventDate}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Event Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="eventTime"
                                    value={formData.eventTime}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                        errors.eventTime ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                {errors.eventTime && (
                                    <p className="mt-1 text-sm text-red-500">{errors.eventTime}</p>
                                )}
                            </div>
                        </div>

                        {/* Registration Deadline */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Registration Deadline
                            </label>
                            <input
                                type="date"
                                name="registrationDeadline"
                                value={formData.registrationDeadline}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        {/* Mode Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Mode
                            </label>
                            <div className="flex gap-4">
                                <label className={`flex-1 cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                                    formData.mode === "OFFLINE" 
                                        ? "border-blue-500 bg-blue-50" 
                                        : "border-gray-200 hover:border-gray-300"
                                }`}>
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="OFFLINE"
                                        checked={formData.mode === "OFFLINE"}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center gap-2">
                                        <MapPin className={`w-5 h-5 ${formData.mode === "OFFLINE" ? "text-blue-600" : "text-gray-400"}`} />
                                        <span className={`font-medium ${formData.mode === "OFFLINE" ? "text-blue-900" : "text-gray-700"}`}>
                                            In-Person
                                        </span>
                                    </div>
                                </label>
                                
                                <label className={`flex-1 cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                                    formData.mode === "ONLINE" 
                                        ? "border-green-500 bg-green-50" 
                                        : "border-gray-200 hover:border-gray-300"
                                }`}>
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="ONLINE"
                                        checked={formData.mode === "ONLINE"}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Video className={`w-5 h-5 ${formData.mode === "ONLINE" ? "text-green-600" : "text-gray-400"}`} />
                                        <span className={`font-medium ${formData.mode === "ONLINE" ? "text-green-900" : "text-gray-700"}`}>
                                            Online
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Venue (for offline) */}
                        {formData.mode === "OFFLINE" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Venue Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="venue"
                                        value={formData.venue}
                                        onChange={handleChange}
                                        placeholder="Enter event venue name"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                            errors.venue ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.venue && (
                                        <p className="mt-1 text-sm text-red-500">{errors.venue}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Enter full venue address for accurate directions
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Meeting Link (for online) */}
                        {formData.mode === "ONLINE" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Link2 className="w-4 h-4 inline mr-1" />
                                    Meeting Link <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    name="meetingLink"
                                    value={formData.meetingLink}
                                    onChange={handleChange}
                                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                        errors.meetingLink ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                {errors.meetingLink && (
                                    <p className="mt-1 text-sm text-red-500">{errors.meetingLink}</p>
                                )}
                            </div>
                        )}

                        {/* Capacity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Users className="w-4 h-4 inline mr-1" />
                                Capacity
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                min="1"
                                placeholder="Leave empty for unlimited"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        {/* Pricing */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isPaid"
                                    checked={!formData.isPaid}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPaid: !e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium text-gray-900">This is a free event</span>
                            </label>
                            
                            {formData.isPaid && (
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <IndianRupee className="w-4 h-4 inline" />
                                        Ticket Price (INR) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="1"
                                        placeholder="Enter price"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                            errors.price ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Delete Section */}
                        <div className="pt-4 border-t border-gray-200">
                            {!showDeleteConfirm ? (
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                    Delete this event
                                </button>
                            ) : (
                                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-red-800">Delete Event?</h4>
                                            <p className="text-sm text-red-600 mt-1">
                                                This action cannot be undone. All registrations will be removed.
                                            </p>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={handleDelete}
                                                    disabled={deleting}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    {deleting ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        "Yes, Delete"
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
