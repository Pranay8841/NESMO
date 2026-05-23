import { type JSX, useEffect } from 'react';
import {
    X, MapPin, MessageCircle, Phone, User, GraduationCap, Briefcase
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

    const isPaidMember = member.role !== 'ALUMNI' || member.isMember;
    const roleConfig: Record<string, { label: string; color: string; border: string }> = {
        ADMIN: { label: 'Admin', color: 'bg-red-500', border: 'border-red-600' },
        EVENT_LEAD: { label: 'Event Lead', color: 'bg-purple-500', border: 'border-purple-600' },
        MEMBER: { label: 'Member', color: 'bg-blue-500', border: 'border-blue-600' },
        ALUMNI: { label: 'Alumni', color: 'bg-slate-500', border: 'border-slate-600' },
    };
    const roleInfo = roleConfig[member.role] || roleConfig.ALUMNI;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
            <div className="w-full max-w-3xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                {/* Modal */}
                <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto border border-slate-200/50">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 px-6 sm:px-8 py-6 sm:py-8 relative">
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl flex items-center justify-center text-white transition-all duration-200 cursor-pointer active:scale-95 z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-6">
                            {/* Profile Picture */}
                            <div className="relative flex-shrink-0">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-md">
                                    {member.photo ? (
                                        <img
                                            src={member.photo}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center text-white text-3xl font-bold ${
                                            isPaidMember
                                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                : 'bg-gradient-to-br from-slate-500 to-slate-650'
                                        }`}>
                                            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                    )}
                                </div>
                                {/* Verification Badge */}
                                {isPaidMember && (
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 10L8 13L15 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">{member.name}</h1>
                                    {isPaidMember && (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 shrink-0">
                                            <circle cx="12" cy="12" r="10" fill="#F59E0B" />
                                            <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                {member.occupation && (
                                    <p className="text-sm sm:text-base text-slate-300 font-medium mb-3">
                                        {member.occupation}{member.organization ? ` at ${member.organization}` : ''}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                                    {member.city && (
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="text-xs font-semibold">{member.city}</span>
                                        </div>
                                    )}
                                    <span className={`px-2.5 py-0.5 ${roleInfo.color} ${roleInfo.border} border text-white rounded-lg text-[10px] font-extrabold uppercase tracking-widest`}>
                                        {roleInfo.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col md:flex-row gap-6 sm:gap-8 p-6 sm:p-8 bg-slate-50/30">
                        {/* Left Column */}
                        <div className="flex-1 space-y-6 sm:space-y-8">
                            {/* About Me */}
                            {member.about && (
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="w-4 h-4 text-blue-600" />
                                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">About Me</h2>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-650 leading-relaxed">
                                        {member.about}
                                    </p>
                                </div>
                            )}

                            {/* Alumni & Education */}
                            {(member.joinBatch || member.passoutBatch) && (
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <GraduationCap className="w-4 h-4 text-blue-600" />
                                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Alumni & Education</h2>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
                                                    <path d="M3 10L12 3L21 10V20H3V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9 20V12H15V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 mb-0.5">Jawahar Navodaya Vidyalaya, Gadchiroli</h3>
                                            <p className="text-xs text-slate-500 font-semibold">{member.joinBatch || '?'} - {member.passoutBatch || '?'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Professional Details */}
                            {(member.occupation || member.organization || member.sector) && (
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Briefcase className="w-4 h-4 text-blue-600" />
                                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Professional Details</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                        {member.occupation && (
                                            <div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                                                    Occupation
                                                </div>
                                                <div className="text-xs sm:text-sm font-bold text-slate-800">
                                                    {member.occupation}
                                                </div>
                                            </div>
                                        )}
                                        {member.organization && (
                                            <div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                                                    Organization
                                                </div>
                                                <div className="text-xs sm:text-sm font-bold text-slate-800">
                                                    {member.organization}
                                                </div>
                                            </div>
                                        )}
                                        {member.sector && (
                                            <div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                                                    Sector / Industry
                                                </div>
                                                <div className="text-xs sm:text-sm font-bold text-slate-800">
                                                    {member.sector}
                                                </div>
                                            </div>
                                        )}
                                        {member.city && (
                                            <div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                                                    Location
                                                </div>
                                                <div className="text-xs sm:text-sm font-bold text-slate-800">
                                                    {member.city}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-full md:w-56 flex-shrink-0 space-y-3 sm:space-y-4">
                            {/* Quick Stats */}
                            <div className="bg-slate-900 rounded-2xl p-5 shadow-md">
                                <div className="text-[9px] text-amber-500 uppercase tracking-widest font-extrabold mb-3">
                                    Quick Stats
                                </div>
                                <div className="space-y-3">
                                    {member.bloodGroup && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-semibold">Blood Group</span>
                                            <span className="text-sm font-black text-white">{member.bloodGroup}</span>
                                        </div>
                                    )}
                                    {(member.joinBatch || member.passoutBatch) && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-semibold">JNV Batch</span>
                                            <span className="text-xs font-black text-white">{member.joinBatch || '?'} - {member.passoutBatch || '?'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* WhatsApp Message Button */}
                            {member.phone && (
                                <a 
                                    href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-green-500/10 hover:shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp Message
                                </a>
                            )}

                            {/* Call Button */}
                            {member.phone && (
                                <a 
                                    href={`tel:${member.phone}`}
                                    className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-50 hover:border-slate-350 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Phone className="w-4 h-4" />
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
