/**
 * @fileoverview Comment Section Component
 * Displays and manages comments for a post.
 * 
 * @module components/Discussion/CommentSection
 */

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchComments, createComment, deleteComment, toggleLikeComment } from '../../services/discussionService';
import { Trash2, Loader2, Send } from 'lucide-react';
import type { Comment } from '../../redux/slices/discussionSlice';

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { comments, commentsLoading, commentsPagination } = useAppSelector(state => state.discussion);
    
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchComments({ postId }));
    }, [dispatch, postId]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await dispatch(createComment({ postId, content: newComment.trim() }));
            setNewComment('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        if (window.confirm('Delete this comment?')) {
            dispatch(deleteComment({ commentId, postId }));
        }
    };

    const handleLikeComment = (commentId: string) => {
        dispatch(toggleLikeComment(commentId));
    };

    const loadMoreComments = () => {
        if (commentsPagination && commentsPagination.page < commentsPagination.pages) {
            dispatch(fetchComments({ 
                postId, 
                page: commentsPagination.page + 1, 
                append: true 
            }));
        }
    };

    // Format time ago
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    };

    // Get user profile photo and initials
    const profilePhoto = user && typeof user.profile === 'object' ? user.profile.profilePhoto : null;
    const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';

    return (
        <div className="p-4 bg-gray-50">
            {/* Comment Input */}
            {user && (
                <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
                    {profilePhoto ? (
                        <img 
                            src={profilePhoto}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {userInitials}
                        </div>
                    )}
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-3 py-2 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Comments List */}
            {commentsLoading && comments.length === 0 ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            currentUserId={user?._id}
                            onLike={() => handleLikeComment(comment._id)}
                            onDelete={() => handleDeleteComment(comment._id)}
                            formatTimeAgo={formatTimeAgo}
                        />
                    ))}

                    {/* Load More Button */}
                    {commentsPagination && commentsPagination.page < commentsPagination.pages && (
                        <button
                            onClick={loadMoreComments}
                            disabled={commentsLoading}
                            className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {commentsLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Load more comments'
                            )}
                        </button>
                    )}

                    {comments.length === 0 && !commentsLoading && (
                        <p className="text-center text-sm text-gray-500 py-4">
                            No comments yet. Be the first to comment!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

interface CommentItemProps {
    comment: Comment;
    currentUserId?: string;
    onLike: () => void;
    onDelete: () => void;
    formatTimeAgo: (date: string) => string;
}

function CommentItem({ comment, currentUserId, onLike, onDelete, formatTimeAgo }: CommentItemProps) {
    const author = comment.author;
    const hasLiked = currentUserId && comment.likes.includes(currentUserId);
    const isAuthor = currentUserId === author._id;

    const profilePhoto = author.profile?.profilePhoto;
    const userInitials = `${author.firstName.charAt(0)}${author.lastName.charAt(0)}`.toUpperCase();

    return (
        <div className="flex gap-2">
            {/* Avatar */}
            {profilePhoto ? (
                <img 
                    src={profilePhoto}
                    alt={`${author.firstName} ${author.lastName}`}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {userInitials}
                </div>
            )}

            {/* Comment Content */}
            <div className="flex-1">
                <div className="bg-white rounded-2xl px-3 py-2 inline-block">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">
                            {author.firstName} {author.lastName}
                        </span>
                        {author.profile?.batch && (
                            <span className="text-xs text-gray-500">'{author.profile.batch.slice(-2)}</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                </div>

                {/* Comment Actions */}
                <div className="flex items-center gap-4 mt-1 ml-2">
                    <button
                        onClick={onLike}
                        className={`text-xs font-medium transition-colors ${
                            hasLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                        }`}
                    >
                        Like {comment.likeCount > 0 && `(${comment.likeCount})`}
                    </button>
                    <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                    {isAuthor && (
                        <button
                            onClick={onDelete}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
