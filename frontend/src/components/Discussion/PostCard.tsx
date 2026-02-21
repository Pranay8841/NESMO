/**
 * @fileoverview Post Card Component
 * Displays a single discussion post with interactions.
 * 
 * @module components/Discussion/PostCard
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toggleLikePost, sharePost, votePoll, deletePost } from '../../services/discussionService';
import type { Post } from '../../redux/slices/discussionSlice';
import { 
    ThumbsUp, 
    MessageCircle, 
    Share2, 
    MoreHorizontal, 
    Trash2, 
    Check,
    Clock,
    BarChart3,
    Users
} from 'lucide-react';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState<string | null>(null);
    const [isVoting, setIsVoting] = useState(false);

    const author = post.author;
    const room = typeof post.room === 'object' ? post.room : null;
    
    // Check if user has liked the post
    const hasLiked = user && post.likes.includes(user._id);
    
    // Check if user is the author
    const isAuthor = user && user._id === author._id;

    // Format time ago
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Get profile photo and initials
    const profilePhoto = author.profile?.profilePhoto;
    const userInitials = `${author.firstName.charAt(0)}${author.lastName.charAt(0)}`.toUpperCase();
    const batch = author.profile?.batch;

    // Role badge
    const getRoleBadge = () => {
        if (author.role === 'ADMIN') return { text: 'ADMIN', color: 'bg-red-100 text-red-600' };
        if (author.role === 'EVENT_LEAD') return { text: 'EVENT LEAD', color: 'bg-purple-100 text-purple-600' };
        if (author.role === 'MEMBER') return { text: 'VERIFIED', color: 'bg-blue-100 text-blue-600' };
        return null;
    };

    const handleLike = () => {
        dispatch(toggleLikePost(post._id));
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/feed?post=${post._id}`;
        const title = post.content?.substring(0, 100) || 'Check out this post on NESMO';
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: title,
                    url
                });
                // User completed the share action - increment count
                dispatch(sharePost(post._id));
            } catch (error: unknown) {
                // Only show error if it's not a user cancellation
                if (error instanceof Error && error.name !== 'AbortError') {
                    toast.error('Failed to share');
                }
            }
        } else {
            // Fallback: just copy to clipboard (no share count since we can't verify actual share)
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            dispatch(deletePost(post._id));
            setShowMenu(false);
        }
    };

    const handleVote = async (optionId: string) => {
        if (isVoting) return; // Prevent multiple clicks
        setIsVoting(true);
        try {
            await dispatch(votePoll({ postId: post._id, optionId }));
        } finally {
            setIsVoting(false);
        }
    };

    // Calculate poll stats
    const getPollStats = () => {
        if (!post.poll) return null;
        const totalVotes = post.poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
        return { totalVotes };
    };

    const pollStats = getPollStats();

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Post Header */}
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                        {/* Author Avatar */}
                        {profilePhoto ? (
                            <img 
                                src={profilePhoto}
                                alt={`${author.firstName} ${author.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {userInitials}
                            </div>
                        )}

                        {/* Author Info */}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">
                                    {author.firstName} {author.lastName}
                                </span>
                                {getRoleBadge() && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadge()!.color}`}>
                                        {getRoleBadge()!.text}
                                    </span>
                                )}
                                {batch && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        BATCH '{batch.slice(-2)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span>{formatTimeAgo(post.createdAt)}</span>
                                {room && (
                                    <>
                                        <span>•</span>
                                        <span className="text-blue-600">{room.name}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                        
                        {showMenu && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                {(isAuthor || user?.role === 'ADMIN') && (
                                    <button
                                        onClick={handleDelete}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Post
                                    </button>
                                )}
                                <button
                                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post._id}`); setShowMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Copy Link
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Post Content */}
                {post.content && (
                    <div className="mt-3 text-gray-700 text-sm whitespace-pre-wrap">
                        {post.content.split(/(#\w+)/g).map((part, i) => 
                            part.startsWith('#') ? (
                                <span key={i} className="text-blue-600 hover:underline cursor-pointer">
                                    {part}
                                </span>
                            ) : part
                        )}
                    </div>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {post.hashtags.map((tag, index) => (
                            <span 
                                key={index}
                                className="text-xs text-blue-600 hover:underline cursor-pointer"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
                <div className={`grid gap-1 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {post.images.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => setImageModalOpen(image)}
                        />
                    ))}
                </div>
            )}

            {/* Poll */}
            {post.poll && post.poll.options && post.poll.options.length > 0 && (() => {
                const userHasVoted = user && post.poll!.options.some(opt => opt.votes.includes(user._id));
                const isPollExpired = post.poll!.expiresAt && new Date(post.poll!.expiresAt) < new Date();
                const showResults = userHasVoted || isPollExpired;
                
                // Find the winning option (highest votes)
                const maxVotes = Math.max(...post.poll!.options.map(opt => opt.votes.length));
                
                return (
                    <div className="mx-4 my-3 rounded-xl border border-gray-200 overflow-hidden bg-white">
                        {/* Poll Header */}
                        <div className="px-4 py-3 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Poll</h4>
                                    <p className="text-xs text-gray-500">
                                        {isPollExpired ? 'Final results' : (userHasVoted ? 'Tap to change vote' : 'Tap to vote')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Poll Question */}
                        <div className="px-4 pt-3 pb-2">
                            <p className="text-gray-900 font-medium">{post.poll!.question}</p>
                        </div>
                        
                        {/* Poll Options */}
                        <div className="px-4 pb-3 space-y-2">
                            {post.poll!.options.map(option => {
                                const hasVoted = user && option.votes.includes(user._id);
                                const percentage = pollStats && pollStats.totalVotes > 0
                                    ? Math.round((option.votes.length / pollStats.totalVotes) * 100)
                                    : 0;
                                const isWinning = option.votes.length === maxVotes && maxVotes > 0;
                                const canVote = !isPollExpired && !isVoting;
                                
                                return (
                                    <button
                                        key={option._id}
                                        onClick={() => canVote && handleVote(option._id)}
                                        disabled={!canVote}
                                        className={`w-full rounded-xl text-left text-sm relative overflow-hidden transition-all duration-300 ${
                                            isPollExpired
                                                ? 'cursor-default'
                                                : 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                                        } ${
                                            hasVoted 
                                                ? 'ring-2 ring-blue-500 ring-offset-1' 
                                                : showResults ? '' : 'hover:bg-gray-50 border border-gray-200'
                                        }`}
                                    >
                                        {/* Progress bar background */}
                                        {showResults && (
                                            <div 
                                                className={`absolute inset-0 transition-all duration-500 ease-out ${
                                                    hasVoted 
                                                        ? 'bg-linear-to-r from-blue-100 to-blue-50' 
                                                        : isWinning 
                                                            ? 'bg-linear-to-r from-green-100 to-green-50'
                                                            : 'bg-gray-100'
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        )}
                                        
                                        <div className={`relative flex items-center justify-between p-3 ${
                                            !showResults ? '' : 'border border-gray-200 rounded-xl'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                {/* Radio/Check indicator */}
                                                {!showResults ? (
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                                                ) : hasVoted ? (
                                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 shrink-0" />
                                                )}
                                                
                                                <span className={`${
                                                    hasVoted 
                                                        ? 'font-semibold text-blue-900' 
                                                        : isWinning && showResults
                                                            ? 'font-medium text-green-900'
                                                            : 'text-gray-700'
                                                }`}>
                                                    {option.text}
                                                </span>
                                            </div>
                                            
                                            {/* Percentage */}
                                            {showResults && (
                                                <span className={`text-sm font-semibold ${
                                                    hasVoted 
                                                        ? 'text-blue-600' 
                                                        : isWinning 
                                                            ? 'text-green-600'
                                                            : 'text-gray-500'
                                                }`}>
                                                    {percentage}%
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Poll Footer */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">{pollStats?.totalVotes || 0}</span>
                                <span className="text-sm">votes</span>
                            </div>
                            {post.poll!.expiresAt && (
                                <div className="flex items-center gap-1.5 text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">
                                        {isPollExpired 
                                            ? 'Ended' 
                                            : `Ends ${new Date(post.poll!.expiresAt).toLocaleDateString()}`
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Engagement Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    {post.likeCount > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <ThumbsUp className="w-2.5 h-2.5 text-white" />
                            </span>
                            {post.likeCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {post.commentCount > 0 && (
                        <button 
                            onClick={() => setShowComments(!showComments)}
                            className="hover:underline"
                        >
                            {post.commentCount} comments
                        </button>
                    )}
                    {post.shareCount > 0 && (
                        <span>{post.shareCount} shares</span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-1 flex items-center justify-around border-b border-gray-100">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${
                        hasLiked 
                            ? 'text-blue-600 hover:bg-blue-50' 
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <ThumbsUp className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{post.likeCount || ''}</span>
                </button>
                
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.commentCount || ''}</span>
                </button>
                
                <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.shareCount || ''}</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <CommentSection postId={post._id} postAuthorId={author._id} />
            )}

            {/* Image Modal */}
            {imageModalOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setImageModalOpen(null)}
                >
                    <img 
                        src={imageModalOpen} 
                        alt="Full size"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}
        </div>
    );
}
