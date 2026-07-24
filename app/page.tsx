import Header from "@/components/landing/header/Header";
import Hero from "@/components/landing/Hero";
import DemoContainer from "@/components/landing/DemoContainer";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-col">
      <main className="marketing-bg min-h-screen">
        <div className="relative z-20">
          <Header />
          <Hero />
          <DemoContainer />
          <Footer />
        </div>
      </main>
    </div>
  );
}
