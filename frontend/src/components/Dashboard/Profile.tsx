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
        ALUMNI: { label: 'Alumni', bgColor: 'bg-slate-500' },
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-12">
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
                    <div className="bg-white rounded-3xl p-6 sm:p-8 mb-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
                        {/* Abstract Background Accents */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/40 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                            {/* Avatar */}
                            <div className="relative shrink-0 group">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-white ring-4 ring-slate-50">
                                    <img
                                        src={profileImage}
                                        alt={fullName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <button 
                                    onClick={handlePhotoClick}
                                    disabled={loading}
                                    className="absolute -bottom-2 -right-2 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-all active:scale-90"
                                    title="Upload Photo"
                                >
                                    <Camera className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 w-full text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{fullName}</h1>
                                            <span className={`px-2.5 py-0.5 ${roleInfo.bgColor} text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider`}>
                                                {roleInfo.label}
                                            </span>
                                        </div>
                                        {(profile?.occupation || isEditing) && (
                                            <h2 className="text-sm sm:text-base md:text-lg font-bold text-blue-650 mb-2">
                                                {profile?.occupation 
                                                    ? `${profile.occupation}${profile.organization ? ` at ${profile.organization}` : ''}`
                                                    : 'Add your occupation'}
                                            </h2>
                                        )}
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-xs sm:text-sm text-slate-500 font-medium">
                                            {(profile?.joinBatch || profile?.passoutBatch) && (
                                                <div className="flex items-center gap-1.5">
                                                    <GraduationCap className="w-4 h-4 text-slate-400" />
                                                    <span>{profile.joinBatch || '?'} - {profile.passoutBatch || '?'}</span>
                                                </div>
                                            )}
                                            {profile?.currentAddress && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    <span className="truncate max-w-[150px] sm:max-w-none">{profile.currentAddress.split(',')[0]}</span>
                                                </div>
                                            )}
                                            {profile?.sector && (
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    <span>{profile.sector}</span>
                                                </div>
                                            )}
                                        </div>
                                        {email && (
                                            <p className="text-xs text-slate-400 mt-2 font-medium">{email}</p>
                                        )}
                                    </div>
                                    <button 
                                        onClick={isEditing ? handleSaveProfile : handleEditToggle}
                                        disabled={loading}
                                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl font-bold text-xs sm:text-sm hover:shadow-md hover:shadow-blue-500/10 flex items-center justify-center gap-2 mt-2 sm:mt-0 disabled:opacity-50 cursor-pointer transition-all active:scale-[0.97]"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isEditing ? (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Save Changes</span>
                                            </>
                                        ) : (
                                            <>
                                                <Pencil className="w-4 h-4" />
                                                <span>Edit Profile</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Completeness */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-2.5">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Profile Completeness</div>
                                    <div className="text-xs text-slate-400">Complete your profile to be visible in the directory</div>
                                </div>
                                <div className="text-2xl font-black text-blue-650">{displayCompleteness}%</div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-50">
                                <div 
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500 shadow-inner" 
                                    style={{ width: `${displayCompleteness}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* About Me */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 mb-6 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <div className="flex items-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2.5"/>
                                    <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                                </svg>
                                <h2 className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-wider">About Me</h2>
                            </div>
                            {isEditing && (
                                <button 
                                    onClick={handleEditToggle}
                                    className="p-1.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 hover:text-slate-650" />
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
                                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:outline-none resize-none text-sm text-slate-700 transition-all"
                            />
                        ) : (
                            <p className="text-slate-650 leading-relaxed text-xs sm:text-sm">
                                {profile?.about || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
                            </p>
                        )}
                        {isEditing && (
                            <div className="text-[10px] sm:text-xs text-slate-400 mt-2 text-right font-medium">
                                {formData.about?.length || 0}/500 characters
                            </div>
                        )}
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-500">
                                <circle cx="10" cy="7" r="3" fill="currentColor" />
                                <path d="M4 17C4 14 6.5 12 10 12C13.5 12 16 14 16 17" fill="currentColor" />
                            </svg>
                            <h2 className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-wider">Personal Information</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Row 1: Phone and Blood Group */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Phone Number */}
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">
                                        Phone Number
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:outline-none text-sm text-slate-700 transition-all"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm">
                                            <Phone className="w-4 h-4 text-slate-450" />
                                            <span>{profile?.phone || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">
                                        Blood Group
                                    </div>
                                    {isEditing ? (
                                        <select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:outline-none text-sm text-slate-700 transition-all bg-white"
                                        >
                                            <option value="">Select Blood Group</option>
                                            {BLOOD_GROUPS.map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm">
                                            <Droplet className="w-4 h-4 text-red-500" />
                                            <span>{profile?.bloodGroup || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Join Batch and Passout Batch */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Join Batch */}
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">
                                        Join Batch
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="joinBatch"
                                            value={formData.joinBatch}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 2005"
                                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:outline-none text-sm text-slate-700 transition-all"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm">
                                            <GraduationCap className="w-4 h-4 text-slate-450" />
                                            <span>{profile?.joinBatch || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Passout Batch */}
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">
                                        Passout Batch
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="passoutBatch"
                                            value={formData.passoutBatch}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 2012"
                                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:outline-none text-sm text-slate-700 transition-all"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm">
                                            <GraduationCap className="w-4 h-4 text-slate-450" />
                                            <span>{profile?.passoutBatch || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 3: Occupation and Organization */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Occupation */}
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">
                                        Occupation
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="occupation"
                                            value={formData.occupation}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Software Engineer"
                                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:outline-none text-sm text-slate-700 transition-all"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm">
                                            <Building2 className="w-4 h-4 text-slate-450" />
                                            <span>{profile?.occupation || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Organization */}
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">
                                        Organization / Company
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="organization"
                                            value={formData.organization}
                                            onChange={handleInputChange}
                                            placeholder="e.g., BlackRock, AIIMS"
                                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:outline-none text-sm text-slate-700 transition-all"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm">
                                            <Building2 className="w-4 h-4 text-slate-455" />
                                            <span>{profile?.organization || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 4: Sector */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Sector */}
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">
                                        Sector / Industry
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="sector"
                                            value={formData.sector}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Technology, Healthcare"
                                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:outline-none text-sm text-slate-700 transition-all"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm">
                                            <Building2 className="w-4 h-4 text-slate-450" />
                                            <span>{profile?.sector || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 5: Current Address */}
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-2">
                                    Current Address
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="currentAddress"
                                        value={formData.currentAddress}
                                        onChange={handleInputChange}
                                        placeholder="City, State, Country"
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:outline-none text-sm text-slate-700 transition-all"
                                    />
                                ) : (
                                    <div className="flex items-start gap-2 text-slate-700 font-bold text-xs sm:text-sm">
                                        <MapPin className="w-4 h-4 text-slate-450 mt-0.5 shrink-0" />
                                        <span className="break-words">{profile?.currentAddress || 'Not provided'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save/Cancel buttons for mobile when editing */}
                        {isEditing && (
                            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100 sm:hidden">
                                <button
                                    onClick={handleEditToggle}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-650 rounded-xl font-bold text-sm hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] text-slate-450 uppercase tracking-widest font-extrabold mb-6">
                                Quick Stats
                            </h3>

                            <div className="space-y-6">
                                {/* JNV Batch */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-red-50 border border-red-100/50 rounded-xl shrink-0">
                                        <GraduationCap className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                                            JNV BATCH
                                        </div>
                                        <div className="text-sm font-bold text-slate-800">
                                            {(profile?.joinBatch || profile?.passoutBatch) ? `${profile?.joinBatch || '?'} - ${profile?.passoutBatch || '?'}` : 'Not set'}
                                        </div>
                                    </div>
                                </div>

                                {/* Blood Group */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-50 border border-yellow-100/50 rounded-xl shrink-0">
                                        <Droplet className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                                            BLOOD GROUP
                                        </div>
                                        <div className="text-sm font-bold text-slate-800">
                                            {profile?.bloodGroup || 'Not set'}
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Completion */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                                            COMPLETION
                                        </div>
                                        <div className="text-xs font-black text-blue-650">{displayCompleteness}%</div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                            style={{ width: `${displayCompleteness}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-650 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10">
                            <h2 className="text-lg font-extrabold mb-5 uppercase tracking-wider text-blue-100">Quick Actions</h2>
                            <div className="space-y-3">
                                <button 
                                    onClick={handleEditToggle}
                                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl transition-all group cursor-pointer active:scale-98"
                                >
                                    <div className="flex items-center gap-3">
                                        <Pencil className="w-5 h-5 text-blue-200" />
                                        <div className="text-left">
                                            <div className="font-bold text-sm">
                                                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                                            </div>
                                            <div className="text-xs text-blue-100/80">Update your details</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                                <button 
                                    onClick={handlePhotoClick}
                                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl transition-all group cursor-pointer active:scale-98"
                                >
                                    <div className="flex items-center gap-3">
                                        <Camera className="w-5 h-5 text-blue-200" />
                                        <div className="text-left">
                                            <div className="font-bold text-sm">Update Photo</div>
                                            <div className="text-xs text-blue-100/80">Change your picture</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
