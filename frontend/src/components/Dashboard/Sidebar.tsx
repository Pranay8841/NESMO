// V1 Release: Commenting out icons not used in first release
// import { Calendar, Ticket, Settings, LogOut, Medal, Menu, X } from 'lucide-react';
import { LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { logoutUser } from '../../services/authService';
import { useEffect } from 'react';

interface SidebarItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

interface SidebarProps {
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

const sidebarItems: SidebarItem[] = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: (
            <div className="grid grid-cols-2 gap-1 w-5 h-5">
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
            </div>
        ),
    },
    {
        path: '/profile',
        label: 'My Profile',
        icon: (
            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                <div className="w-2 h-2 bg-current rounded-full"></div>
            </div>
        ),
    },
    // V1 Release: Commenting out sidebar items not part of first release
    // {
    //     path: '/my-membership',
    //     label: 'My Membership',
    //     icon: <Medal className="w-5 h-5" />,
    // },
    // {
    //     path: '/tickets',
    //     label: 'My Tickets',
    //     icon: <Ticket className="w-5 h-5" />,
    // },
    // {
    //     path: '/my-events',
    //     label: 'My Events',
    //     icon: <Calendar className="w-5 h-5" />,
    // },
    // {
    //     path: '/settings',
    //     label: 'Account Settings',
    //     icon: <Settings className="w-5 h-5" />,
    // },
];

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Close mobile sidebar when route changes
    useEffect(() => {
        if (isMobileOpen && onMobileClose) {
            onMobileClose();
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    const sidebarContent = (
        <>
            <nav className="p-4 space-y-1">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                            isActive(item.path)
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-6 left-4 right-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm cursor-pointer"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] sticky top-16 hidden lg:block">
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <span className="font-semibold text-lg text-gray-800">Menu</span>
                    <button
                        onClick={onMobileClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                {sidebarContent}
            </aside>
        </>
    );
}

// Mobile Menu Toggle Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden w-14 h-14 flex items-center justify-center bg-blue-600 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Open menu"
        >
            <Menu className="w-7 h-7 text-white" />
        </button>
    );
}
