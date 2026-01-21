import { type JSX, useEffect } from 'react';
import {
    X, MapPin, Send, UserPlus, User, GraduationCap, Briefcase
} from 'lucide-react';
import type { AlumniMember } from '../../redux/slices/alumniSlice';

interface AlumniProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: AlumniMember | null;
}

export default function AlumniProfileModal({ isOpen, onClose, member }: AlumniProfileModalProps): JSX.Element | null {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !member) return null;

    const isMember = member.nesmoStatus === 'NESMO Member';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
                {/* Modal */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-6 relative">
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-6">
                            {/* Profile Picture */}
                            <div className="relative flex-shrink-0">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-orange-100">
                                    {member.photo ? (
                                        <img
                                            src={member.photo}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center text-white text-4xl font-bold ${
                                            isMember
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                                : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                        }`}>
                                            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                    )}
                                </div>
                                {/* Verification Badge */}
                                {isMember && (
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-blue-900 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 10L8 13L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="text-3xl font-black text-white">{member.name}</h1>
                                    {isMember && (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10" fill="#F59E0B" />
                                            <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                {member.occupation && (
                                    <p className="text-lg text-blue-100 font-medium mb-3">
                                        {member.occupation}{member.organization ? ` at ${member.organization}` : ''}
                                    </p>
                                )}
                                <div className="flex items-center gap-4">
                                    {member.city && (
                                        <div className="flex items-center gap-1.5 text-blue-200">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm font-medium">{member.city}</span>
                                        </div>
                                    )}
                                    {isMember && (
                                        <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-400 rounded text-xs font-bold uppercase tracking-wider">
                                            NESMO VERIFIED
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col md:flex-row gap-6 p-8">
                        {/* Left Column */}
                        <div className="flex-1 space-y-6">
                            {/* About Me */}
                            {member.about && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-lg font-black text-gray-900">About Me</h2>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {member.about}
                                    </p>
                                </div>
                            )}

                            {/* Alumni & Education */}
                            {member.batch && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <GraduationCap className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-lg font-black text-gray-900">Alumni & Education</h2>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M3 10L12 3L21 10V20H3V10Z" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9 20V12H15V20" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 mb-1">Jawahar Navodaya Vidyalaya</h3>
                                            <p className="text-sm text-gray-600 mb-1">Batch {member.batch}</p>
                                            {isMember && (
                                                <p className="text-sm text-green-600 font-semibold">NESMO Member</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Professional Details */}
                            {(member.occupation || member.organization || member.sector) && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-lg font-black text-gray-900">Professional Details</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        {member.occupation && (
                                            <div>
                                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                                    OCCUPATION
                                                </div>
                                                <div className="text-base font-bold text-gray-900">
                                                    {member.occupation}
                                                </div>
                                            </div>
                                        )}
                                        {member.organization && (
                                            <div>
                                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                                    ORGANIZATION
                                                </div>
                                                <div className="text-base font-bold text-gray-900">
                                                    {member.organization}
                                                </div>
                                            </div>
                                        )}
                                        {member.sector && (
                                            <div>
                                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                                    SECTOR / INDUSTRY
                                                </div>
                                                <div className="text-base font-bold text-gray-900">
                                                    {member.sector}
                                                </div>
                                            </div>
                                        )}
                                        {member.city && (
                                            <div>
                                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                                    LOCATION
                                                </div>
                                                <div className="text-base font-bold text-gray-900">
                                                    {member.city}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-full md:w-64 space-y-4">
                            {/* Quick Stats */}
                            <div className="bg-gray-900 rounded-xl p-5">
                                <div className="text-xs text-yellow-500 uppercase tracking-widest font-bold mb-4">
                                    QUICK STATS
                                </div>
                                <div className="space-y-4">
                                    {member.bloodGroup && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-300 font-medium">Blood Group</span>
                                            <span className="text-xl font-black text-white">{member.bloodGroup}</span>
                                        </div>
                                    )}
                                    {member.batch && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-300 font-medium">JNV Batch</span>
                                            <span className="text-xl font-black text-white">{member.batch}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-300 font-medium">Status</span>
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                                            isMember 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-gray-600 text-gray-200'
                                        }`}>
                                            {isMember ? 'MEMBER' : 'ALUMNI'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Send Message Button */}
                            {member.email && (
                                <a 
                                    href={`mailto:${member.email}`}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Send className="w-4 h-4" />
                                    Send Email
                                </a>
                            )}

                            {/* Call Button */}
                            {member.phone && (
                                <a 
                                    href={`tel:${member.phone}`}
                                    className="w-full py-3 bg-white border-2 border-gray-200 text-gray-900 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Call Now
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
