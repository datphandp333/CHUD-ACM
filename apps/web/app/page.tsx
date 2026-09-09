import Hero from "./components/Hero";
import SearchFilters from "./components/SearchFilters";
import FeaturedApartments from "./components/FeaturedApartments";
import CompareApartments from "./components/CompareApartments";

export default function HomePage() {
  return (
    <main className="bg-slate-50">
      <Hero />

      <div className="mx-auto max-w-7xl px-6 py-12 opacity-0 animate-fade-up">
        <SearchFilters />
      </div>

      <div className="animate-fade-up-delay-1">
        <FeaturedApartments />
      </div>

      <div className="animate-fade-up-delay-2">
        <CompareApartments />
      </div> 

    </main>
  );
}