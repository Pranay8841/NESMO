import { Quote } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const testimonialImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTFHag87rEOde_g06PnTlfiInVFBGw0f1WWHPHZHxiHGqI_HOfaX9-joVftMLWsZNO9xIwiBBIlDW1ycJtm49p4-cymxAuEmHpGGj9tRjnRnX4b-rF5V7_dvc1Z6KxOyWYjRTxvgS2uzqM83AI0WkkYkZMMkLXZeDrma0cgq9So6EhlwBQ0KzYyg7ivMN9qZXpUsbsGi6KMr2pRRzSke1XS1KZXdl3_Z_6ufNMqedoPfgn07BmMNCZUCBrXAaLPaSMVFurOtDTFLK3'

export default function App() {
    const testimonials = [
        {
            quote: "NESMO provided me with the mentorship I desperately needed during my early career. The network is incredibly supportive and truly feels like an extended family.",
            name: "Priya Sharma",
            batch: "JNV Pune, 2012",
            position: "Senior Analyst, Deloitte",
            avatar: testimonialImage
        },
        {
            quote: "The medical helpline was a lifesaver for my parents during the pandemic. Knowing that the alumni community stood behind us gave me immense strength.",
            name: "Rajesh Kumar",
            batch: "JNV Patna, 2008",
            position: "Civil Servant, IAS",
            avatar: testimonialImage
        },
        {
            quote: "Giving back to the school that made me who I am is a privilege. NESMO's scholarship program ensures that no talented student is left behind due to finances.",
            name: "Anita Desai",
            batch: "JNV Shimla, 2006",
            position: "Founder, EdTech Global",
            avatar: testimonialImage
        }
    ];

    const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
    const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.05 });

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div ref={headerRef}
                     className={`mb-8 sm:mb-12 scroll-fade-in ${headerVisible ? 'is-visible' : ''}`}>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <div className="w-6 sm:w-8 h-0.5 bg-yellow-500"></div>
                        <span className="text-xs sm:text-sm font-semibold text-blue-600 uppercase tracking-wider">TESTIMONIALS</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                        Voices of Our <span className="gradient-text">Alumni</span>
                    </h1>
                </div>

                {/* Testimonial Cards */}
                <div ref={cardsRef}
                     className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 stagger-children ${cardsVisible ? 'is-visible' : ''}`}>
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm card-lift card-gradient-top">
                            {/* Quote Icon */}
                            <div className="mb-3 sm:mb-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                                </div>
                            </div>

                            {/* Quote Text */}
                            <div className="mb-4 sm:mb-6">
                                <p className="text-gray-600 italic text-xs sm:text-sm leading-relaxed">
                                    "{testimonial.quote}"
                                </p>
                            </div>

                            {/* Author Info */}
                            <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-transparent hover:ring-blue-200 transition-all">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{testimonial.name}</h4>
                                    <p className="text-blue-600 text-xs font-medium">{testimonial.batch}</p>
                                    <p className="text-gray-500 text-xs">{testimonial.position}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
