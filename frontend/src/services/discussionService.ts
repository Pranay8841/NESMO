/**
 * @fileoverview Discussion Forum Service
 * Redux async thunks for discussion room, post, comment, and trending operations.
 * 
 * @module services/discussionService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestHeaders, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
    setRoomsLoading,
    setPostsLoading,
    setCommentsLoading,
    setTrendingLoading,
    setSuggestionsLoading,
    setRooms,
    setPosts,
    appendPosts,
    setSelectedPost,
    setPostsPagination,
    addPost,
    removePostFromState,
    updatePostLikes,
    updatePostCommentCount,
    updatePostShareCount,
    setComments,
    appendComments,
    setCommentsPagination,
    addComment,
    removeCommentFromState,
    updateCommentLikes,
    setTrending,
    setTrendingGrouped,
    setSuggestions,
} from '../redux/slices/discussionSlice';
import type { 
    DiscussionRoom, 
    Post, 
    Comment, 
    Hashtag,
    AlumniSuggestion,
    Pagination 
} from '../redux/slices/discussionSlice';
import { apiConnector } from '../utils/APIsConnector';
import { DISCUSSION_API } from '../utils/api';

/* ==================== Discussion Rooms ==================== */

/**
 * Fetch all discussion rooms.
 */
export const fetchRooms = createAsyncThunk(
    'discussion/fetchRooms',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setRoomsLoading(true));
            const response = await apiConnector('GET', DISCUSSION_API.GET_ROOMS);
            dispatch(setRooms(response.data.data));
            dispatch(setRoomsLoading(false));
            return response.data.data as DiscussionRoom[];
        } catch (error) {
            dispatch(setRoomsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch rooms';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Seed default rooms (Admin).
 */
export const seedRooms = createAsyncThunk(
    'discussion/seedRooms',
    async (_, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Seeding default rooms...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'POST',
                DISCUSSION_API.SEED_ROOMS,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(setRooms(response.data.data));
            toast.success('Rooms seeded successfully!', { id: toastId });
            return response.data.data as DiscussionRoom[];
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to seed rooms';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/* ==================== Posts ==================== */

interface FetchPostsParams {
    roomId?: string;
    page?: number;
    limit?: number;
    append?: boolean;
}

/**
 * Fetch posts feed with optional room filter.
 */
export const fetchPosts = createAsyncThunk(
    'discussion/fetchPosts',
    async ({ roomId, page = 1, limit = 10, append = false }: FetchPostsParams, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setPostsLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const params: Record<string, string | number> = { page, limit };
            if (roomId) params.roomId = roomId;
            
            const response = await apiConnector(
                'GET',
                DISCUSSION_API.GET_POSTS,
                null,
                token ? { Authorization: `Bearer ${token}` } as AxiosRequestHeaders : undefined,
                params
            );
            
            if (append) {
                dispatch(appendPosts(response.data.data));
            } else {
                dispatch(setPosts(response.data.data));
            }
            dispatch(setPostsPagination(response.data.pagination));
            dispatch(setPostsLoading(false));
            
            return {
                posts: response.data.data as Post[],
                pagination: response.data.pagination as Pagination
            };
        } catch (error) {
            dispatch(setPostsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch posts';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch single post by ID.
 */
export const fetchPostById = createAsyncThunk(
    'discussion/fetchPostById',
    async (postId: string, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setPostsLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'GET',
                `${DISCUSSION_API.GET_POST_BY_ID}/${postId}`,
                null,
                token ? { Authorization: `Bearer ${token}` } as AxiosRequestHeaders : undefined
            );
            
            dispatch(setSelectedPost(response.data.data));
            dispatch(setPostsLoading(false));
            return response.data.data as Post;
        } catch (error) {
            dispatch(setPostsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch post';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

interface CreatePostData {
    roomId: string;
    content: string;
    hashtags?: string[];
    images?: File[];
    poll?: {
        question: string;
        options: string[];
        expiresAt?: string;
        allowMultiple?: boolean;
    };
}

/**
 * Create a new post.
 */
export const createPost = createAsyncThunk(
    'discussion/createPost',
    async (postData: CreatePostData, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Creating post...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const formData = new FormData();
            formData.append('roomId', postData.roomId);
            formData.append('content', postData.content);
            
            if (postData.hashtags) {
                formData.append('hashtags', JSON.stringify(postData.hashtags));
            }
            
            if (postData.poll) {
                const pollData = {
                    question: postData.poll.question,
                    options: postData.poll.options.map(text => ({ text, votes: [] })),
                    expiresAt: postData.poll.expiresAt,
                    allowMultiple: postData.poll.allowMultiple || false
                };
                formData.append('poll', JSON.stringify(pollData));
            }
            
            if (postData.images) {
                postData.images.forEach(file => {
                    formData.append('images', file);
                });
            }
            
            const response = await apiConnector(
                'POST',
                DISCUSSION_API.CREATE_POST,
                formData,
                { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                } as AxiosRequestHeaders
            );
            
            dispatch(addPost(response.data.data));
            toast.success('Post created successfully!', { id: toastId });
            return response.data.data as Post;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to create post';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Delete a post.
 */
export const deletePost = createAsyncThunk(
    'discussion/deletePost',
    async (postId: string, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Deleting post...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            await apiConnector(
                'DELETE',
                `${DISCUSSION_API.DELETE_POST}/${postId}`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(removePostFromState(postId));
            toast.success('Post deleted successfully!', { id: toastId });
            return postId;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to delete post';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Like/Unlike a post.
 */
export const toggleLikePost = createAsyncThunk(
    'discussion/toggleLikePost',
    async (postId: string, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { 
                auth: { token: string | null; user: { _id: string } | null };
                discussion: { posts: Post[] }
            };
            const token = state.auth.token;
            const userId = state.auth.user?._id;
            
            // Optimistic update
            const post = state.discussion.posts.find(p => p._id === postId);
            if (post && userId) {
                const isLiked = post.likes.includes(userId);
                const newLikes = isLiked 
                    ? post.likes.filter(id => id !== userId)
                    : [...post.likes, userId];
                dispatch(updatePostLikes({ 
                    postId, 
                    likes: newLikes, 
                    likeCount: newLikes.length 
                }));
            }
            
            const response = await apiConnector(
                'POST',
                `${DISCUSSION_API.TOGGLE_LIKE_POST}/${postId}/like`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            return response.data.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to like post';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Share a post.
 */
export const sharePost = createAsyncThunk(
    'discussion/sharePost',
    async (postId: string, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'POST',
                `${DISCUSSION_API.SHARE_POST}/${postId}/share`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(updatePostShareCount({ postId, shareCount: response.data.data.shareCount }));
            toast.success('Post shared!');
            return response.data.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to share post';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Vote on a poll.
 */
export const votePoll = createAsyncThunk(
    'discussion/votePoll',
    async ({ postId, optionId }: { postId: string; optionId: string }, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'POST',
                `${DISCUSSION_API.VOTE_POLL}/${postId}/vote`,
                { optionId },
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            // Refetch the post to get updated poll data
            dispatch(fetchPostById(postId));
            
            return response.data.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to vote';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/* ==================== Comments ==================== */

interface FetchCommentsParams {
    postId: string;
    page?: number;
    limit?: number;
    append?: boolean;
}

/**
 * Fetch comments for a post.
 */
export const fetchComments = createAsyncThunk(
    'discussion/fetchComments',
    async ({ postId, page = 1, limit = 20, append = false }: FetchCommentsParams, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setCommentsLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'GET',
                `${DISCUSSION_API.GET_COMMENTS}/${postId}/comments`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders,
                { page, limit }
            );
            
            if (append) {
                dispatch(appendComments(response.data.data));
            } else {
                dispatch(setComments(response.data.data));
            }
            dispatch(setCommentsPagination(response.data.pagination));
            dispatch(setCommentsLoading(false));
            
            return {
                comments: response.data.data as Comment[],
                pagination: response.data.pagination as Pagination
            };
        } catch (error) {
            dispatch(setCommentsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch comments';
            return rejectWithValue(errorMessage);
        }
    }
);

interface CreateCommentData {
    postId: string;
    content: string;
    parentCommentId?: string;
}

/**
 * Create a comment.
 */
export const createComment = createAsyncThunk(
    'discussion/createComment',
    async ({ postId, content, parentCommentId }: CreateCommentData, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { 
                auth: { token: string | null };
                discussion: { posts: Post[] }
            };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'POST',
                `${DISCUSSION_API.CREATE_COMMENT}/${postId}/comments`,
                { content, parentCommentId },
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(addComment(response.data.data));
            
            // Update post comment count
            const post = state.discussion.posts.find(p => p._id === postId);
            if (post) {
                dispatch(updatePostCommentCount({ 
                    postId, 
                    commentCount: post.commentCount + 1 
                }));
            }
            
            toast.success('Comment added!');
            return response.data.data as Comment;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to add comment';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Delete a comment.
 */
export const deleteComment = createAsyncThunk(
    'discussion/deleteComment',
    async ({ commentId, postId }: { commentId: string; postId: string }, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { 
                auth: { token: string | null };
                discussion: { posts: Post[] }
            };
            const token = state.auth.token;
            
            await apiConnector(
                'DELETE',
                `${DISCUSSION_API.DELETE_COMMENT}/${commentId}`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            dispatch(removeCommentFromState(commentId));
            
            // Update post comment count
            const post = state.discussion.posts.find(p => p._id === postId);
            if (post) {
                dispatch(updatePostCommentCount({ 
                    postId, 
                    commentCount: Math.max(0, post.commentCount - 1) 
                }));
            }
            
            toast.success('Comment deleted!');
            return commentId;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to delete comment';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Like/Unlike a comment.
 */
export const toggleLikeComment = createAsyncThunk(
    'discussion/toggleLikeComment',
    async (commentId: string, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { 
                auth: { token: string | null; user: { _id: string } | null };
                discussion: { comments: Comment[] }
            };
            const token = state.auth.token;
            const userId = state.auth.user?._id;
            
            // Optimistic update
            const comment = state.discussion.comments.find(c => c._id === commentId);
            if (comment && userId) {
                const isLiked = comment.likes.includes(userId);
                const newLikes = isLiked 
                    ? comment.likes.filter(id => id !== userId)
                    : [...comment.likes, userId];
                dispatch(updateCommentLikes({ 
                    commentId, 
                    likes: newLikes, 
                    likeCount: newLikes.length 
                }));
            }
            
            const response = await apiConnector(
                'POST',
                `${DISCUSSION_API.TOGGLE_LIKE_COMMENT}/${commentId}/like`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            return response.data.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to like comment';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/* ==================== Trending & Suggestions ==================== */

/**
 * Fetch trending hashtags.
 */
export const fetchTrending = createAsyncThunk(
    'discussion/fetchTrending',
    async (limit: number = 10, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setTrendingLoading(true));
            const response = await apiConnector(
                'GET',
                DISCUSSION_API.GET_TRENDING,
                null,
                undefined,
                { limit }
            );
            
            dispatch(setTrending(response.data.data.trending));
            dispatch(setTrendingGrouped(response.data.data.grouped));
            dispatch(setTrendingLoading(false));
            
            return response.data.data as { trending: Hashtag[]; grouped: Record<string, Hashtag[]> };
        } catch (error) {
            dispatch(setTrendingLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch trending';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch posts by hashtag.
 */
export const fetchPostsByHashtag = createAsyncThunk(
    'discussion/fetchPostsByHashtag',
    async ({ tag, page = 1, limit = 10 }: { tag: string; page?: number; limit?: number }, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setPostsLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'GET',
                `${DISCUSSION_API.GET_POSTS_BY_HASHTAG}/${tag}`,
                null,
                token ? { Authorization: `Bearer ${token}` } as AxiosRequestHeaders : undefined,
                { page, limit }
            );
            
            dispatch(setPosts(response.data.data));
            dispatch(setPostsPagination(response.data.pagination));
            dispatch(setPostsLoading(false));
            
            return {
                posts: response.data.data as Post[],
                pagination: response.data.pagination as Pagination
            };
        } catch (error) {
            dispatch(setPostsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch posts';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch alumni suggestions for "Connect with Alumni".
 */
export const fetchSuggestions = createAsyncThunk(
    'discussion/fetchSuggestions',
    async (limit: number = 5, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setSuggestionsLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            const response = await apiConnector(
                'GET',
                DISCUSSION_API.GET_SUGGESTIONS,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders,
                { limit }
            );
            
            dispatch(setSuggestions(response.data.data));
            dispatch(setSuggestionsLoading(false));
            
            return response.data.data as AlumniSuggestion[];
        } catch (error) {
            dispatch(setSuggestionsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch suggestions';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Seed default hashtags (Admin).
 */
export const seedHashtags = createAsyncThunk(
    'discussion/seedHashtags',
    async (_, { getState, rejectWithValue }) => {
        const toastId = toast.loading('Seeding hashtags...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;
            
            await apiConnector(
                'POST',
                DISCUSSION_API.SEED_HASHTAGS,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );
            
            toast.success('Hashtags seeded successfully!', { id: toastId });
            return true;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to seed hashtags';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);
