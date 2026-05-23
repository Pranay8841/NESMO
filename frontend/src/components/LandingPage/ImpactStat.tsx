import { useEffect, useState, useRef } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { apiConnector } from '../../utils/APIsConnector';
import { ALUMNI_API, EVENTS_API } from '../../utils/api';

/**
 * Animated counter hook — counts up from 0 to target when visible
 */
function useAnimatedCounter(target: number, isVisible: boolean, duration: number = 2000): number {
    const [count, setCount] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!isVisible || hasAnimated.current) return;
        hasAnimated.current = true;

        const startTime = performance.now();
        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };
        requestAnimationFrame(animate);
    }, [isVisible, target, duration]);

    return count;
}

export default function ImpactStats() {
    const [stats, setStats] = useState({
        members: 10000,
        events: 500,
        aid: 20,
    });
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

    const memberCount = useAnimatedCounter(stats.members, isVisible);
    const eventCount = useAnimatedCounter(stats.events, isVisible, 1800);
    const aidCount = useAnimatedCounter(stats.aid, isVisible, 1500);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const alumniResponse = await apiConnector(
                    'GET',
                    ALUMNI_API.GET_ALUMNI_DIRECTORY,
                    null,
                    undefined,
                    { page: 1, limit: 1 }
                );
                const memberCount = alumniResponse?.data?.totalCount || 10000;

                const eventsResponse = await apiConnector('GET', EVENTS_API.GET_EVENTS);
                const eventCount = Array.isArray(eventsResponse?.data) ? eventsResponse.data.length : 500;

                setStats({
                    members: memberCount,
                    events: eventCount > 100 ? eventCount : 500,
                    aid: 20,
                });
            } catch {
                // Keep defaults
            }
        };
        fetchStats();
    }, []);

    const formatCount = (num: number, suffix: string = '+') => {
        if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k${suffix}`;
        return `${num}${suffix}`;
    };

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
            <div ref={ref}
                 className={`bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 scroll-scale-in ${isVisible ? 'is-visible' : ''}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 lg:gap-8">
                    {/* Our Impact */}
                    <div className="border-b sm:border-b-0 sm:border-r border-blue-400/30 pb-4 sm:pb-0 sm:pr-4 lg:pr-6 lg:pr-8">
                        <h3 className="text-white text-base sm:text-lg lg:text-xl font-bold mb-0.5 sm:mb-1">Our Impact</h3>
                        <p className="text-blue-200 text-xs sm:text-sm">Growing stronger together</p>
                    </div>

                    {/* Alumni Registered */}
                    <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-blue-400/30 pb-4 sm:pb-0 sm:pr-4 lg:pr-6 lg:pr-8">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <span className="text-lg sm:text-xl lg:text-2xl">🎓</span>
                            <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold stat-number">{formatCount(memberCount)}</span>
                        </div>
                        <p className="text-blue-200 text-xs sm:text-sm">Alumni Registered</p>
                    </div>

                    {/* Events Organized */}
                    <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-blue-400/30 pb-4 sm:pb-0 sm:pr-4 lg:pr-6 lg:pr-8">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <span className="text-lg sm:text-xl lg:text-2xl">🎉</span>
                            <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold stat-number">{formatCount(eventCount)}</span>
                        </div>
                        <p className="text-blue-200 text-xs sm:text-sm">Events Organized</p>
                    </div>

                    {/* Aid Provided */}
                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <span className="text-lg sm:text-xl lg:text-2xl">👍</span>
                            <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold stat-number">₹{aidCount}L+</span>
                        </div>
                        <p className="text-blue-200 text-xs sm:text-sm">Aid Provided</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
