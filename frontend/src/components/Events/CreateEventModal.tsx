/**
 * @fileoverview Create Event Modal Component
 * Multi-step wizard for Event Leads to create new events.
 * Steps: Basic Info → Date & Venue → Ticketing → Media
 * 
 * @module components/Events/CreateEventModal
 */

import { type JSX, useState, useRef } from "react";
import { 
    X, Loader2, Calendar, MapPin, Users, IndianRupee, 
    Clock, Check, ChevronDown, Image, Upload, Video
} from "lucide-react";
import { useAppDispatch } from "../../redux/hooks";
import { createEvent } from "../../services/eventsService";
import toast from "react-hot-toast";

interface CreateEventModalProps {
    onClose: () => void;
}

/** Step configuration */
const STEPS = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Date & Venue" },
    { id: 3, label: "Ticketing" },
    { id: 4, label: "Media" },
];

/** Event categories */
const CATEGORIES = [
    { value: "MEETUP", label: "Meetup / Networking" },
    { value: "SESSION", label: "Workshop / Session" },
    { value: "CAMP", label: "Camp / Multi-day" },
];

interface FormData {
    title: string;
    category: string;
    description: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    venue: string;
    mode: "ONLINE" | "OFFLINE";
    onlineLink: string;
    isFree: boolean;
    price: string;
    capacity: string;
    registrationDeadline: string;
    coverImage: File | null;
    coverImagePreview: string;
}

