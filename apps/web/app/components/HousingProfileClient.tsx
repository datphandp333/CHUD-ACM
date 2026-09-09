"use client";

import { useMemo, useState } from "react";
import ReviewSection, { type ReviewItem } from "./ReviewSection";
import Image from "next/image";
import Link from "next/link";
import type { HousingItem } from "@/app/lib/mapBuilding";

function renderStars(rating: number) {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const rounded = Math.round(safeRating);

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${safeRating} out of 5 stars`}
    >
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

function getAverageFromCategories(review: ReviewItem): number | null {
  if (!review.categories) return null;

  const values = Object.values(review.categories);
  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getSafeCategory(category: string | undefined) {
  return category === "apartment" ? "Apartment" : "Residence Hall";
}

function getSafeSource(source: string | undefined) {
  return source && source.trim() !== "" ? source : "Not listed";
}

function getSafePrice(priceLevel: string | undefined) {
  return priceLevel && priceLevel.trim() !== "" ? priceLevel : "Not listed";
}

function getSafeDistance(distance: string | undefined) {
  return distance && distance.trim() !== "" ? distance : "Not listed";
}

function getSafeDescription(description: string | undefined) {
  return description && description.trim() !== ""
    ? description
    : "No description available yet.";
}

export default function HousingProfileClient({
  apartment,
}: {
  apartment: HousingItem;
}) {
  const [reviewCount, setReviewCount] = useState<number>(
    Number(apartment.reviewCount ?? 0)
  );
  const [liveReviews, setLiveReviews] = useState<ReviewItem[]>([]);

  const imageSrc = resolveImageSrc(apartment);
  const safeSource = getSafeSource(apartment.source);
  const safePrice = getSafePrice(apartment.priceLevel);
  const safeDistance = getSafeDistance(apartment.distanceFromUTA);
  const safeDescription = getSafeDescription(apartment.description);
  const safeCategory = getSafeCategory(apartment.category);

  const liveAverageRating = useMemo(() => {
    if (liveReviews.length === 0) {
      return Number(apartment.rating ?? 0);
    }

    const reviewAverages = liveReviews
      .map((review) => getAverageFromCategories(review))
      .filter((value): value is number => value !== null);

    if (reviewAverages.length === 0) {
      return Number(apartment.rating ?? 0);
    }

    return (
      reviewAverages.reduce((sum, value) => sum + value, 0) /
      reviewAverages.length
    );
  }, [liveReviews, apartment.rating]);

  const recommendStats = useMemo(() => {
    if (liveReviews.length === 0) return null;

    const yesCount = liveReviews.filter(
      (review) => review.wouldRecommend === true
    ).length;

    const percent = Math.round((yesCount / liveReviews.length) * 100);

    return {
      yesCount,
      percent,
    };
  }, [liveReviews]);

  const safeTags: string[] =
    Array.isArray(apartment.tags) && apartment.tags.length > 0
      ? apartment.tags
      : [];

  const safeFeatures: string[] =
    Array.isArray(apartment.officialFeatures) &&
    apartment.officialFeatures.length > 0
      ? apartment.officialFeatures
      : [];

  return (
    <main className="bg-slate-50 pt-28">
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Housing Profile
          </p>

          <h1 className="mt-2 text-4xl font-bold text-blue-900 md:text-5xl">
            {apartment.name || "Unknown Housing"}
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            {apartment.address || "UTA area"}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(liveAverageRating)}
              <span className="text-sm font-semibold text-slate-700">
                {liveAverageRating.toFixed(1)}
              </span>
            </div>

            <span className="text-sm text-slate-500">
              ({reviewCount} reviews)
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {safePrice}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {safeDistance}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {safeCategory}
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="relative h-[420px] overflow-hidden rounded-3xl bg-white shadow-sm">
            <Image
              src={imageSrc}
              alt={apartment.name || "Housing image"}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
          </div>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-blue-900">Quick Info</h2>

            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4">
                <span>Type</span>
                <span className="text-right font-medium text-slate-800">
                  {safeCategory}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span>Source</span>
                <span className="text-right font-medium text-slate-800">
                  {safeSource}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span>Price Range</span>
                <span className="text-right font-medium text-slate-800">
                  {safePrice}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span>Distance</span>
                <span className="text-right font-medium text-slate-800">
                  {safeDistance}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span>Average Rating</span>
                <span className="text-right font-medium text-slate-800">
                  {liveAverageRating.toFixed(1)} / 5
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span>Reviews</span>
                <span className="text-right font-medium text-slate-800">
                  {reviewCount}
                </span>
              </div>

              {recommendStats && (
                <div className="flex items-center justify-between gap-4">
                  <span>Would Recommend</span>
                  <span className="text-right font-medium text-slate-800">
                    {recommendStats.percent}%
                  </span>
                </div>
              )}
            </div>

            <Link
              href={`/write-review?id=${apartment.id}`}
              className="mt-6 block w-full rounded-full bg-blue-600 px-5 py-3 text-center font-medium text-white transition hover:bg-blue-700"
            >
              Write a Review
            </Link>

            {apartment.officialUrl && apartment.officialUrl.trim() !== "" ? (
              <a
                href={apartment.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block w-full rounded-full border border-slate-300 px-5 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Visit Official Site
              </a>
            ) : null}
          </aside>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              About This Housing
            </h2>

            <p className="mt-4 leading-8 text-slate-600">{safeDescription}</p>

            {safeTags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {safeTags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-blue-900">Features</h2>

              {safeFeatures.length > 0 ? (
                <ul className="mt-4 space-y-3 text-slate-600">
                  {safeFeatures.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 text-blue-600">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-slate-600">No features listed yet.</p>
              )}
            </div>

            <ReviewSection
              apartmentId={apartment.id}
              onReviewCountChange={setReviewCount}
              onReviewsLoaded={setLiveReviews}
            />
          </div>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-blue-900">
              Review Snapshot
            </h2>

            {reviewCount > 0 ? (
              <div className="mt-5 space-y-4 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Live Avg Rating</span>
                  <span className="font-semibold">
                    {liveAverageRating.toFixed(1)} / 5
                  </span>
                </div>

                {recommendStats && (
                  <div className="flex items-center justify-between">
                    <span>Recommend Rate</span>
                    <span className="font-semibold">
                      {recommendStats.percent}%
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Total Reviews</span>
                  <span className="font-semibold">{reviewCount}</span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-slate-600">
                  Detailed renter feedback appears below in the review section.
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                No detailed reviews yet. Be the first to share your experience.
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}