/**
 * @fileoverview Event Request Modal Component
 * Form for users to request creating a new event.
 * 
 * @module components/Events/EventRequestModal
 */

import { type JSX, useState } from "react";
import { X, Loader2, Calendar, MapPin, Users, IndianRupee } from "lucide-react";
import { useAppDispatch } from "../../redux/hooks";
import { submitEventRequest } from "../../services/eventsService";

interface EventRequestModalProps {
    onClose: () => void;
}

export default function EventRequestModal({ onClose }: EventRequestModalProps): JSX.Element {
    const dispatch = useAppDispatch();
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "MEETUP" as "MEETUP" | "SESSION" | "CAMP",
        mode: "OFFLINE" as "ONLINE" | "OFFLINE",
        venue: "",
        eventDate: "",
        expectedCapacity: "",
        isPaid: false,
        price: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

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
        } else if (new Date(formData.eventDate) < new Date()) {
            newErrors.eventDate = "Event date must be in the future";
        }
        
        if (formData.mode === "OFFLINE" && !formData.venue.trim()) {
            newErrors.venue = "Venue is required for offline events";
        }
        
        if (formData.isPaid && (!formData.price || parseFloat(formData.price) <= 0)) {
            newErrors.price = "Please enter a valid price";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setSubmitting(true);
        
        try {
            const requestData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                type: formData.type,
                mode: formData.mode,
                venue: formData.mode === "OFFLINE" ? formData.venue.trim() : undefined,
                eventDate: formData.eventDate,
                expectedCapacity: formData.expectedCapacity ? parseInt(formData.expectedCapacity) : undefined,
                isPaid: formData.isPaid,
                price: formData.isPaid ? parseFloat(formData.price) : undefined,
            };
            
            await dispatch(submitEventRequest(requestData)).unwrap();
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        
        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
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
                        <h2 className="text-2xl font-bold text-gray-900">Request to Host an Event</h2>
                        <p className="text-gray-600 mt-1">
                            Submit your event idea for admin approval. Once approved, you'll become an Event Lead.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                                placeholder="e.g., Alumni Networking Meetup 2026"
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
                                placeholder="Describe the event, its purpose, and what attendees can expect..."
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${
                                    errors.description ? "border-red-500" : "border-gray-300"
                                }`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        {/* Type and Mode */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Event Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                >
                                    <option value="MEETUP">Meetup</option>
                                    <option value="SESSION">Session / Workshop</option>
                                    <option value="CAMP">Camp / Multi-day</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Event Mode <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="mode"
                                    value={formData.mode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                >
                                    <option value="OFFLINE">Offline (In-person)</option>
                                    <option value="ONLINE">Online (Virtual)</option>
                                </select>
                            </div>
                        </div>

                        {/* Venue (for offline events) */}
                        {formData.mode === "OFFLINE" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Venue <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    placeholder="e.g., School Auditorium, Conference Room, etc."
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                        errors.venue ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                {errors.venue && (
                                    <p className="mt-1 text-sm text-red-500">{errors.venue}</p>
                                )}
                            </div>
                        )}

                        {/* Date and Capacity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Event Date & Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
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
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Expected Capacity
                                </label>
                                <input
                                    type="number"
                                    name="expectedCapacity"
                                    value={formData.expectedCapacity}
                                    onChange={handleChange}
                                    placeholder="e.g., 50"
                                    min="1"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Paid Event Toggle */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-700">This is a paid event</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isPaid"
                                        checked={formData.isPaid}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            
                            {formData.isPaid && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Registration Fee (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="e.g., 500"
                                        min="1"
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

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Request"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
