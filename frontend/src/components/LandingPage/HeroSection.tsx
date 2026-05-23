import { Users, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../assets/Banner.jpeg';
import { apiConnector } from '../../utils/APIsConnector';
import { ALUMNI_API } from '../../utils/api';
import { useAppSelector } from '../../redux/hooks';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface RecentMember {
    id: string;
    firstName?: string;
    lastName?: string;
    name: string;
    photo?: string;
}

export default function HeroSection() {
    const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [loading, setLoading] = useState(true);
    const { token } = useAppSelector(state => state.auth);
    const navigate = useNavigate();

    const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation({ threshold: 0.05 });
    const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation({ threshold: 0.1 });

    useEffect(() => {
        const fetchRecentMembers = async () => {
            try {
                console.log('Fetching members...');
                const response = await apiConnector(
                    'GET',
                    ALUMNI_API.GET_ALUMNI_DIRECTORY,
                    null,
                    token ? { Authorization: `Bearer ${token}` } as any : {},
                    { page: 1, limit: 10 } as any
                );

                console.log('Members API Response:', response.data);

                if (response.data.success) {
                    console.log('Setting members:', response.data.data);
                    console.log('Total members count:', response.data.totalCount);
                    setRecentMembers(response.data.data);
                    setTotalMembers(response.data.totalCount);
                } else {
                    console.warn('API returned success: false', response.data);
                }
            } catch (error) {
                console.error('Failed to fetch recent members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentMembers();
    }, [token]);

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        return parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
    };

    const formatCount = (count: number) => {
        if (count >= 1000000) return `${Math.floor(count / 1000000)}M+`;
        if (count >= 10000) return `${Math.floor(count / 1000)}k+`;
        if (count >= 1000) {
            const k = (count / 1000).toFixed(1);
            return `${k}k+`;
        }
        if (count >= 100) return `${Math.floor(count / 100) * 100}+`;
        return count.toString();
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Left Content — scroll animated */}
                    <div ref={leftRef} className={`scroll-fade-in-left ${leftVisible ? 'is-visible' : ''}`}>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="inline-block">
                                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-600 rounded-md text-[10px] sm:text-xs font-medium whitespace-nowrap">
                                    Official Alumni Network
                                </span>
                            </div>
                        </div>

                        <h1 className="mt-2 sm:mt-4 lg:mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 leading-tight">
                            Where Navodayans<br />
                            <span className="gradient-text">Stay Connected</span><br />
                            For Life
                        </h1>

                        <p className="mt-3 sm:mt-4 lg:mt-6 text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-xl">
                            From mentorship and career opportunities to social initiatives and alumni support, NESMO empowers Navodayans to stay connected, strengthen lifelong bonds, and grow together beyond JNV.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-4">
                            <span className="tag-pill bg-blue-100 text-blue-800 border-l-2 border-blue-500">
                                Connect
                            </span>
                            <span className="tag-pill bg-green-100 text-green-800 border-l-2 border-green-500">
                                Support
                            </span>
                            <span className="tag-pill bg-red-100 text-red-800 border-l-2 border-red-500">
                                Grow
                            </span>
                            <span className="tag-pill bg-yellow-100 text-yellow-800 border-l-2 border-yellow-500">
                                Give Back
                            </span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
                            <button className="glow-button w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                Join Membership
                            </button>
                            <button 
                                onClick={() => navigate('/directory')}
                                className="w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-xs sm:text-sm hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 hover:-translate-y-0.5"
                            >
                                <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                                Explore Directory
                            </button>
                        </div>

                        {/* Recent Joiners */}
                        {!loading && (
                            <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                                <div className="flex -space-x-1.5 sm:-space-x-2">
                                    {recentMembers.slice(0, 4).map((member) => (
                                        <div
                                            key={member.id}
                                            className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full border border-sm border-white sm:border-2 overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-300 transition-transform hover:scale-110 hover:z-10"
                                            title={member.name}
                                        >
                                            {member.photo ? (
                                                <img
                                                    src={member.photo}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[8px] sm:text-xs font-semibold text-gray-700">
                                                    {getInitials(member.name)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {recentMembers.length > 4 && (
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gray-200 border border-sm border-white sm:border-2 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[8px] sm:text-xs font-semibold text-gray-600">
                                                {formatCount(totalMembers - 4)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] sm:text-xs lg:text-sm text-gray-600 text-center sm:text-left">
                                    {formatCount(totalMembers)} members joined
                                </span>
                            </div>
                        )}
                        {loading && (
                            <div className="mt-4 sm:mt-6 lg:mt-8 flex items-center gap-2 sm:gap-3">
                                <div className="flex -space-x-1.5 sm:-space-x-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gray-300 border border-sm border-white sm:border-2 animate-pulse"
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] sm:text-xs lg:text-sm text-gray-600">Loading members...</span>
                            </div>
                        )}
                    </div>

                    {/* Right Content - Image Card — scroll animated */}
                    <div ref={rightRef}
                         className={`mt-6 sm:mt-8 lg:mt-12 lg:mt-0 lg:shrink-0 lg:grow w-full max-w-2xl mx-auto lg:mx-0 scroll-fade-in-right ${rightVisible ? 'is-visible' : ''}`}>
                        <div className="relative rounded-lg sm:rounded-xl lg:rounded-2xl bg-gray-900/5 p-1 sm:p-1.5 lg:p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 group hover-gradient-ring">
                            <div className="relative overflow-hidden rounded-lg sm:rounded-lg lg:rounded-xl bg-blue-600 shadow-lg sm:shadow-xl lg:shadow-2xl">

                                {/* Image Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/60 via-transparent to-transparent z-10" />

                                {/* Main Hero Image */}
                                <div
                                    className="h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${heroImage})` }}
                                    aria-label="Alumni networking"
                                />

                                {/* Floating Event Card */}
                                <div className="absolute bottom-2 sm:bottom-3 lg:bottom-6 left-2 sm:left-3 lg:left-6 right-2 sm:right-3 lg:right-6 z-20">
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
