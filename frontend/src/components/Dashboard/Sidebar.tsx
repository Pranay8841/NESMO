import { Calendar, Ticket, Settings, LogOut, Medal } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { logoutUser } from '../../services/authService';

interface SidebarItem {
    path: string;
    label: string;
    icon: React.ReactNode;
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
    {
        path: '/my-membership',
        label: 'My Membership',
        icon: <Medal className="w-5 h-5" />,
    },
    {
        path: '/tickets',
        label: 'My Tickets',
        icon: <Ticket className="w-5 h-5" />,
    },
    {
        path: '/my-events',
        label: 'My Events',
        icon: <Calendar className="w-5 h-5" />,
    },
    {
        path: '/settings',
        label: 'Account Settings',
        icon: <Settings className="w-5 h-5" />,
    },
];

export default function Sidebar() {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] sticky top-16 hidden lg:block">
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
        </aside>
    );
}
