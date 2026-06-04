import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrandsSection from "@/components/BrandsSection";

export default function App() {
  return (
    <div className="bg-hero-bg min-h-screen">
      <Navbar />
      <HeroSection />
      <BrandsSection />
    </div>
  );
}