export default function CreateEventModal({ onClose }: CreateEventModalProps): JSX.Element {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [categoryOpen, setCategoryOpen] = useState(false);
    
    const [formData, setFormData] = useState<FormData>({
        title: "",
        category: "MEETUP",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        venue: "",
        mode: "OFFLINE",
        onlineLink: "",
        isFree: true,
        price: "",
        capacity: "",
        registrationDeadline: "",
        coverImage: null,
        coverImagePreview: "",
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
     * Handle cover image upload
     */
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    coverImage: file,
                    coverImagePreview: reader.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Remove uploaded image
     */
    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            coverImage: null,
            coverImagePreview: "",
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    /**
     * Validate current step
     */
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};
        
        switch (step) {
            case 1:
                if (!formData.title.trim()) {
                    newErrors.title = "Event title is required";
                }
                if (!formData.description.trim()) {
                    newErrors.description = "Description is required";
                } else if (formData.description.trim().length < 20) {
                    newErrors.description = "Description must be at least 20 characters";
                }
                break;
                
            case 2:
                if (!formData.startDate) {
                    newErrors.startDate = "Start date is required";
                }
                if (!formData.startTime) {
                    newErrors.startTime = "Start time is required";
                }
                if (formData.startDate && formData.startTime) {
                    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
                    if (startDateTime < new Date()) {
                        newErrors.startDate = "Event cannot be in the past";
                    }
                }
                if (formData.endDate && formData.endTime && formData.startDate && formData.startTime) {
                    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
                    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
                    if (endDateTime <= startDateTime) {
                        newErrors.endDate = "End time must be after start time";
                    }
                }
                if (formData.mode === "OFFLINE" && !formData.venue.trim()) {
                    newErrors.venue = "Venue is required for offline events";
                }
                if (formData.mode === "ONLINE" && !formData.onlineLink.trim()) {
                    newErrors.onlineLink = "Meeting link is required for online events";
                }
                break;
                
            case 3:
                if (!formData.isFree) {
                    if (!formData.price || parseFloat(formData.price) <= 0) {
                        newErrors.price = "Please enter a valid price";
                    }
                }
                if (formData.capacity && parseInt(formData.capacity) < 1) {
                    newErrors.capacity = "Capacity must be at least 1";
                }
                if (formData.registrationDeadline && formData.startDate) {
                    const deadline = new Date(formData.registrationDeadline);
                    const startDate = new Date(`${formData.startDate}T${formData.startTime || "00:00"}`);
                    if (deadline > startDate) {
                        newErrors.registrationDeadline = "Deadline must be before event start";
                    }
                }
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Go to next step
     */
    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    /**
     * Go to previous step
     */
    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    /**
     * Submit the form
     */
    const handleSubmit = async () => {
        for (let step = 1; step <= 3; step++) {
            if (!validateStep(step)) {
                setCurrentStep(step);
                return;
            }
        }
        
        setSubmitting(true);
        
        try {
            const eventDateTime = `${formData.startDate}T${formData.startTime}`;
            
            const eventData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                type: formData.category as "MEETUP" | "SESSION" | "CAMP",
                mode: formData.mode,
                venue: formData.mode === "OFFLINE" ? formData.venue.trim() : formData.onlineLink.trim(),
                eventDate: eventDateTime,
                registrationDeadline: formData.registrationDeadline || undefined,
                capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
                isPaid: !formData.isFree,
                price: !formData.isFree ? parseFloat(formData.price) : undefined,
                currency: "INR",
            };
            
            await dispatch(createEvent(eventData)).unwrap();
            onClose();
        } catch {
            // Error handled by service
        } finally {
            setSubmitting(false);
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
                        <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
                        <p className="text-gray-600 mt-1">
                            Fill in the details to create a new event for NESMO community
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="px-6 pt-4">
                        <div className="flex items-center justify-between relative">
                            {/* Progress Line Background */}
                            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 mx-6" />
                            
                            {/* Progress Line Active */}
                            <div 
                                className="absolute left-6 top-4 h-0.5 bg-blue-500 transition-all duration-500"
                                style={{ width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 48px)` }}
                            />
                            
                            {/* Steps */}
                            {STEPS.map((step) => (
                                <div key={step.id} className="relative z-10 flex flex-col items-center">
                                    <div 
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                            step.id < currentStep
                                                ? "bg-blue-500 text-white"
                                                : step.id === currentStep
                                                ? "bg-white border-2 border-blue-500 text-blue-600"
                                                : "bg-white border-2 border-gray-200 text-gray-400"
                                        }`}
                                    >
                                        {step.id < currentStep ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                    <span className={`mt-1.5 text-xs font-medium transition-colors ${
                                        step.id <= currentStep ? "text-blue-600" : "text-gray-400"
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-5">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <>
                                <div className="mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
                                    <p className="text-sm text-gray-500">
                                        Core information about your event
                                    </p>
                                </div>

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
                                        placeholder="e.g., NESMO Tech Summit 2026"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                            errors.title ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Event Type <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setCategoryOpen(!categoryOpen)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors bg-white"
                                    >
                                        <span className="text-gray-900">
                                            {CATEGORIES.find(c => c.value === formData.category)?.label}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    
                                    {categoryOpen && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, category: cat.value }));
                                                        setCategoryOpen(false);
                                                    }}
                                                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                                                        formData.category === cat.value 
                                                            ? "text-blue-600 bg-blue-50" 
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
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
                                        rows={5}
                                        placeholder="Describe the event, its purpose, agenda, and what attendees can expect..."
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${
                                            errors.description ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Step 2: Date & Venue */}
                        {currentStep === 2 && (
                            <>
                                <div className="mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">Date & Venue</h3>
                                    <p className="text-sm text-gray-500">
                                        Set when and where your event will take place
                                    </p>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Start Date & Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Start Date & Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                                    errors.startDate ? "border-red-500" : "border-gray-300"
                                                }`}
                                            />
                                            <input
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                                    errors.startTime ? "border-red-500" : "border-gray-300"
                                                }`}
                                            />
                                        </div>
                                        {(errors.startDate || errors.startTime) && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.startDate || errors.startTime}
                                            </p>
                                        )}
                                    </div>

                                    {/* End Date & Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            End Date & Time
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                            <input
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        {errors.endDate && (
                                            <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Event Mode */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Mode <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, mode: "OFFLINE" }))}
                                            className={`p-3 border rounded-lg flex items-center gap-2 transition-all ${
                                                formData.mode === "OFFLINE"
                                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                                            }`}
                                        >
                                            <MapPin className="w-5 h-5" />
                                            <div className="text-left">
                                                <p className="font-medium">In-Person</p>
                                                <p className="text-xs opacity-75">Physical venue</p>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, mode: "ONLINE" }))}
                                            className={`p-3 border rounded-lg flex items-center gap-2 transition-all ${
                                                formData.mode === "ONLINE"
                                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                                            }`}
                                        >
                                            <Video className="w-5 h-5" />
                                            <div className="text-left">
                                                <p className="font-medium">Online</p>
                                                <p className="text-xs opacity-75">Virtual meeting</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Venue / Online Link */}
                                {formData.mode === "OFFLINE" ? (
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
                                            placeholder="e.g., Grand Convention Center, City"
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                                errors.venue ? "border-red-500" : "border-gray-300"
                                            }`}
                                        />
                                        {errors.venue && (
                                            <p className="mt-1 text-sm text-red-500">{errors.venue}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Video className="w-4 h-4 inline mr-1" />
                                            Meeting Link <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            name="onlineLink"
                                            value={formData.onlineLink}
                                            onChange={handleChange}
                                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                                errors.onlineLink ? "border-red-500" : "border-gray-300"
                                            }`}
                                        />
                                        {errors.onlineLink && (
                                            <p className="mt-1 text-sm text-red-500">{errors.onlineLink}</p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Step 3: Ticketing */}
                        {currentStep === 3 && (
                            <>
                                <div className="mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">Ticketing</h3>
                                    <p className="text-sm text-gray-500">
                                        Configure registration and pricing options
                                    </p>
                                </div>

                                {/* Free/Paid Toggle */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <IndianRupee className="w-5 h-5 text-gray-600" />
                                            <div>
                                                <span className="font-medium text-gray-700">Event Pricing</span>
                                                <p className="text-xs text-gray-500">
                                                    {formData.isFree ? "Free for all attendees" : "Requires payment to register"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm ${formData.isFree ? "text-green-600 font-medium" : "text-gray-400"}`}>
                                                Free
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, isFree: !prev.isFree }))}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${
                                                    formData.isFree ? "bg-green-500" : "bg-blue-500"
                                                }`}
                                            >
                                                <div 
                                                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                                        formData.isFree ? "left-0.5" : "left-5"
                                                    }`}
                                                />
                                            </button>
                                            <span className={`text-sm ${!formData.isFree ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                                                Paid
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price Input */}
                                    {!formData.isFree && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Registration Fee (INR)
                                            </label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    placeholder="500"
                                                    min="1"
                                                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                                        errors.price ? "border-red-500" : "border-gray-300"
                                                    }`}
                                                />
                                            </div>
                                            {errors.price && (
                                                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Capacity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Users className="w-4 h-4 inline mr-1" />
                                        Maximum Capacity
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        placeholder="Leave empty for unlimited"
                                        min="1"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave empty if there's no limit on attendees
                                    </p>
                                </div>

                                {/* Registration Deadline */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Registration Deadline
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="registrationDeadline"
                                        value={formData.registrationDeadline}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                            errors.registrationDeadline ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.registrationDeadline && (
                                        <p className="mt-1 text-sm text-red-500">{errors.registrationDeadline}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Optional - Leave empty to allow registration until event starts
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Step 4: Media */}
                        {currentStep === 4 && (
                            <>
                                <div className="mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">Media</h3>
                                    <p className="text-sm text-gray-500">
                                        Add a cover image to make your event stand out
                                    </p>
                                </div>

                                {/* Cover Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Image className="w-4 h-4 inline mr-1" />
                                        Cover Image
                                    </label>
                                    
                                    {formData.coverImagePreview ? (
                                        <div className="relative rounded-lg overflow-hidden">
                                            <img 
                                                src={formData.coverImagePreview} 
                                                alt="Cover preview"
                                                className="w-full h-48 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer transition-colors"
                                        >
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-600 mb-1">
                                                Click to upload
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, WebP (max 5MB)
                                            </p>
                                        </div>
                                    )}
                                    
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>

                                {/* Summary */}
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <h4 className="font-medium text-blue-800 mb-3">Event Summary</h4>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-blue-700">Title</dt>
                                            <dd className="text-blue-900 font-medium">{formData.title || "—"}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-blue-700">Type</dt>
                                            <dd className="text-blue-900">{CATEGORIES.find(c => c.value === formData.category)?.label}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-blue-700">Date</dt>
                                            <dd className="text-blue-900">
                                                {formData.startDate 
                                                    ? new Date(formData.startDate).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric"
                                                    })
                                                    : "—"
                                                }
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-blue-700">Mode</dt>
                                            <dd className="text-blue-900">{formData.mode === "ONLINE" ? "Online" : "In-Person"}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-blue-700">Pricing</dt>
                                            <dd className={formData.isFree ? "text-green-600" : "text-blue-900"}>
                                                {formData.isFree ? "Free" : `₹${formData.price || 0}`}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        
                        <div className="flex items-center gap-3">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            
                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Continue to {STEPS[currentStep]?.label}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Event"
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
