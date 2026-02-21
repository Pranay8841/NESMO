/**
 * @fileoverview Upload Media Modal Component
 * Modal for creating new albums and uploading media.
 * 
 * @module components/Gallery/UploadMediaModal
 */

import { type JSX, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createAlbum, uploadMediaToAlbum, fetchAlbums } from "../../services/galleryService";
import type { AlbumCategory } from "../../redux/slices/gallerySlice";
import { X, Upload, Image, Calendar, MapPin, Loader2, Plus, FolderOpen } from "lucide-react";

interface UploadMediaModalProps {
    onClose: () => void;
}

/** Category options for album creation */
const CATEGORY_OPTIONS: { value: AlbumCategory; label: string }[] = [
    { value: "ANNUAL_MEET", label: "Annual Meet" },
    { value: "REGIONAL_MEETUP", label: "Regional Meetup" },
    { value: "CHARITY_DRIVE", label: "Charity Drive" },
    { value: "OTHER", label: "Other Event" },
];

type UploadMode = "new" | "existing";

export default function UploadMediaModal({ onClose }: UploadMediaModalProps): JSX.Element {
    const dispatch = useAppDispatch();
    const { albums, uploadLoading } = useAppSelector((state) => state.gallery);
    const { user } = useAppSelector((state) => state.auth);

    const [mode, setMode] = useState<UploadMode>("new");
    const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
    const [isCreating, setIsCreating] = useState(false);

    // New album form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<AlbumCategory>("OTHER");
    const [location, setLocation] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    // Upload files state
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);

    // Load albums for existing album selection
    useEffect(() => {
        if (albums.length === 0) {
            dispatch(fetchAlbums({ limit: 100 }));
        }
    }, [dispatch, albums.length]);

    // Handle cover image selection
    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            const reader = new FileReader();
            reader.onload = () => setCoverPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Handle media files selection
    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);
            setUploadFiles((prev) => [...prev, ...fileArray]);

            // Generate previews
            fileArray.forEach((file) => {
                const reader = new FileReader();
                reader.onload = () => {
                    setUploadPreviews((prev) => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Remove file from upload list
    const removeFile = (index: number) => {
        setUploadFiles((prev) => prev.filter((_, i) => i !== index));
        setUploadPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "new") {
            // Create new album
            if (!title.trim()) return;

            setIsCreating(true);
            const result = await dispatch(createAlbum({
                title: title.trim(),
                description: description.trim(),
                category,
                location: location.trim(),
                eventDate: eventDate || undefined,
                isFeatured,
                coverImage: coverImage || undefined,
            }));

            if (createAlbum.fulfilled.match(result)) {
                const newAlbum = result.payload;

                // Upload media to the new album
                if (uploadFiles.length > 0) {
                    await dispatch(uploadMediaToAlbum({ 
                        albumId: newAlbum._id, 
                        files: uploadFiles 
                    }));
                }

                // Refresh albums list
                dispatch(fetchAlbums({ page: 1 }));
                onClose();
            }

            setIsCreating(false);
        } else {
            // Upload to existing album
            if (!selectedAlbumId || uploadFiles.length === 0) return;

            await dispatch(uploadMediaToAlbum({ 
                albumId: selectedAlbumId, 
                files: uploadFiles 
            }));

            // Refresh albums list
            dispatch(fetchAlbums({ page: 1 }));
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="min-h-screen flex items-start justify-center p-4 pt-12">
                <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Upload Media</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setMode("new")}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                                    mode === "new"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <Plus className="w-4 h-4" />
                                Create New Album
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("existing")}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                                    mode === "existing"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <FolderOpen className="w-4 h-4" />
                                Add to Existing Album
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                        {mode === "new" ? (
                            <>
                                {/* Album Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Album Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Annual Meet 2024"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description of the album..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    />
                                </div>

                                {/* Category & Location Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value as AlbumCategory)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                        >
                                            {CATEGORY_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            Location/City
                                        </label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="e.g., Delhi, India"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Date & Featured Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Event Date
                                        </label>
                                        <input
                                            type="date"
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    {user?.role === "ADMIN" && (
                                        <div className="flex items-center">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isFeatured}
                                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    Mark as Featured
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Cover Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cover Image
                                    </label>
                                    <div className="flex gap-4">
                                        {coverPreview && (
                                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={coverPreview}
                                                    alt="Cover preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition text-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCoverChange}
                                                className="hidden"
                                            />
                                            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <span className="text-sm text-gray-500">
                                                Click to upload cover image
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Existing Album Selection */
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Album *
                                </label>
                                <select
                                    value={selectedAlbumId}
                                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                    required
                                >
                                    <option value="">Choose an album...</option>
                                    {albums.map((album) => (
                                        <option key={album._id} value={album._id}>
                                            {album.title} ({album.mediaCount} photos)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Media Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Photos to Upload
                            </label>
                            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition text-center">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFilesChange}
                                    className="hidden"
                                />
                                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                <span className="text-sm text-gray-600 block">
                                    Click to select photos or drag and drop
                                </span>
                                <span className="text-xs text-gray-400 mt-1 block">
                                    PNG, JPG up to 10MB each
                                </span>
                            </label>

                            {/* Upload Previews */}
                            {uploadPreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 gap-2">
                                    {uploadPreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                            <img
                                                src={preview}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {uploadFiles.length > 0 && (
                                <p className="text-sm text-gray-500 mt-2">
                                    {uploadFiles.length} file(s) selected
                                </p>
                            )}
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isCreating || uploadLoading || (mode === "new" && !title.trim()) || (mode === "existing" && (!selectedAlbumId || uploadFiles.length === 0))}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {(isCreating || uploadLoading) && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            {mode === "new" ? "Create Album" : "Upload Photos"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
