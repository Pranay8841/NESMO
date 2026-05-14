export default function ImpactStats() {
    return (
        <>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 lg:gap-8">
                            {/* Our Impact */}
                            <div className="border-b sm:border-b-0 sm:border-r border-blue-400/30 pb-4 sm:pb-0 sm:pr-4 lg:pr-6 lg:pr-8">
                                <h3 className="text-white text-base sm:text-lg lg:text-xl font-bold mb-0.5 sm:mb-1">Our Impact</h3>
                                <p className="text-blue-200 text-xs sm:text-sm">Growing stronger together</p>
                            </div>

                            {/* Alumni Registered */}
                            <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-blue-400/30 pb-4 sm:pb-0 sm:pr-4 lg:pr-6 lg:pr-8">
                                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                    <span className="text-lg sm:text-xl lg:text-2xl">🎓</span>
                                    <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold">10k+</span>
                                </div>
                                <p className="text-blue-200 text-xs sm:text-sm">Alumni Registered</p>
                            </div>

                            {/* Events Organized */}
                            <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-blue-400/30 pb-4 sm:pb-0 sm:pr-4 lg:pr-6 lg:pr-8">
                                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                    <span className="text-lg sm:text-xl lg:text-2xl">🎉</span>
                                    <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold">500+</span>
                                </div>
                                <p className="text-blue-200 text-xs sm:text-sm">Events Organized</p>
                            </div>

                            {/* Aid Provided */}
                            <div className="text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                    <span className="text-lg sm:text-xl lg:text-2xl">👍</span>
                                    <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold">₹20L+</span>
                                </div>
                                <p className="text-blue-200 text-xs sm:text-sm">Aid Provided</p>
                            </div>
                        </div>
                    </div>
            </div>
        </>
    );
}
