import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";
import Slider from "@/components/layout/Slider";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-100">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-300 -translate-x-1/2 sm:block">
        <div className="absolute inset-y-0 left-0 w-px bg-black/10" />
        <div className="absolute inset-y-0 right-0 w-px bg-black/10" />
      </div>
      <div className="relative mx-auto w-full max-w-300 px-4 sm:px-6 lg:px-8">
        <Header />
        <main className="pt-6">
          <Hero />
          <Slider />
        </main>
      </div>
    </div>
  );
}