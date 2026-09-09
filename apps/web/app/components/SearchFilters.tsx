"use client";

import { useEffect, useMemo, useState } from "react";
import type { HousingItem } from "@/app/lib/mapBuilding";

type SearchFiltersProps = {
  showHeader?: boolean;
  onFilteredChange?: (items: HousingItem[]) => void;
};

function normalizeHousingItem(item: Record<string, unknown>): HousingItem {
  const categoryValue =
    item.category === "apartment" || item.category === "residence-hall"
      ? item.category
      : String(item.type ?? "").toLowerCase().includes("apartment")
      ? "apartment"
      : "residence-hall";

  return {
    id: String(item.slug ?? item.id ?? ""),
    name: String(item.name ?? "Unknown Housing"),
    category: categoryValue,
    source: String(item.source ?? "Off Campus"),
    address: String(item.address ?? "UTA area"),
    shortLocation: String(
      item.shortLocation ?? item.short_location ?? item.location ?? "Near UTA"
    ),
    description: String(item.description ?? "No description available."),
    image: String(item.image ?? ""),
    priceLevel: String(item.priceLevel ?? item.price_level ?? "$$"),
    officialFeatures: Array.isArray(item.officialFeatures)
      ? (item.officialFeatures as string[])
      : Array.isArray(item.official_features)
      ? (item.official_features as string[])
      : [],
    tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
    officialUrl: String(item.officialUrl ?? item.official_url ?? ""),
    rating: Number(item.rating ?? 0),
    reviewCount: Number(item.reviewCount ?? item.review_count ?? 0),
    distanceFromUTA: String(
      item.distanceFromUTA ?? item.distance_from_uta ?? "Not listed"
    ),
  };
}

export default function SearchFilters({
  showHeader = true,
  onFilteredChange,
}: SearchFiltersProps) {
  const [allHousing, setAllHousing] = useState<HousingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  useEffect(() => {
    async function loadHousing() {
      try {
        const response = await fetch("/api/browse-housing", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load housing");

        const data = (await response.json()) as Record<string, unknown>[];
        setAllHousing(data.map(normalizeHousingItem));
      } catch (error) {
        console.error("SearchFilters error:", error);
        setAllHousing([]);
      } finally {
        setLoading(false);
      }
    }

    loadHousing();
  }, []);

  const filteredHousing = useMemo(() => {
    return allHousing.filter((item) => {
      const query = searchTerm.trim().toLowerCase();

      const matchesSearchTerm =
        query === "" ||
        item.name.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query) ||
        item.shortLocation.toLowerCase().includes(query) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(query));

      const matchesType =
        selectedType === "" || item.category === selectedType;

      const matchesPrice =
        selectedPrice === "" || item.priceLevel === selectedPrice;

      return matchesSearchTerm && matchesType && matchesPrice;
    });
  }, [allHousing, searchTerm, selectedType, selectedPrice]);

  useEffect(() => {
    onFilteredChange?.(filteredHousing);
  }, [filteredHousing, onFilteredChange]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedPrice("");
  };

  return (
    <section className="w-full rounded-3xl bg-white px-6 py-10 shadow-sm md:px-8">
      {showHeader && (
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Search Housing
          </p>
          <h2 className="mt-2 text-3xl font-bold text-blue-900 md:text-4xl">
            Find Housing That Fits Your Needs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Search UTA and near-UTA housing by name, type, and price.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <input
          type="text"
          placeholder="Search housing..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="xl:col-span-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">All Types</option>
          <option value="apartment">Apartments</option>
          <option value="residence-hall">Residence Halls</option>
        </select>

        <select
          value={selectedPrice}
          onChange={(e) => setSelectedPrice(e.target.value)}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">All Prices</option>
          <option value="$">$ Budget</option>
          <option value="$$">$$ Moderate</option>
          <option value="$$$">$$$ Premium</option>
        </select>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {loading
            ? "Loading housing options..."
            : `${filteredHousing.length} housing option${
                filteredHousing.length !== 1 ? "s" : ""
              } found`}
        </p>

        <button
          onClick={clearFilters}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-blue-800 transition hover:bg-slate-100"
        >
          Clear Filters
        </button>
      </div>
    </section>
  );
}