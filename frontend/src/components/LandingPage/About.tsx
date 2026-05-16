"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  CreditCard,
  Briefcase,
  HandHeart,
  Calendar,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { apiConnector } from "../../utils/APIsConnector";
import { ALUMNI_API, EVENTS_API } from "../../utils/api";

const aboutImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCk9mlifc_Z2mUTedPuqK_1HlkASNMT1AdtbHeOv92RSt-nsH0ExK4qqw6owWjAvUMWccLRlHvj_PtxbzKmkZw_5E3tlEyevZjxmppmna9RYj43qe7U5uOVrYeIWUwDEBfL6Xp2Sa8rM3vC5J5DLeZv2bH8n8BSP1Qe7fKWTOETh0pZz7M6K6zzWkpScOCxiW4ZwLdj0MNJeGnoihEwZBHad_xvK84ElBxVzKNfU6hBvxxWb0QAPTXEHUYDOzPKZgccy7_06u7PQN4V";

const FOUNDED_YEAR = 1987;

/**
 * Format large numbers to human-readable format (e.g., 10000 -> 10k+)
 */
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${Math.floor(num / 1000)}k+`;
  }
  return `${num}+`;
};

export default function App() {
  const [stats, setStats] = useState({
    members: "10k+",
    events: "10+",
    years: new Date().getFullYear() - FOUNDED_YEAR,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch alumni count
        const alumniResponse = await apiConnector(
          "GET",
          ALUMNI_API.GET_ALUMNI_DIRECTORY,
          null,
          undefined,
          { page: 1, limit: 1 }
        );
        const memberCount = alumniResponse?.data?.totalCount || 10000;

        // Fetch events count
        const eventsResponse = await apiConnector("GET", EVENTS_API.GET_EVENTS);
        const eventCount = Array.isArray(eventsResponse?.data)
          ? eventsResponse.data.length
          : 10;

        // Calculate years since founding
        const yearsActive = new Date().getFullYear() - FOUNDED_YEAR;

        setStats({
          members: formatNumber(memberCount),
          events: formatNumber(eventCount),
          years: yearsActive,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Keep default values on error
      } finally {
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Left Section - Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-4 sm:w-6 md:w-8 h-0.5 bg-yellow-500"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  WHAT WE DO
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
                Connects, Supports, and{" "}
                <span className="text-blue-600">Grow</span>
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl">
                We bring together alumni, students, and professionals to foster
                mentorship, opportunities, social impact, and a strong support
                network beyond school life.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Alumni Directory */}
              <div className="bg-white rounded-lg sm:rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg md:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Alumni Directory
                </h3>
                <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4 leading-relaxed">
                  Connect with batchmates and seniors globally through our
                  secure database.
                </p>
                <button className="text-blue-600 font-semibold text-[10px] sm:text-xs md:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More{" "}
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                </button>
              </div>

              {/* Membership Benefits */}
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Membership Benefits
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  Unlock exclusive perks, discounts, and networking
                  opportunities.
                </p>
                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Medical Helpline */}
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Medical Helpline
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  24/7 emergency support and professional health consultations.
                </p>
                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Career Guidance */}
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Career Guidance
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  Mentorship programs, resume reviews, and direct job
                  placements.
                </p>
                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Financial Aid */}
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <HandHeart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Financial Aid
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  Scholarships for students and crisis relief funds for alumni.
                </p>
                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Events */}
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Events
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  Annual reunions, regional meets, and skill-building workshops.
                </p>
                <button className="text-blue-600 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - About Card */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm sticky top-20 sm:top-24">
              {/* Image */}
              <div className="relative h-40 sm:h-48">
                <img
                  src={aboutImage}
                  alt="NESMO Community"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                  <p className="text-white text-xs font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">
                    WHO WE ARE
                  </p>
                  <h2 className="text-white text-xl sm:text-2xl font-bold">
                    About NESMO
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                  NESMO (Navodaya Ex-Student Multipurpose Organization) is a
                  lifelong alumni network built to connect, support, and empower
                  Navodayans beyond JNV.
                </p>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                  Rooted in the values of unity, service, and lifelong
                  brotherhood, NESMO brings together students, alumni,
                  professionals, and changemakers to strengthen connections
                  across generations.
                </p>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                  Through mentorship, career support, networking, social
                  initiatives, and community-driven efforts, we create a
                  platform where Navodayans grow together, support one another,
                  and continue the spirit of JNV beyond school life.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">
                      {stats.members}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                      Members
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">
                      {stats.events}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                      Events
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">
                      {stats.years}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                      Years
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                  Read Full Story
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
