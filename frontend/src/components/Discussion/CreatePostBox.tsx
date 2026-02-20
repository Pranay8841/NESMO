/**
 * @fileoverview Create Post Box Component
 * Input area for creating new discussion posts with image, poll, and topic support.
 * 
 * @module components/Discussion/CreatePostBox
 */

import { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createPost, fetchRooms } from '../../services/discussionService';
import { Image, BarChart3, X, Loader2 } from 'lucide-react';
import type { DiscussionRoom } from '../../redux/slices/discussionSlice';

interface CreatePostBoxProps {
    selectedRoom?: DiscussionRoom | null;
}

export default function CreatePostBox({ selectedRoom }: CreatePostBoxProps) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { rooms } = useAppSelector(state => state.discussion);
    
    const [content, setContent] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState(selectedRoom?._id || '');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [showPollForm, setShowPollForm] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get user profile photo
    const profilePhoto = user && typeof user.profile === 'object' ? user.profile.profilePhoto : null;
    const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 4) {
            alert('Maximum 4 images allowed');
            return;
        }
        
        setImages(prev => [...prev, ...files]);
        
        // Create preview URLs
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    const addPollOption = () => {
        if (pollOptions.length < 6) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const updatePollOption = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const handleSubmit = async () => {
        if (!content.trim() && !showPollForm) return;
        if (!selectedRoomId) {
            alert('Please select a discussion room');
            return;
        }

        // Validate poll if enabled
        if (showPollForm) {
            if (!pollQuestion.trim()) {
                alert('Please enter a poll question');
                return;
            }
            const validOptions = pollOptions.filter(o => o.trim());
            if (validOptions.length < 2) {
                alert('Please provide at least 2 poll options');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const postData: {
                roomId: string;
                content: string;
                images?: File[];
                poll?: {
                    question: string;
                    options: string[];
                };
            } = {
                roomId: selectedRoomId,
                content: content.trim(),
            };

            if (images.length > 0) {
                postData.images = images;
            }

            if (showPollForm) {
                postData.poll = {
                    question: pollQuestion,
                    options: pollOptions.filter(o => o.trim()),
                };
            }

            await dispatch(createPost(postData));
            
            // Reset form
            setContent('');
            setImages([]);
            setImagePreview([]);
            setShowPollForm(false);
            setPollQuestion('');
            setPollOptions(['', '']);
            
            // Refresh rooms to update post count
            dispatch(fetchRooms());
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
            {/* User Avatar and Input Area */}
            <div className="flex gap-4">
                {/* User Avatar */}
                {profilePhoto ? (
                    <img 
                        src={profilePhoto}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                    />
                ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm">
                        {userInitials}
                    </div>
                )}

                {/* Text Input Container */}
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`What's on your mind, ${user.firstName}?`}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-700 placeholder-gray-400 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all min-h-[120px]"
                        rows={5}
                    />
                </div>
            </div>

            {/* Room Selector */}
            <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-gray-500 font-medium">Post to:</span>
                <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="flex-1 max-w-xs text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white text-gray-700 cursor-pointer transition-all"
                >
                    <option value="">Select a room</option>
                    {rooms.map(room => (
                        <option key={room._id} value={room._id}>
                            {room.icon} {room.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Image Previews */}
            {imagePreview.length > 0 && (
                <div className="mt-4 flex gap-3 flex-wrap">
                    {imagePreview.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img 
                                src={preview} 
                                alt={`Preview ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                            />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Poll Form */}
            {showPollForm && (
                <div className="mt-5 p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-700">📊 Create Poll</span>
                        <button
                            onClick={() => setShowPollForm(false)}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <input
                        type="text"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <div className="space-y-3">
                        {pollOptions.map((option, index) => (
                            <div key={index} className="flex gap-3">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updatePollOption(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {pollOptions.length > 2 && (
                                    <button
                                        onClick={() => removePollOption(index)}
                                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-white rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {pollOptions.length < 6 && (
                        <button
                            onClick={addPollOption}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            + Add option
                        </button>
                    )}
                </div>
            )}

            {/* Actions Bar */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Image Upload */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-xl transition-all duration-200"
                        disabled={images.length >= 4}
                    >
                        <Image className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">Image</span>
                    </button>

                    {/* Poll Toggle */}
                    <button
                        onClick={() => setShowPollForm(!showPollForm)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                            showPollForm 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                    >
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">Poll</span>
                    </button>
                </div>

                {/* Post Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (!content.trim() && !showPollForm) || !selectedRoomId}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Post
                </button>
            </div>
        </div>
    );
}
