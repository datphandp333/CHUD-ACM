"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HousingItem } from "@/app/lib/mapBuilding";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function resolveImageSrc(apartment: HousingItem): string {
  const rawImage = (apartment.image ?? "").trim();
  const id = normalizeText(apartment.id);
  const name = normalizeText(apartment.name);

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

function renderStars(rating: number) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={index < rounded ? "text-amber-400" : "text-slate-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function FeaturedApartments() {
  const [featuredApartments, setFeaturedApartments] = useState<HousingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHousing() {
      try {
        const response = await fetch("/api/browse-housing", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load housing");

        const data = (await response.json()) as Record<string, unknown>[];
        const normalized = data.map(normalizeHousingItem);

        const selected = normalized.filter((item) =>
          ["campus-edge", "the-arlie", "liv-plus"].includes(item.id)
        );

        setFeaturedApartments(selected);
      } catch (error) {
        console.error("FeaturedApartments error:", error);
        setFeaturedApartments([]);
      } finally {
        setLoading(false);
      }
    }

    loadHousing();
  }, []);

  if (loading) {
    return (
      <section>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            Loading featured apartments...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Featured Apartments
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-900 md:text-4xl">
              Featured Student Apartments
            </h2>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Explore popular student housing communities near UT Arlington.
              Compare ratings, amenities, and location details to find a place
              that matches your lifestyle.
            </p>
          </div>

          <Link
            href="/browse-housing"
            className="inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-100"
          >
            View All Apartments
          </Link>
        </div>

        {featuredApartments.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            No featured apartments available right now.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredApartments.map((apartment) => {
              const imageSrc = resolveImageSrc(apartment);

              return (
                <article
                  key={apartment.id}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="relative h-60 w-full overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={apartment.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-blue-900 transition duration-300 group-hover:text-blue-700">
                          {apartment.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {apartment.address}
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 transition duration-300 group-hover:bg-blue-100">
                        {apartment.priceLevel}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      {renderStars(apartment.rating)}
                      <span className="text-sm font-semibold text-slate-700">
                        {apartment.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-500">
                        ({apartment.reviewCount} reviews)
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {apartment.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1 transition duration-300 group-hover:bg-slate-200">
                        {apartment.distanceFromUTA}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {apartment.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition duration-300 group-hover:bg-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <Link
                        href={`/housing/${apartment.id}`}
                        className="inline-flex items-center text-sm font-semibold text-blue-600 transition duration-300 hover:text-blue-800"
                      >
                        Read Reviews
                        <span className="ml-1 transition duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}