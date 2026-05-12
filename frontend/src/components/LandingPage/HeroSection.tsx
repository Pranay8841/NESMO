import { Calendar, Users, Search } from 'lucide-react';

const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9VhaArLjZA6blIfXsliolvoREVM3-1wAV70sovNDQkZAUOLgNSIDMPFpFrPX6kyOXS98B1jyh2ZoeEaZ4mF6TC-vAb4oS1c0ftTnJMSdMrg-z1ObAKbMsk7xh8d7L01MdKHb-V9EBBEonjl9VUGtK8o4fx7qzk9zi6ofZk4gnre-D_kQfdlAH64MG3PIG0T-7PWpgnWsahn15LPrm6FOBdhjE9K4Xzo1_PByUYOpPjCISBTfzz5MxdHwuPOQQnXRkj9s89D7ApmU_';

export default function HeroSection() {
    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Left Content */}
                    <div>
                        <div className="inline-block mb-3 sm:mb-4">
                            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 sm:py-1.5 bg-blue-100 text-blue-600 rounded-md text-[10px] sm:text-xs font-medium">
                                Official Alumni Network
                            </span>
                        </div>

                        <h1 className="mt-2 sm:mt-4 lg:mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 leading-tight">
                            Connecting<br />
                            Navodayans<br />
                            Across the Globe
                        </h1>

                        <p className="mt-3 sm:mt-4 lg:mt-6 text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-xl">
                            The official platform for alumni to network, support, and grow together. Whether you are looking for mentorship, career opportunities, or simply to reconnect, NESMO is your bridge to a thriving community of excellence.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
                            <button className="w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 bg-orange-500 text-white rounded-lg font-medium text-xs sm:text-sm hover:bg-orange-600 transition flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                Join Membership
                            </button>
                            <button className="w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-xs sm:text-sm hover:bg-blue-50 transition flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                                <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                                Explore Directory
                            </button>
                        </div>

                        {/* Recent Joiners */}
                        <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                            <div className="flex -space-x-1.5 sm:-space-x-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border border-sm border-white sm:border-2"></div>
                                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border border-sm border-white sm:border-2"></div>
                                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border border-sm border-white sm:border-2"></div>
                                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gray-200 border border-sm border-white sm:border-2 flex items-center justify-center">
                                    <span className="text-[8px] sm:text-xs font-semibold text-gray-600">+2k</span>
                                </div>
                            </div>
                            <span className="text-[10px] sm:text-xs lg:text-sm text-gray-600 text-center sm:text-left">Navodayans joined this month</span>
                        </div>
                    </div>

                    {/* Right Content - Image Card */}
                    <div className="mt-6 sm:mt-8 lg:mt-12 lg:mt-0 lg:shrink-0 lg:grow w-full max-w-2xl mx-auto lg:mx-0">
                        <div className="relative rounded-lg sm:rounded-xl lg:rounded-2xl bg-gray-900/5 p-1 sm:p-1.5 lg:p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 group">
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
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 rounded-lg bg-white/95 p-2 sm:p-3 lg:p-4 shadow-lg backdrop-blur supports-backdrop-filter:bg-white/60">

                                        {/* Icon */}
                                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[8px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Next Major Event
                                            </p>
                                            <p className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 truncate">
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
