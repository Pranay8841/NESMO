/**
 * @fileoverview Discussion Forum Redux Slice
 * Manages global state for discussion rooms, posts, comments, and trending.
 * 
 * @module redux/slices/discussionSlice
 */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/* ==================== Type Definitions ==================== */

export interface UserProfile {
    _id?: string;
    profilePhoto?: string;
    batch?: string;
    currentPosition?: string;
    currentCompany?: string;
}

export interface PostAuthor {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    profile?: UserProfile;
}

export interface DiscussionRoom {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    icon: string;
    color: string;
    postCount: number;
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface PollOption {
    _id: string;
    text: string;
    votes: string[];
}

export interface Poll {
    question: string;
    options: PollOption[];
    expiresAt?: string;
    allowMultiple: boolean;
}

export interface Post {
    _id: string;
    author: PostAuthor;
    room: DiscussionRoom | string;
    content: string;
    images: string[];
    poll?: Poll;
    hashtags: string[];
    likes: string[];
    likeCount: number;
    commentCount: number;
    shareCount: number;
    isPinned: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    _id: string;
    post: string;
    author: PostAuthor;
    parentComment?: string;
    content: string;
    likes: string[];
    likeCount: number;
    replyCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Hashtag {
    _id: string;
    tag: string;
    category: 'CAREER' | 'NETWORK' | 'CULTURE' | 'GENERAL';
    useCount: number;
    weeklyCount: number;
    lastUsed: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

/* ==================== State Interface ==================== */

interface DiscussionState {
    // Discussion Rooms
    rooms: DiscussionRoom[];
    selectedRoom: DiscussionRoom | null;
    roomsLoading: boolean;

    // Posts
    posts: Post[];
    selectedPost: Post | null;
    postsLoading: boolean;
    postsPagination: Pagination | null;

    // Comments
    comments: Comment[];
    commentsLoading: boolean;
    commentsPagination: Pagination | null;

    // Trending
    trending: Hashtag[];
    trendingGrouped: {
        CAREER: Hashtag[];
        NETWORK: Hashtag[];
        CULTURE: Hashtag[];
        GENERAL: Hashtag[];
    };
    trendingLoading: boolean;
}

const initialState: DiscussionState = {
    rooms: [],
    selectedRoom: null,
    roomsLoading: false,

    posts: [],
    selectedPost: null,
    postsLoading: false,
    postsPagination: null,

    comments: [],
    commentsLoading: false,
    commentsPagination: null,

    trending: [],
    trendingGrouped: {
        CAREER: [],
        NETWORK: [],
        CULTURE: [],
        GENERAL: []
    },
    trendingLoading: false,
};

/* ==================== Slice Definition ==================== */

export const discussionSlice = createSlice({
    name: "discussion",
    initialState,
    reducers: {
        // Loading states
        setRoomsLoading: (state, action: PayloadAction<boolean>) => {
            state.roomsLoading = action.payload;
        },
        setPostsLoading: (state, action: PayloadAction<boolean>) => {
            state.postsLoading = action.payload;
        },
        setCommentsLoading: (state, action: PayloadAction<boolean>) => {
            state.commentsLoading = action.payload;
        },
        setTrendingLoading: (state, action: PayloadAction<boolean>) => {
            state.trendingLoading = action.payload;
        },

        // Rooms
        setRooms: (state, action: PayloadAction<DiscussionRoom[]>) => {
            state.rooms = action.payload;
        },
        setSelectedRoom: (state, action: PayloadAction<DiscussionRoom | null>) => {
            state.selectedRoom = action.payload;
        },

        // Posts
        setPosts: (state, action: PayloadAction<Post[]>) => {
            state.posts = action.payload;
        },
        appendPosts: (state, action: PayloadAction<Post[]>) => {
            state.posts = [...state.posts, ...action.payload];
        },
        setSelectedPost: (state, action: PayloadAction<Post | null>) => {
            state.selectedPost = action.payload;
        },
        setPostsPagination: (state, action: PayloadAction<Pagination | null>) => {
            state.postsPagination = action.payload;
        },
        addPost: (state, action: PayloadAction<Post>) => {
            state.posts = [action.payload, ...state.posts];
        },
        updatePostInState: (state, action: PayloadAction<Post>) => {
            const index = state.posts.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                state.posts[index] = action.payload;
            }
            if (state.selectedPost?._id === action.payload._id) {
                state.selectedPost = action.payload;
            }
        },
        removePostFromState: (state, action: PayloadAction<string>) => {
            state.posts = state.posts.filter(p => p._id !== action.payload);
            if (state.selectedPost?._id === action.payload) {
                state.selectedPost = null;
            }
        },
        updatePostLikes: (state, action: PayloadAction<{ postId: string; likes: string[]; likeCount: number }>) => {
            const index = state.posts.findIndex(p => p._id === action.payload.postId);
            if (index !== -1) {
                state.posts[index].likes = action.payload.likes;
                state.posts[index].likeCount = action.payload.likeCount;
            }
        },
        updatePostCommentCount: (state, action: PayloadAction<{ postId: string; commentCount: number }>) => {
            const index = state.posts.findIndex(p => p._id === action.payload.postId);
            if (index !== -1) {
                state.posts[index].commentCount = action.payload.commentCount;
            }
        },
        updatePostShareCount: (state, action: PayloadAction<{ postId: string; shareCount: number }>) => {
            const index = state.posts.findIndex(p => p._id === action.payload.postId);
            if (index !== -1) {
                state.posts[index].shareCount = action.payload.shareCount;
            }
        },
        updatePostPollVote: (state, action: PayloadAction<{ postId: string; optionId: string; userId: string }>) => {
            const index = state.posts.findIndex(p => p._id === action.payload.postId);
            if (index !== -1 && state.posts[index].poll) {
                const poll = state.posts[index].poll!;
                // Remove user's previous vote from all options (if single-choice poll)
                if (!poll.allowMultiple) {
                    poll.options.forEach(opt => {
                        opt.votes = opt.votes.filter(v => v !== action.payload.userId);
                    });
                }
                // Add vote to selected option
                const optionIndex = poll.options.findIndex(opt => opt._id === action.payload.optionId);
                if (optionIndex !== -1 && !poll.options[optionIndex].votes.includes(action.payload.userId)) {
                    poll.options[optionIndex].votes.push(action.payload.userId);
                }
            }
            // Also update selectedPost if it matches
            if (state.selectedPost?._id === action.payload.postId && state.selectedPost.poll) {
                const poll = state.selectedPost.poll;
                if (!poll.allowMultiple) {
                    poll.options.forEach(opt => {
                        opt.votes = opt.votes.filter(v => v !== action.payload.userId);
                    });
                }
                const optionIndex = poll.options.findIndex(opt => opt._id === action.payload.optionId);
                if (optionIndex !== -1 && !poll.options[optionIndex].votes.includes(action.payload.userId)) {
                    poll.options[optionIndex].votes.push(action.payload.userId);
                }
            }
        },

        // Comments
        setComments: (state, action: PayloadAction<Comment[]>) => {
            state.comments = action.payload;
        },
        appendComments: (state, action: PayloadAction<Comment[]>) => {
            state.comments = [...state.comments, ...action.payload];
        },
        setCommentsPagination: (state, action: PayloadAction<Pagination | null>) => {
            state.commentsPagination = action.payload;
        },
        addComment: (state, action: PayloadAction<Comment>) => {
            state.comments = [action.payload, ...state.comments];
        },
        removeCommentFromState: (state, action: PayloadAction<string>) => {
            state.comments = state.comments.filter(c => c._id !== action.payload);
        },
        updateCommentLikes: (state, action: PayloadAction<{ commentId: string; likes: string[]; likeCount: number }>) => {
            const index = state.comments.findIndex(c => c._id === action.payload.commentId);
            if (index !== -1) {
                state.comments[index].likes = action.payload.likes;
                state.comments[index].likeCount = action.payload.likeCount;
            }
        },

        // Trending
        setTrending: (state, action: PayloadAction<Hashtag[]>) => {
            state.trending = action.payload;
        },
        setTrendingGrouped: (state, action: PayloadAction<DiscussionState['trendingGrouped']>) => {
            state.trendingGrouped = action.payload;
        },

        // Reset
        resetDiscussionState: () => initialState,
    },
});

export const {
    setRoomsLoading,
    setPostsLoading,
    setCommentsLoading,
    setTrendingLoading,
    setRooms,
    setSelectedRoom,
    setPosts,
    appendPosts,
    setSelectedPost,
    setPostsPagination,
    addPost,
    updatePostInState,
    removePostFromState,
    updatePostLikes,
    updatePostCommentCount,
    updatePostShareCount,
    updatePostPollVote,
    setComments,
    appendComments,
    setCommentsPagination,
    addComment,
    removeCommentFromState,
    updateCommentLikes,
    setTrending,
    setTrendingGrouped,
    resetDiscussionState,
} = discussionSlice.actions;

export default discussionSlice.reducer;
