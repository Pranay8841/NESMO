import {
    Camera, MapPin, Building2, GraduationCap,
    Eye, Users, Phone, Droplet, ChevronRight, Pencil, Upload, Info
} from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';

// Default avatar placeholder
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&size=128';

export default function Profile() {
    const { user } = useAppSelector((state) => state.auth);

    // Derive user info from Redux or use defaults
    const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User';
    const email = user?.email || '';
    // Generate avatar from user's initials
    const profileImage = user 
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff&size=128`
        : DEFAULT_AVATAR;
    const membershipStatus = user?.isMember ? 'MEMBER' : 'VISITOR';

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex gap-6">
                {/* Left Column */}
                <div className="flex-1">
                    {/* Profile Header */}
                    <div className="bg-white rounded-2xl p-8 mb-6 border border-gray-200">
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-32 h-32 rounded-full overflow-hidden">
                                    <img
                                        src={profileImage}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:bg-blue-700">
                                    <Camera className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-black text-gray-900">{fullName}</h1>
                                            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded flex items-center gap-1.5">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="6" cy="6" r="5" fill="currentColor" />
                                                </svg>
                                                {membershipStatus}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-blue-600 mb-3">Senior Software Engineer</h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                            <div className="flex items-center gap-1.5">
                                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                                <span>Batch of 2012</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>Bengaluru, Karnataka</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                <span>Global Tech Solutions</span>
                                            </div>
                                        </div>
                                        {email && (
                                            <p className="text-sm text-gray-500 mt-2">{email}</p>
                                        )}
                                    </div>
                                    <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2">
                                        <Pencil className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                        {/* Profile Views */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                    <Eye className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                                PROFILE VIEWS
                            </div>
                            <div className="text-3xl font-black text-gray-900">1,284</div>
                        </div>

                        {/* Connections */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                                    <Users className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                                CONNECTIONS
                            </div>
                            <div className="text-3xl font-black text-gray-900">450+</div>
                        </div>

                        {/* Batch Year */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                                    <GraduationCap className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                                BATCH YEAR
                            </div>
                            <div className="text-3xl font-black text-gray-900">2012</div>
                        </div>
                    </div>

                    {/* About Me */}
                    <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-black text-gray-900">About Me</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">
                            Highly motivated Senior Software Engineer with over 8 years of experience in building scalable cloud architectures. A proud Navodayan from JNV Lucknow, I am passionate about mentoring juniors and contributing to the NESMO community. Currently focused on distributed systems and high-performance web applications. Always open to networking with fellow alumni and exploring collaborative opportunities in the technology sector. I enjoy hiking on weekends and volunteering for local educational initiatives.
                        </p>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-5">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="7" r="3" fill="#F59E0B" />
                                <path d="M4 17C4 14 6.5 12 10 12C13.5 12 16 14 16 17" fill="#F59E0B" />
                            </svg>
                            <h2 className="text-lg font-black text-gray-900">Personal Information</h2>
                        </div>

                        <div className="space-y-5">
                            {/* Phone and Blood Group Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {/* Phone Number */}
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                        PHONE NUMBER
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>+91 98765 43210</span>
                                    </div>
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                        BLOOD GROUP
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                        <Droplet className="w-4 h-4 text-red-600" />
                                        <span>B+ Positive</span>
                                    </div>
                                </div>
                            </div>

                            {/* Current Address */}
                            <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                    CURRENT ADDRESS
                                </div>
                                <div className="flex items-start gap-2 text-gray-900 font-semibold">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <span>#45, Silicon Residency, Outer Ring Road, Bengaluru, Karnataka - 560103</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="hidden xl:block w-80">
                    <div className="sticky top-24 space-y-6">
                        {/* Quick Profile Stats */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-6">
                                QUICK PROFILE STATS
                            </h3>

                            <div className="space-y-6">
                                {/* JNV Batch */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg flex-shrink-0">
                                        <GraduationCap className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                            JNV BATCH
                                        </div>
                                        <div className="text-base font-black text-gray-900">Class of 2012</div>
                                    </div>
                                </div>

                                {/* Blood Group */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg flex-shrink-0">
                                        <Droplet className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                            BLOOD GROUP
                                        </div>
                                        <div className="text-base font-black text-gray-900">B+ Positive</div>
                                    </div>
                                </div>

                                {/* Profile Completion */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                            PROFILE COMPLETION
                                        </div>
                                        <div className="text-sm font-black text-blue-600">85%</div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Member Actions */}
                        <div className="bg-blue-600 rounded-2xl p-6 text-white">
                            <h2 className="text-xl font-black mb-5">Member Actions</h2>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Pencil className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-bold text-sm">Edit Profile</div>
                                            <div className="text-xs text-white/80">Information</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Upload className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-bold text-sm">Update Photo</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
