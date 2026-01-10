import { Mail, Globe, Linkedin, CheckCircle2 } from 'lucide-react';
const leaderImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8dEDu4jVT_lzy4pb5ZTrQhJBw5orKnp_d5Xr2Oa1ZjkovShV_q0ua1XShTTMMhvHsJ09xY-QyqTT6XVnlsPtO3eaE5kIh0ZC2N1ZetXwHtt9PtykAEDyTbV_1LyLeMs1Ozo5DgtgPeClb-mQetPXL8CBqUkWeLSCnJdO7719S8DArWIl1aqxVv0HSkRZEjUxr1SY1n7fd4pwYWsGJmyEALu7umkoo5rwD7Thsra8Abutbttn-x4DML7ervMeWrR8TWY3XvwEUrpkD';

export default function App() {
    const teamMembers = [
        {
            name: "Rohan Gupta",
            role: "General Secretary",
            batch: "Batch 2008 • Software Engineer",
            verified: true,
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop"
        },
        {
            name: "Anjali Mehta",
            role: "Treasurer",
            batch: "Batch 2010 • Chartered Accountant",
            verified: false,
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
        },
        {
            name: "Vikram Singh",
            role: "Vice President",
            batch: "Batch 2005 • IAS Officer",
            verified: false,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
        },
        {
            name: "Sneha Patel",
            role: "Vice President",
            batch: "Batch 2007 • Professor",
            verified: false,
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"
        },
        {
            name: "Arjun Reddy",
            role: "Joint Secretary",
            batch: "Batch 2011 • Corporate Lawyer",
            verified: false,
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop"
        },
        {
            name: "Kavita Rao",
            role: "Executive Member",
            batch: "Batch 2003 • Entrepreneur",
            verified: false,
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
        },
        {
            name: "Meera Iyer",
            role: "Board Member",
            batch: "Batch 2006 • Architect",
            verified: false,
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop"
        },
        {
            name: "Suresh Kumar",
            role: "Advisor",
            batch: "Batch 1998 • Civil Engineer",
            verified: false,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="mb-8">
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                            Our Leadership
                        </h1>
                        <p className="text-gray-600 text-base max-w-2xl">
                            Meet the accomplished alumni dedicated to guiding NESMO's mission and vision. Together, we are building a legacy of support and excellence.
                        </p>
                    </div>

                    {/* President Message Card */}
                    {/* President Message Card */}
                    <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex flex-col md:flex-row items-stretch">

                            {/* Leader Image */}
                            <div
                                className="w-full md:w-2/5 min-h-[450px] bg-cover bg-center"
                                style={{ backgroundImage: `url(${leaderImage})` }}
                                aria-label="Dr. Rajesh Sharma"
                            />

                            {/* Message Content */}
                            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center gap-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M6 8C6 6 7 5 8 5C9 5 9 6 9 7C9 8 8 9 6 10V12H10M12 8C12 6 13 5 14 5C15 5 15 6 15 7C15 8 14 9 12 10V12H16"
                                            fill="#3B82F6"
                                        />
                                    </svg>
                                    <span className="text-blue-600 text-sm font-bold uppercase tracking-wider">
                                        Message from the President
                                    </span>
                                </div>

                                <blockquote className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed">
                                    "As we connect alumni from across decades, our mission remains rooted in
                                    the values we learned at JNV. Together, we build a stronger future for
                                    our community and society."
                                </blockquote>

                                <div className="mt-4 border-l-4 border-blue-600 pl-4">
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        Dr. Rajesh Sharma
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        Batch 1999 • Chief Surgeon
                                    </p>
                                </div>

                                <div className="flex gap-4 mt-2">
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Mail className="w-5 h-5" />
                                    </a>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Globe className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Tabs */}
                    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
                        <button className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold whitespace-nowrap">
                            All Members
                        </button>
                        <button className="px-5 py-2 bg-white text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-100 whitespace-nowrap">
                            Executive Committee
                        </button>
                        <button className="px-5 py-2 bg-white text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-100 whitespace-nowrap">
                            Advisory Board
                        </button>
                        <button className="px-5 py-2 bg-white text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-100 whitespace-nowrap">
                            Regional Heads
                        </button>
                        <button className="px-5 py-2 bg-white text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-100 whitespace-nowrap">
                            Founding Members
                        </button>
                    </div>

                    {/* Team Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                {/* Avatar */}
                                <div className="relative w-20 h-20 mx-auto mb-4">
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                    {member.verified && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                                            <CheckCircle2 className="w-4 h-4 text-white" fill="currentColor" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="text-center mb-4">
                                    <h3 className="font-bold text-gray-900 text-base mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-blue-600 text-sm font-semibold mb-1">
                                        {member.role}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        {member.batch}
                                    </p>
                                </div>

                                {/* Social Icons */}
                                <div className="flex items-center justify-center gap-2">
                                    <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                                        <Mail className="w-3.5 h-3.5 text-gray-600" />
                                    </a>
                                    <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                                        <Linkedin className="w-3.5 h-3.5 text-gray-600" />
                                    </a>
                                    <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                                        <Globe className="w-3.5 h-3.5 text-gray-600" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Want to contribute to the mission?
                    </h2>
                    <p className="text-gray-600 text-base mb-8 max-w-2xl mx-auto">
                        We are always looking for passionate alumni to join our committees and regional chapters. Help us build a stronger network.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Join a Committee
                        </button>
                        <button className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors">
                            Contact Leadership
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}
