/**
 * @fileoverview Share Modal Component
 * Displays social media sharing options for posts.
 * 
 * @module components/Discussion/ShareModal
 */

import { X, Link2, MessageCircle, Twitter, Facebook, Linkedin, Mail, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: () => void;
    postUrl: string;
    postTitle?: string;
}

export default function ShareModal({ isOpen, onClose, onShare, postUrl, postTitle = 'Check out this post' }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const encodedUrl = encodeURIComponent(postUrl);
    const encodedTitle = encodeURIComponent(postTitle);

    const shareOptions = [
        {
            name: 'Copy Link',
            icon: copied ? Check : Link2,
            color: copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600',
            onClick: () => {
                navigator.clipboard.writeText(postUrl);
                setCopied(true);
                toast.success('Link copied to clipboard!');
                setTimeout(() => setCopied(false), 2000);
            }
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-green-100 text-green-600',
            onClick: () => {
                window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank');
                onShare();
                onClose();
            }
        },
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'bg-sky-100 text-sky-500',
            onClick: () => {
                window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
                onShare();
                onClose();
            }
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-blue-100 text-blue-600',
            onClick: () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
                onShare();
                onClose();
            }
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'bg-blue-100 text-blue-700',
            onClick: () => {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
                onShare();
                onClose();
            }
        },
        {
            name: 'Email',
            icon: Mail,
            color: 'bg-orange-100 text-orange-600',
            onClick: () => {
                window.open(`mailto:?subject=${encodedTitle}&body=${encodedUrl}`, '_blank');
                onShare();
                onClose();
            }
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Share Post</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Share Options Grid */}
                <div className="p-5">
                    <div className="grid grid-cols-3 gap-4">
                        {shareOptions.map((option) => (
                            <button
                                key={option.name}
                                onClick={option.onClick}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${option.color} transition-transform group-hover:scale-110`}>
                                    <option.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium text-gray-600">{option.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* URL Preview */}
                <div className="px-5 pb-5">
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-500 truncate">{postUrl}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
