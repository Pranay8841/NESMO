import { Calendar, Users, Search } from 'lucide-react';

const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9VhaArLjZA6blIfXsliolvoREVM3-1wAV70sovNDQkZAUOLgNSIDMPFpFrPX6kyOXS98B1jyh2ZoeEaZ4mF6TC-vAb4oS1c0ftTnJMSdMrg-z1ObAKbMsk7xh8d7L01MdKHb-V9EBBEonjl9VUGtK8o4fx7qzk9zi6ofZk4gnre-D_kQfdlAH64MG3PIG0T-7PWpgnWsahn15LPrm6FOBdhjE9K4Xzo1_PByUYOpPjCISBTfzz5MxdHwuPOQQnXRkj9s89D7ApmU_';

export default function HeroSection() {
    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Left Content */}
                    <div>
                        <div className="inline-block">
                            <span className="px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-600 rounded-md text-xs font-medium">
                                Official Alumni Network
                            </span>
                        </div>

                        <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                            Connecting<br />
                            Navodayans<br />
                            Across the Globe
                        </h1>

                        <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                            The official platform for alumni to network, support, and grow together. Whether you are looking for mentorship, career opportunities, or simply to reconnect, NESMO is your bridge to a thriving community of excellence.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4">
                            <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition flex items-center justify-center sm:justify-start gap-2">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                Join Membership
                            </button>
                            <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition flex items-center justify-center sm:justify-start gap-2">
                                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                                Explore Directory
                            </button>
                        </div>

                        {/* Recent Joiners */}
                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-3">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                    <span className="text-xs font-semibold text-gray-600">+2k</span>
                                </div>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">Navodayans joined this month</span>
                        </div>
                    </div>

                    {/* Right Content - Image Card */}
                    <div className="mt-8 sm:mt-12 lg:mt-0 lg:shrink-0 lg:grow w-full max-w-2xl mx-auto lg:mx-0">
                        <div className="relative rounded-lg sm:rounded-2xl bg-gray-900/5 p-1.5 sm:p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 group">
                            <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-blue-600 shadow-lg sm:shadow-2xl">

                                {/* Image Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/60 via-transparent to-transparent z-10" />

                                {/* Main Hero Image */}
                                <div
                                    className="h-64 sm:h-80 md:h-96 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${heroImage})` }}
                                    aria-label="Alumni networking"
                                />

                                {/* Floating Event Card */}
                                <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 z-20">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 rounded-lg bg-white/95 p-3 sm:p-4 shadow-lg backdrop-blur supports-backdrop-filter:bg-white/60">

                                        {/* Icon */}
                                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                                            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Next Major Event
                                            </p>
                                            <p className="text-sm sm:text-base font-bold text-gray-900">
                                                Annual Alumni Meet 2024
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <div className="hidden sm:block ml-auto text-gray-400 flex-shrink-0">
                                            →
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
