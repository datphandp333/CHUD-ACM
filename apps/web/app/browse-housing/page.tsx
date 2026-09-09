"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchFilters from "../components/SearchFilters";
import type { HousingItem } from "../lib/mapBuilding";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function resolveImageSrc(building: HousingItem): string {
  const rawImage = (building.image ?? "").trim();
  const id = normalizeText(building.id);
  const name = normalizeText(building.name);

  const imageMap: Record<string, string> = {
    "the-arlie": "/the-arlie1.jpg",
    "the arlie": "/the-arlie1.jpg",
    "campus-edge": "/campus-edge1.jpg",
    "campus edge": "/campus-edge1.jpg",
    "liv-plus": "/liv-plus1.jpg",
    "liv+ arlington": "/liv-plus1.jpg",
    "arbor-oaks": "/Arbor-Oaks1.jpg",
    "arbor oaks": "/Arbor-Oaks1.jpg",
    "arlington-hall": "/Arlington_Hall.png",
    "arlington hall": "/Arlington_Hall.png",
    "kc-hall": "/KC_Hall.png",
    "kc hall": "/KC_Hall.png",
    "maverick-hall": "/MavHallBlock.png",
    "maverick hall": "/MavHallBlock.png",
    "meadow-run": "/Meadow_Run.png",
    "meadow run": "/Meadow_Run.png",
    "the-lofts": "/The-Lofts.jpeg",
    "the lofts": "/The-Lofts.jpeg",
    "heights-on-pecan": "/Pecan1.jpeg",
    "the heights on pecan": "/Pecan1.jpeg",
    "timber-brook": "/Timber Brook.png",
    "timber brook": "/Timber Brook.png",
    "university-village": "/University_Village.png",
    "university village": "/University_Village.png",
    "vandergriff-hall": "/vandergriffsite.jpeg",
    "vandergriff hall": "/vandergriffsite.jpeg",
    "west-hall": "/West-Hall.jpg",
    "west hall": "/West-Hall.jpg",
  };

  if (rawImage !== "") {
    return rawImage.startsWith("/") ? rawImage : `/${rawImage}`;
  }

  if (imageMap[id]) return imageMap[id];
  if (imageMap[name]) return imageMap[name];

  return "/UTA-Logo.png";
}

function normalizeHousingItem(item: Record<string, unknown>): HousingItem {
  const categoryValue =
    item.category === "apartment" || item.category === "residence-hall"
      ? item.category
      : String(item.type ?? "")
          .toLowerCase()
          .includes("apartment")
      ? "apartment"
      : "residence-hall";

  return {
    id: String(item.id ?? item.slug ?? ""),
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

export default function BrowseHousingPage() {
  const [allBuildings, setAllBuildings] = useState<HousingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHousing() {
      try {
        const response = await fetch("/api/browse-housing", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load housing data");
        }

        const data = (await response.json()) as Record<string, unknown>[];
        setAllBuildings(data.map(normalizeHousingItem));
      } catch (error) {
        console.error("BrowseHousingPage error:", error);
        setAllBuildings([]);
      } finally {
        setLoading(false);
      }
    }

    loadHousing();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pt-28">
      <section className="mx-auto max-w-7xl px-6 pb-14 text-center">
        <h1 className="mb-6 text-5xl font-bold text-blue-800">
          Browse Housing
        </h1>

        <SearchFilters onFilteredChange={setAllBuildings} />

        <p className="mt-8 font-medium text-slate-600">
          {loading
            ? "Loading housing options..."
            : `${allBuildings.length} housing option${
                allBuildings.length !== 1 ? "s" : ""
              } found near UTA`}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        {!loading && allBuildings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No housing matches your current filters.
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading housing...
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {allBuildings.map((building) => {
              const imageSrc = resolveImageSrc(building);

              return (
                <article
                  key={building.id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={building.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-blue-900">
                          {building.name}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {building.address}
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                        {building.category === "apartment"
                          ? "Apartment"
                          : "Residence Hall"}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-medium text-slate-700">
                      ★ {building.rating.toFixed(1)} ({building.reviewCount} reviews)
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {building.distanceFromUTA}
                    </p>

                    <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                      {building.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {building.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <Link
                        href={`/housing/${building.id}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}