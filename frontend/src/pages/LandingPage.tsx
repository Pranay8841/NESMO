import Navbar from "../components/LandingPage/Navbar";
import MainContent from "../components/LandingPage/MainContent";
import Footer from "../components/LandingPage/Footer";

export default function LandingPage() {
    return (
        <div className="bg-white">
            <Navbar />
            <MainContent />
            <footer className="bg-gray-100 py-6 sm:py-8 lg:py-12">
                <Footer />
            </footer>
        </div>
    );
}
