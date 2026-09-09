"use client";

import { useEffect, useRef, useState } from "react";
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

function getPriceScore(priceLevel: string) {
  if (priceLevel === "$") return 1;
  if (priceLevel === "$$") return 2;
  return 3;
}

function getDistanceNumber(distance: string) {
  const match = distance.match(/[\d.]+/);
  return match ? Number.parseFloat(match[0]) : 0;
}

export default function CompareApartments() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [apartments, setApartments] = useState<HousingItem[]>([]);
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

        setApartments(selected);
      } catch (error) {
        console.error("CompareApartments error:", error);
        setApartments([]);
      } finally {
        setLoading(false);
      }
    }

    loadHousing();
  }, []);

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentRef);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(currentRef);

    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          Loading apartment comparison...
        </div>
      </section>
    );
  }

  if (apartments.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          No apartment comparison data available right now.
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          Loading apartment comparison...
        </div>
      </section>
    );
  }

  if (apartments.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          No apartment comparison data available right now.
        </div>
      </section>
    );
  }

  const maxRating = 5;
  const maxReviews = Math.max(...apartments.map((apt) => apt.reviewCount), 1);
  const maxDistance = Math.max(
    ...apartments.map((apt) => getDistanceNumber(apt.distanceFromUTA)),
    1
  );

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Compare Apartments
        </p>
        <h2 className="mt-3 text-4xl font-bold text-blue-900 md:text-5xl">
          Compare Housing Options Near UTA
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-slate-600">
          Compare rating, review count, price level, and distance from campus to
          see which apartment fits you best.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="min-w-[950px] space-y-8">
          {apartments.map((apartment) => {
            const ratingWidth = (apartment.rating / maxRating) * 100;
            const reviewWidth = (apartment.reviewCount / maxReviews) * 100;
            const distanceValue = getDistanceNumber(apartment.distanceFromUTA);
            const distanceWidth = (distanceValue / maxDistance) * 100;
            const priceScore = getPriceScore(apartment.priceLevel);
            const priceWidth = (priceScore / 3) * 100;
            const imageSrc = resolveImageSrc(apartment);

            return (
              <article
                key={apartment.id}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-sm">
                      <Image
                        src={imageSrc}
                        alt={apartment.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-110"
                        sizes="80px"
                      />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-blue-900 transition duration-300 group-hover:text-blue-700">
                        {apartment.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {apartment.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                      {apartment.priceLevel}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
                      {apartment.distanceFromUTA}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Rating</span>
                      <span className="font-semibold text-slate-600">
                        {apartment.rating.toFixed(1)} / 5
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-4 rounded-full bg-blue-600 transition-all duration-1000 ease-out"
                        style={{ width: isVisible ? `${ratingWidth}%` : "0%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        Review Count
                      </span>
                      <span className="font-semibold text-slate-600">
                        {apartment.reviewCount}
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-4 rounded-full bg-sky-500 transition-all duration-1000 ease-out"
                        style={{ width: isVisible ? `${reviewWidth}%` : "0%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        Price Level
                      </span>
                      <span className="font-semibold text-slate-600">
                        {apartment.priceLevel}
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-4 rounded-full bg-indigo-500 transition-all duration-1000 ease-out"
                        style={{ width: isVisible ? `${priceWidth}%` : "0%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        Distance from UTA
                      </span>
                      <span className="font-semibold text-slate-600">
                        {apartment.distanceFromUTA}
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-4 rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                        style={{ width: isVisible ? `${distanceWidth}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {apartment.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition duration-300 group-hover:bg-slate-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6">
                  <Link
                    href={`/housing/${apartment.id}`}
                    className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition duration-300 hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}