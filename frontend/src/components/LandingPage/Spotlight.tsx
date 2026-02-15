import { ArrowRight } from 'lucide-react';
const spotlightImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnGHYESDMJmE7VDrfuXLSTQVy6FCXQj8wAuCCzXnT9v1KK4A5ex6JEINLn5fad7ZDXDZTgP-BjlIhrLeTK9pF42MaSZdOExn9eXr4TLkL6-jytWLiup_KIVBpCDyPtzKkjmiJFObBAxMjRKqgxefrPl117-GiA18UJqE9lRjtP6cR1DbHZgEzQ-J0VjxjXRv-JB8nrx14n8_XUrG_Y6rtZPhsOdRDlVGWoOucGbYmgAZpn0UZ-4z7p4GEEUMe5x7Bok7YWZjOtCLFe';

export default function App() {
    const alumni = [
        {
            name: "Vikram Singh",
            position: "Pvt. TechStream",
            location: "JNV JAIPUR, 2010",
            description: "Vikram has pioneered AI solutions in renewable energy, securing 3 patents and leading a team of 50+ engineers.",
            image: spotlightImage
        },
        {
            name: "Dr. Meera Reddy",
            position: "Cardiothoracic",
            location: "JNV HYDERABAD, 2006",
            description: "A celebrated surgeon known for her volunteer work in rural India, organizing over 50 free health camps.",
            image: spotlightImage
        },
        {
            name: "Arjun Mehta",
            position: "Entrepreneur",
            location: "JNV BHOPAL, 2011",
            description: "Founder of 'GreenEarth', a startup focusing on sustainable packaging solutions adopted by major FMCG...",
            image: spotlightImage
        },
        {
            name: "Sneha Gupta",
            position: "Author & Poet",
            location: "JNV LUCKNOW, 2009",
            description: "Award-winning author of 'The Village Road', her literary works have been translated into 10 languages.",
            image: spotlightImage
        }
    ];

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0 mb-8 sm:mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                            <div className="w-6 sm:w-8 h-0.5 bg-yellow-500"></div>
                            <span className="text-xs sm:text-sm font-semibold text-blue-600 uppercase tracking-wider">SPOTLIGHTS</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                            Featured <span className="text-blue-600">Alumni</span>
                        </h1>
                    </div>
                    <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-2 hover:gap-3 transition-all whitespace-nowrap">
                        View All Spotlights <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                </div>

                {/* Alumni Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {alumni.map((person, index) => (
                        <div key={index} className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Profile Image with Gradient Overlay */}
                            <div className="relative h-40 sm:h-48 md:h-56 bg-gradient-to-br from-blue-200 to-blue-300">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
                                <img
                                    src={person.image}
                                    alt={person.name}
                                    className="w-full h-full object-cover mix-blend-multiply opacity-60"
                                />
                                {/* Name and Position Overlay */}
                                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                                    <h3 className="text-white font-bold text-base sm:text-lg mb-0.5">{person.name}</h3>
                                    <p className="text-white/90 text-xs sm:text-sm">{person.position}</p>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 sm:p-5">
                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2 sm:mb-3">
                                    {person.location}
                                </p>
                                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
                                    {person.description}
                                </p>
                                <button className="w-full border border-blue-600 text-blue-600 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-colors">
                                    View Full Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
