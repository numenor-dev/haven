import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-col">
      <main className="marketing-bg min-h-screen">
        <div className="relative z-20">
          <Header />
          <Hero />
          <HowItWorks />
          <Footer />
        </div>
      </main>
    </div>
  );
}
