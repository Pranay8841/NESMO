/**
 * @fileoverview Discussion Room Sidebar Component
 * Displays the list of discussion rooms for filtering posts.
 * 
 * @module components/Discussion/DiscussionRoomSidebar
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchRooms } from '../../services/discussionService';
import { setSelectedRoom } from '../../redux/slices/discussionSlice';
import type { DiscussionRoom } from '../../redux/slices/discussionSlice';
interface DiscussionRoomSidebarProps {
    onRoomSelect?: (room: DiscussionRoom | null) => void;
}

export default function DiscussionRoomSidebar({ onRoomSelect }: DiscussionRoomSidebarProps) {
    const dispatch = useAppDispatch();
    const { rooms, selectedRoom, roomsLoading } = useAppSelector(state => state.discussion);

    useEffect(() => {
        dispatch(fetchRooms());
    }, [dispatch]);

    const handleRoomClick = (room: DiscussionRoom | null) => {
        dispatch(setSelectedRoom(room));
        onRoomSelect?.(room);
    };

    // Map room icons to their emoji representations
    const getRoomIcon = (icon: string) => {
        const iconMap: Record<string, string> = {
            '💼': '💼',
            '💛': '💛',
            '🏥': '🏥',
            '👔': '👔',
            '📰': '📰',
            '💬': '💬'
        };
        return iconMap[icon] || icon;
    };

    if (roomsLoading) {
        return (
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    My Discussion Rooms
                </h3>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                            <div className="w-5 h-5 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded flex-1"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    My Discussion Rooms
                </h3>
            </div>

            {/* Room List */}
            <div className="p-2">
                {/* All Posts option */}
                <button
                    onClick={() => handleRoomClick(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                        selectedRoom === null
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <span className="text-lg">🏠</span>
                    <span className="font-medium text-sm">All Posts</span>
                </button>

                {rooms.map(room => (
                    <button
                        key={room._id}
                        onClick={() => handleRoomClick(room)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                            selectedRoom?._id === room._id
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{getRoomIcon(room.icon)}</span>
                            <span className="font-medium text-sm">{room.name}</span>
                        </div>
                        {room.postCount > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                selectedRoom?._id === room._id
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-500'
                            }`}>
                                {room.postCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
