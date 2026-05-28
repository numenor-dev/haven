import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";

export default function Home() {
  return (
    <div className="flex flex-col">
      <main className="marketing-bg min-h-screen">
        <div className="relative z-20">
          <Header />
          <Hero />
        </div>
      </main>
    </div>
  );
}
