import { useEffect, useState, useRef } from 'react';
import {
    Camera, MapPin, Building2, GraduationCap,
    Phone, Droplet, ChevronRight, Pencil, X, Save, Loader2
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchProfile, updateProfile, uploadProfilePhoto, fetchProfileCompleteness } from '../../services/profileService';
import type { ProfileUpdateData } from '../../services/profileService';
import { setIsEditing } from '../../redux/slices/profileSlice';

// Blood group options
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Profile() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { profile, loading, isEditing, completeness } = useAppSelector((state) => state.profile);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Form state for editing
    const [formData, setFormData] = useState<ProfileUpdateData>({
        about: '',
        phone: '',
        joinBatch: '',
        passoutBatch: '',
        occupation: '',
        organization: '',
        sector: '',
        currentAddress: '',
        bloodGroup: '',
    });

    // Fetch profile on mount
    useEffect(() => {
        dispatch(fetchProfile());
        dispatch(fetchProfileCompleteness());
    }, [dispatch]);

    // Update form data when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                about: profile.about || '',
                phone: profile.phone || '',
                joinBatch: profile.joinBatch || '',
                passoutBatch: profile.passoutBatch || '',
                occupation: profile.occupation || '',
                organization: profile.organization || '',
                sector: profile.sector || '',
                currentAddress: profile.currentAddress || '',
                bloodGroup: profile.bloodGroup || '',
            });
        }
    }, [profile]);

    // Derive user info
    const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User';
    const email = user?.email || '';
    // Display role based on user.role - show proper role hierarchy with styling
    const roleConfig: Record<string, { label: string; bgColor: string }> = {
        ADMIN: { label: 'Admin', bgColor: 'bg-red-500' },
        EVENT_LEAD: { label: 'Event Lead', bgColor: 'bg-purple-500' },
        MEMBER: { label: 'Member', bgColor: 'bg-blue-500' },
        ALUMNI: { label: 'Alumni', bgColor: 'bg-gray-500' },
    };
    const roleInfo = roleConfig[user?.role || 'ALUMNI'] || roleConfig.ALUMNI;
    
    // Generate avatar from user's initials or use uploaded photo
    const profileImage = profile?.profilePhoto || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff&size=128`;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Reset form data if cancelling
            if (profile) {
                setFormData({
                    about: profile.about || '',
                    phone: profile.phone || '',
                    joinBatch: profile.joinBatch || '',
                    passoutBatch: profile.passoutBatch || '',
                    occupation: profile.occupation || '',
                    organization: profile.organization || '',
                    sector: profile.sector || '',
                    currentAddress: profile.currentAddress || '',
                    bloodGroup: profile.bloodGroup || '',
                });
            }
        }
        dispatch(setIsEditing(!isEditing));
    };

    const handleSaveProfile = async () => {
        await dispatch(updateProfile(formData));
        dispatch(fetchProfileCompleteness());
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await dispatch(uploadProfilePhoto(file));
            // Refetch profile to get the new photo URL
            await dispatch(fetchProfile());
            dispatch(fetchProfileCompleteness());
        }
    };

    // Calculate profile completeness based on filled fields
    const calculateCompleteness = () => {
        if (!profile) return 0;
        const fields = ['about', 'phone', 'joinBatch', 'passoutBatch', 'occupation', 'sector', 'currentAddress', 'bloodGroup', 'profilePhoto'];
        const filledFields = fields.filter(field => profile[field as keyof typeof profile]);
        return Math.round((filledFields.length / fields.length) * 100);
    };

    const displayCompleteness = completeness || calculateCompleteness();

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-8">
            {/* Hidden file input for photo upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
            />

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Main Content */}
                <div className="w-full xl:flex-1">
                    {/* Profile Header */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 mb-6 border border-gray-200">
                        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                            {/* Avatar */}
                            <div className="relative shrink-0 mx-auto sm:mx-0">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden">
                                    <img
                                        src={profileImage}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button 
                                    onClick={handlePhotoClick}
                                    disabled={loading}
                                    className="absolute bottom-0 right-0 w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                >
                                    <Camera className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                                    <div className="text-center sm:text-left">
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
                                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 break-words">{fullName}</h1>
                                            <span className={`px-3 py-1 ${roleInfo.bgColor} text-white text-xs font-bold rounded-full uppercase tracking-wider`}>
                                                {roleInfo.label}
                                            </span>
                                        </div>
                                        {(profile?.occupation || isEditing) && (
                                            <h2 className="text-base sm:text-xl font-bold text-blue-600 mb-2 sm:mb-3">
                                                {profile?.occupation 
                                                    ? `${profile.occupation}${profile.organization ? ` at ${profile.organization}` : ''}`
                                                    : 'Add your occupation'}
                                            </h2>
                                        )}
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm text-gray-600">
                                            {(profile?.joinBatch || profile?.passoutBatch) && (
                                                <div className="flex items-center gap-1.5">
                                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                                    <span>{profile.joinBatch || '?'} - {profile.passoutBatch || '?'}</span>
                                                </div>
                                            )}
                                            {profile?.currentAddress && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate max-w-[150px] sm:max-w-none">{profile.currentAddress.split(',')[0]}</span>
                                                </div>
                                            )}
                                            {profile?.sector && (
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="w-5 h-5 text-gray-400" />
                                                    <span>{profile.sector}</span>
                                                </div>
                                            )}
                                        </div>
                                        {email && (
                                            <p className="text-sm text-gray-500 mt-2">{email}</p>
                                        )}
                                    </div>
                                    <button 
                                        onClick={isEditing ? handleSaveProfile : handleEditToggle}
                                        disabled={loading}
                                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 mt-3 sm:mt-0 disabled:opacity-50 cursor-pointer"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isEditing ? (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        ) : (
                                            <>
                                                <Pencil className="w-4 h-4" />
                                                Edit Profile
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Completeness */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Profile Completeness</div>
                                    <div className="text-xs text-gray-500">Complete your profile to be visible in the directory</div>
                                </div>
                                <div className="text-2xl font-black text-blue-600">{displayCompleteness}%</div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${displayCompleteness}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* About Me */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="8" stroke="#3B82F6" strokeWidth="2"/>
                                    <path d="M10 6V10M10 14H10.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <h2 className="text-lg font-black text-gray-900">About Me</h2>
                            </div>
                            {isEditing && (
                                <button 
                                    onClick={handleEditToggle}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                        </div>
                        {isEditing ? (
                            <textarea
                                name="about"
                                value={formData.about}
                                onChange={handleInputChange}
                                placeholder="Tell us about yourself, your journey, and what you're passionate about..."
                                maxLength={500}
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                            />
                        ) : (
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {profile?.about || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
                            </p>
                        )}
                        {isEditing && (
                            <div className="text-xs text-gray-400 mt-2 text-right">
                                {formData.about?.length || 0}/500 characters
                            </div>
                        )}
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-5">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="7" r="3" fill="#F59E0B" />
                                <path d="M4 17C4 14 6.5 12 10 12C13.5 12 16 14 16 17" fill="#F59E0B" />
                            </svg>
                            <h2 className="text-lg font-black text-gray-900">Personal Information</h2>
                        </div>

                        <div className="space-y-5">
                            {/* Row 1: Phone and Blood Group */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                {/* Phone Number */}
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                        PHONE NUMBER
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span>{profile?.phone || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                        BLOOD GROUP
                                    </div>
                                    {isEditing ? (
                                        <select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                        >
                                            <option value="">Select Blood Group</option>
                                            {BLOOD_GROUPS.map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                            <Droplet className="w-4 h-4 text-red-600" />
                                            <span>{profile?.bloodGroup || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Join Batch and Passout Batch */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                {/* Join Batch */}
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                        JOIN BATCH
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="joinBatch"
                                            value={formData.joinBatch}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 2005"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            <span>{profile?.joinBatch || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Passout Batch */}
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                        PASSOUT BATCH
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="passoutBatch"
                                            value={formData.passoutBatch}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 2012"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            <span>{profile?.passoutBatch || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 3: Occupation and Organization */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                {/* Occupation */}
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                        OCCUPATION
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="occupation"
                                            value={formData.occupation}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Software Engineer"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span>{profile?.occupation || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Organization */}
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                        ORGANIZATION / COMPANY
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="organization"
                                            value={formData.organization}
                                            onChange={handleInputChange}
                                            placeholder="e.g., BlackRock, AIIMS, KV"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span>{profile?.organization || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 4: Sector */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                {/* Sector */}
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                        SECTOR / INDUSTRY
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="sector"
                                            value={formData.sector}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Technology, Healthcare"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span>{profile?.sector || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 5: Current Address */}
                            <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                    CURRENT ADDRESS
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="currentAddress"
                                        value={formData.currentAddress}
                                        onChange={handleInputChange}
                                        placeholder="City, State, Country"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                ) : (
                                    <div className="flex items-start gap-2 text-gray-900 font-semibold">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <span className="break-words">{profile?.currentAddress || 'Not provided'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save/Cancel buttons for mobile when editing */}
                        {isEditing && (
                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 sm:hidden">
                                <button
                                    onClick={handleEditToggle}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Desktop Only */}
                <div className="hidden xl:block w-80 shrink-0">
                    <div className="sticky top-24 space-y-6">
                        {/* Quick Profile Stats */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-6">
                                QUICK PROFILE STATS
                            </h3>

                            <div className="space-y-6">
                                {/* JNV Batch */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg shrink-0">
                                        <GraduationCap className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                            JNV BATCH
                                        </div>
                                        <div className="text-base font-black text-gray-900">
                                            {(profile?.joinBatch || profile?.passoutBatch) ? `${profile?.joinBatch || '?'} - ${profile?.passoutBatch || '?'}` : 'Not set'}
                                        </div>
                                    </div>
                                </div>

                                {/* Blood Group */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg shrink-0">
                                        <Droplet className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                            BLOOD GROUP
                                        </div>
                                        <div className="text-base font-black text-gray-900">
                                            {profile?.bloodGroup || 'Not set'}
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Completion */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                            PROFILE COMPLETION
                                        </div>
                                        <div className="text-sm font-black text-blue-600">{displayCompleteness}%</div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                            style={{ width: `${displayCompleteness}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-blue-600 rounded-2xl p-6 text-white">
                            <h2 className="text-xl font-black mb-5">Quick Actions</h2>
                            <div className="space-y-3">
                                <button 
                                    onClick={handleEditToggle}
                                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <Pencil className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-bold text-sm">
                                                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                                            </div>
                                            <div className="text-xs text-white/80">Update your info</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button 
                                    onClick={handlePhotoClick}
                                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <Camera className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-bold text-sm">Update Photo</div>
                                            <div className="text-xs text-white/80">Change your picture</div>
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
