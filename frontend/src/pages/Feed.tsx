/**
 * @fileoverview Discussion Forum Page
 * Main feed page for discussion posts with rooms, posts, and trending.
 * 
 * @module pages/Feed
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchPosts, fetchPostsByHashtag, fetchRooms, fetchPostById } from '../services/discussionService';
import { fetchEvents } from '../services/eventsService';
import { setSelectedRoom, setPosts, setSelectedPost } from '../redux/slices/discussionSlice';
import type { DiscussionRoom } from '../redux/slices/discussionSlice';
import { 
    DiscussionRoomSidebar, 
    CreatePostBox, 
    PostCard, 
    TrendingSidebar 
} from '../components/Discussion';
import { Loader2, RefreshCw, MessageSquare } from 'lucide-react';

export default function Feed() {
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { 
        posts, 
        postsLoading, 
        postsPagination, 
        selectedRoom,
        selectedPost,
        rooms 
    } = useAppSelector(state => state.discussion);
    const { events } = useAppSelector(state => state.events);
    const { user } = useAppSelector(state => state.auth);
    
    const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
    const [showMobileRooms, setShowMobileRooms] = useState(false);
    const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Handle specific post from URL query parameter
    const postIdFromUrl = searchParams.get('post');

    // Fetch specific post if URL has post parameter
    useEffect(() => {
        if (postIdFromUrl) {
            dispatch(fetchPostById(postIdFromUrl));
            setHighlightedPostId(postIdFromUrl);
            // Clear highlight after 3 seconds
            const timer = setTimeout(() => setHighlightedPostId(null), 3000);
            return () => clearTimeout(timer);
        } else {
            dispatch(setSelectedPost(null));
        }
    }, [dispatch, postIdFromUrl]);

    // Scroll to the specific post when it's loaded
    useEffect(() => {
        if (postIdFromUrl) {
            // Check if post exists either in posts array or as selectedPost
            const postInFeed = posts.find(p => p._id === postIdFromUrl);
            const postToScrollTo = postInFeed || selectedPost;
            
            if (postToScrollTo) {
                const postElement = postRefs.current[postIdFromUrl];
                if (postElement) {
                    setTimeout(() => {
                        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            }
        }
    }, [postIdFromUrl, posts, selectedPost]);

    // Initial data fetch
    useEffect(() => {
        dispatch(fetchRooms());
        dispatch(fetchEvents());
    }, [dispatch]);

    // Fetch posts when room or hashtag changes
    useEffect(() => {
        if (selectedHashtag) {
            dispatch(fetchPostsByHashtag({ tag: selectedHashtag }));
        } else {
            dispatch(fetchPosts({ roomId: selectedRoom?._id, page: 1 }));
        }
    }, [dispatch, selectedRoom, selectedHashtag]);

    // Handle room selection
    const handleRoomSelect = (room: DiscussionRoom | null) => {
        setSelectedHashtag(null); // Clear hashtag filter
        dispatch(setSelectedRoom(room));
        setShowMobileRooms(false);
    };

    // Handle hashtag click
    const handleHashtagClick = (tag: string) => {
        setSelectedHashtag(tag);
        dispatch(setSelectedRoom(null)); // Clear room filter
    };

    // Clear hashtag filter
    const clearHashtagFilter = () => {
        setSelectedHashtag(null);
        dispatch(fetchPosts({ page: 1 }));
    };

    // Load more posts
    const loadMorePosts = useCallback(() => {
        if (!postsLoading && postsPagination && postsPagination.page < postsPagination.pages) {
            if (selectedHashtag) {
                dispatch(fetchPostsByHashtag({ 
                    tag: selectedHashtag, 
                    page: postsPagination.page + 1 
                }));
            } else {
                dispatch(fetchPosts({ 
                    roomId: selectedRoom?._id, 
                    page: postsPagination.page + 1,
                    append: true 
                }));
            }
        }
    }, [dispatch, postsLoading, postsPagination, selectedRoom, selectedHashtag]);

    // Infinite scroll observer
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [loadMorePosts]);

    // Refresh posts
    const handleRefresh = () => {
        dispatch(setPosts([]));
        if (selectedHashtag) {
            dispatch(fetchPostsByHashtag({ tag: selectedHashtag, page: 1 }));
        } else {
            dispatch(fetchPosts({ roomId: selectedRoom?._id, page: 1 }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6">
                    {/* Left Sidebar - Discussion Rooms */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <DiscussionRoomSidebar onRoomSelect={handleRoomSelect} />
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
                        {/* Mobile Room Selector */}
                        <div className="lg:hidden mb-4">
                            <button
                                onClick={() => setShowMobileRooms(!showMobileRooms)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-gray-700">
                                        {selectedRoom ? selectedRoom.name : 'All Posts'}
                                    </span>
                                </div>
                                <span className="text-gray-400">▼</span>
                            </button>
                            
                            {showMobileRooms && (
                                <div className="mt-2 bg-white rounded-xl shadow-lg p-2 absolute z-20 left-4 right-4">
                                    <button
                                        onClick={() => handleRoomSelect(null)}
                                        className={`w-full px-4 py-2 text-left rounded-lg ${
                                            !selectedRoom ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        🏠 All Posts
                                    </button>
                                    {rooms.map(room => (
                                        <button
                                            key={room._id}
                                            onClick={() => handleRoomSelect(room)}
                                            className={`w-full px-4 py-2 text-left rounded-lg ${
                                                selectedRoom?._id === room._id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            {room.icon} {room.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Hashtag Filter Badge */}
                        {selectedHashtag && (
                            <div className="mb-4 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                                <span className="text-sm">
                                    Showing posts for <strong>#{selectedHashtag}</strong>
                                </span>
                                <button
                                    onClick={clearHashtagFilter}
                                    className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Clear filter
                                </button>
                            </div>
                        )}

                        {/* Create Post Box */}
                        {user && <CreatePostBox selectedRoom={selectedRoom} />}

                        {/* Refresh Button */}
                        <div className="flex justify-end mt-4 mb-2">
                            <button
                                onClick={handleRefresh}
                                disabled={postsLoading}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${postsLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {/* Posts Feed */}
                        <div className="space-y-4">
                            {/* Show the linked post at the top if it's not in the feed */}
                            {selectedPost && postIdFromUrl && !posts.find(p => p._id === selectedPost._id) && (
                                <div
                                    ref={(el) => { postRefs.current[selectedPost._id] = el; }}
                                    className={`transition-all duration-500 ${
                                        highlightedPostId === selectedPost._id 
                                            ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' 
                                            : ''
                                    }`}
                                >
                                    <PostCard post={selectedPost} />
                                </div>
                            )}
                            
                            {postsLoading && posts.length === 0 && !selectedPost ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                                    <span className="text-gray-500 text-sm">Loading posts...</span>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No posts yet</h3>
                                    <p className="text-gray-500 text-sm">
                                        {user 
                                            ? 'Be the first to start a discussion!' 
                                            : 'Sign in to join the discussion.'}
                                    </p>
                                </div>
                            ) : (
                                posts.map(post => (
                                    <div
                                        key={post._id}
                                        ref={(el) => { postRefs.current[post._id] = el; }}
                                        className={`transition-all duration-500 ${
                                            highlightedPostId === post._id 
                                                ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' 
                                                : ''
                                        }`}
                                    >
                                        <PostCard post={post} />
                                    </div>
                                ))
                            )}

                            {/* Load More Trigger */}
                            <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                                {postsLoading && posts.length > 0 && (
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                )}
                            </div>

                            {/* End of Posts */}
                            {postsPagination && postsPagination.page >= postsPagination.pages && posts.length > 0 && (
                                <p className="text-center text-sm text-gray-400 py-4">
                                    You've reached the end
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Trending */}
                    <div className="hidden xl:block w-72 flex-shrink-0">
                        <div className="sticky top-24">
                            <TrendingSidebar 
                                events={events} 
                                onHashtagClick={handleHashtagClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
