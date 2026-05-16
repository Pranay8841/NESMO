import { GraduationCap, CreditCard, Briefcase, HandHeart, Calendar, ArrowRight, Stethoscope } from 'lucide-react';

const aboutImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk9mlifc_Z2mUTedPuqK_1HlkASNMT1AdtbHeOv92RSt-nsH0ExK4qqw6owWjAvUMWccLRlHvj_PtxbzKmkZw_5E3tlEyevZjxmppmna9RYj43qe7U5uOVrYeIWUwDEBfL6Xp2Sa8rM3vC5J5DLeZv2bH8n8BSP1Qe7fKWTOETh0pZz7M6K6zzWkpScOCxiW4ZwLdj0MNJeGnoihEwZBHad_xvK84ElBxVzKNfU6hBvxxWb0QAPTXEHUYDOzPKZgccy7_06u7PQN4V';

export default function App() {
    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Left Section - Main Content */}
                    <div className="lg:col-span-2">
                        {/* Header */}
                        <div className="mb-8 sm:mb-12">
                            <div className="flex items-center gap-3 mb-3 sm:mb-4">
                                <div className="w-6 sm:w-8 h-0.5 bg-yellow-500"></div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">WHAT WE DO</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                                Empowering Our <span className="text-blue-600">Community</span>
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                                We provide comprehensive support systems designed to foster growth, connection, and well-being for every member of the Navodaya family.
                            </p>
                        </div>

                        {/* Feature Cards Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Alumni Directory */}
                            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Alumni Directory</h3>
                                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                                    Connect with batchmates and seniors globally through our secure database.
                                </p>
                                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>

                            {/* Membership Benefits */}
                            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Membership Benefits</h3>
                                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                                    Unlock exclusive perks, discounts, and networking opportunities.
                                </p>
                                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>

                            {/* Medical Helpline */}
                            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Medical Helpline</h3>
                                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                                    24/7 emergency support and professional health consultations.
                                </p>
                                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>

                            {/* Career Guidance */}
                            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Career Guidance</h3>
                                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                                    Mentorship programs, resume reviews, and direct job placements.
                                </p>
                                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>

                            {/* Financial Aid */}
                            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <HandHeart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Financial Aid</h3>
                                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                                    Scholarships for students and crisis relief funds for alumni.
                                </p>
                                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>

                            {/* Events */}
                            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Events</h3>
                                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                                    Annual reunions, regional meets, and skill-building workshops.
                                </p>
                                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - About Card */}
                    <div className="lg:col-span-1 mt-8 lg:mt-0">
                        <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm sticky top-20 sm:top-24">
                            {/* Image */}
                            <div className="relative h-40 sm:h-48">
                                <img
                                    src={aboutImage}
                                    alt="NESMO Community"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                                    <p className="text-white text-xs font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">WHO WE ARE</p>
                                    <h2 className="text-white text-xl sm:text-2xl font-bold">About NESMO</h2>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 sm:p-6">
                                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                                    Founded on the principles of unity and support, NESMO connects thousands of Navodaya alumni worldwide. Our mission is to foster lifelong relationships and provide tangible support systems that extend beyond our school years.
                                </p>
                                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                                    We bridge the gap between generations, offering a platform where experience meets enthusiasm. From professional networking to crisis intervention, we stand together.
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="text-center">
                                        <p className="text-lg sm:text-2xl font-bold text-blue-600">10k+</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Members</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg sm:text-2xl font-bold text-blue-600">25+</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Chapters</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg sm:text-2xl font-bold text-blue-600">15</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Years</p>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                                    Read Full Story
                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
