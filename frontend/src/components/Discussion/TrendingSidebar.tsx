/**
 * @fileoverview Trending Sidebar Component
 * Displays trending hashtags, alumni suggestions, and upcoming events.
 * 
 * @module components/Discussion/TrendingSidebar
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchTrending, fetchSuggestions } from '../../services/discussionService';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import type { Event } from '../../redux/slices/eventsSlice';

interface TrendingSidebarProps {
    events?: Event[];
    onHashtagClick?: (tag: string) => void;
}

export default function TrendingSidebar({ events = [], onHashtagClick }: TrendingSidebarProps) {
    const dispatch = useAppDispatch();
    const { trendingGrouped, trendingLoading, suggestions, suggestionsLoading } = useAppSelector(state => state.discussion);
    const { user } = useAppSelector(state => state.auth);

    useEffect(() => {
        dispatch(fetchTrending(10));
        if (user) {
            dispatch(fetchSuggestions(3));
        }
    }, [dispatch, user]);

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'CAREER': return { label: 'CAREER', color: 'text-blue-600' };
            case 'NETWORK': return { label: 'NETWORK', color: 'text-pink-600' };
            case 'CULTURE': return { label: 'CULTURE', color: 'text-purple-600' };
            default: return { label: 'GENERAL', color: 'text-gray-600' };
        }
    };

    // Get upcoming events (max 2)
    const upcomingEvents = events
        .filter(e => new Date(e.eventDate) > new Date())
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .slice(0, 2);

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            day: date.getDate()
        };
    };

    const getEventTypeLabel = (type: string, mode: string) => {
        if (mode === 'ONLINE') return 'LIVE DISCUSSION';
        return type || 'NETWORKING';
    };

    return (
        <div className="space-y-4">
            {/* Trending Now */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-900">Trending Now</h3>
                </div>

                {trendingLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Group hashtags by category */}
                        {(['CAREER', 'NETWORK', 'CULTURE', 'GENERAL'] as const).map(category => {
                            const tags = trendingGrouped[category];
                            if (!tags || tags.length === 0) return null;
                            
                            const { label, color } = getCategoryLabel(category);
                            const topTags = tags.slice(0, 3); // Show max 3 per category

                            return (
                                <div key={category}>
                                    <span className={`text-xs font-semibold ${color}`}>
                                        {label}
                                    </span>
                                    <div className="mt-1 space-y-1">
                                        {topTags.map(tag => (
                                            <button
                                                key={tag.tag}
                                                onClick={() => onHashtagClick?.(tag.tag)}
                                                className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded px-1 py-0.5 transition-colors group"
                                            >
                                                <span className="text-gray-900 font-medium group-hover:text-blue-600">
                                                    #{tag.tag.charAt(0).toUpperCase() + tag.tag.slice(1)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {tag.weeklyCount}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Show message if no hashtags at all */}
                        {Object.values(trendingGrouped).every(arr => !arr || arr.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-2">
                                No trending topics yet
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Connect with Alumni */}
            {user && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Connect with Alumni</h3>

                    {suggestionsLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="animate-pulse flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {suggestions.map(suggestion => {
                                const profilePhoto = suggestion.profileData?.profilePhoto;
                                const initials = `${suggestion.firstName.charAt(0)}${suggestion.lastName.charAt(0)}`.toUpperCase();
                                const position = suggestion.profileData?.currentPosition;
                                const batch = suggestion.profileData?.batch;

                                return (
                                    <div key={suggestion._id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {profilePhoto ? (
                                                <img 
                                                    src={profilePhoto}
                                                    alt={`${suggestion.firstName} ${suggestion.lastName}`}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                    {initials}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-sm text-gray-900 truncate max-w-[100px]">
                                                    {suggestion.firstName} {suggestion.lastName.charAt(0)}.
                                                </div>
                                                <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                                    {position || 'Alumni'}
                                                    {batch && ` • '${batch.slice(-2)}`}
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            to="/directory"
                                            className="text-xs text-blue-600 hover:underline font-medium"
                                        >
                                            Connect
                                        </Link>
                                    </div>
                                );
                            })}

                            <Link
                                to="/directory"
                                className="block text-center text-sm text-blue-600 hover:text-blue-700 pt-2"
                            >
                                View Suggestions
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Events Hub */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Events Hub</h3>

                {upcomingEvents.length === 0 ? (
                    <p className="text-sm text-gray-500">No upcoming events</p>
                ) : (
                    <div className="space-y-3">
                        {upcomingEvents.map(event => {
                            const { month, day } = formatEventDate(event.eventDate);
                            return (
                                <div key={event._id} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-12 h-14 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                                        <span className="text-xs font-medium text-blue-600">{month}</span>
                                        <span className="text-xl font-bold text-gray-900">{day}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm text-gray-900 line-clamp-1">
                                            {event.title}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase">
                                            {getEventTypeLabel(event.type, event.mode)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Link
                    to="/events"
                    className="mt-4 block w-full py-2 bg-blue-600 text-white text-center text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    All Events
                </Link>
            </div>
        </div>
    );
}
