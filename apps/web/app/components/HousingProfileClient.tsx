"use client";

import {
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import ReviewSection, {
  type ReviewItem,
} from "./ReviewSection";

import type {
  HousingItem,
} from "@/app/lib/mapBuilding";

// =====================================================
// EXTENDED TYPE
// =====================================================

type HousingProfileItem =
  HousingItem & {
    campusType?:
      | "on-campus"
      | "off-campus";

    housingType?:
      | "residence-hall"
      | "uta-apartment"
      | "private-student-apartment"
      | "student-apartment"
      | "apartment";

    ownership?: string;

    studentFocused?: boolean;

    latitude?:
      | number
      | null;

    longitude?:
      | number
      | null;
  };

// =====================================================
// IMAGE
// =====================================================

function resolveImageSrc(
  apartment: HousingProfileItem
) {
  if (
    apartment.image?.trim()
  ) {
    return apartment.image.startsWith(
      "/"
    )
      ? apartment.image
      : `/${apartment.image}`;
  }

  return "/UTA-Logo.png";
}

// =====================================================
// STARS
// =====================================================

function renderStars(
  rating: number
) {
  const rounded =
    Math.round(
      rating
    );

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating.toFixed(
        1
      )} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <span
            key={
              star
            }
            className={
              star <= rounded
                ? "text-amber-400"
                : "text-slate-300"
            }
          >
            ★
          </span>
        )
      )}
    </div>
  );
}

// =====================================================
// HOUSING TYPE LABEL
// =====================================================

function getHousingTypeLabel(
  housingType?: string,
  category?: string
) {
  switch (
    housingType
  ) {
    case "residence-hall":
      return "Residence Hall";

    case "uta-apartment":
      return "UTA Apartment";

    case "private-student-apartment":
      return "Private Student Apartment";

    case "student-apartment":
      return "Student Apartment";

    case "apartment":
      return "Apartment";

    default:
      return category ===
        "residence-hall"
        ? "Residence Hall"
        : "Apartment";
  }
}

// =====================================================
// CAMPUS LABEL
// =====================================================

function getCampusLabel(
  campusType?: string
) {
  return campusType ===
    "on-campus"
    ? "On Campus"
    : "Off Campus";
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function HousingProfileClient({
  apartment,
}: {
  apartment: HousingProfileItem;
}) {
  // =====================================================
  // REVIEW COUNT
  // =====================================================

  const [
    reviewCount,
    setReviewCount,
  ] =
    useState(
      Number(
        apartment.reviewCount ??
          0
      )
    );

  // =====================================================
  // LIVE REVIEWS
  //
  // ReviewSection sends the current review list here.
  //
  // We use this list for:
  //
  // 1. Live overall property rating
  // 2. Recommendation percentage
  // 3. Updating the profile immediately after review
  //    changes
  // =====================================================

  const [
    liveReviews,
    setLiveReviews,
  ] =
    useState<
      ReviewItem[]
    >([]);

  const imageSrc =
    resolveImageSrc(
      apartment
    );

  // =====================================================
  // LIVE OVERALL RATING
  //
  // IMPORTANT:
  //
  // The property's main rating is calculated ONLY from
  // each review's "overall" rating.
  //
  // Example:
  //
  // Review 1 overall = 5
  // Review 2 overall = 4
  //
  // Property rating = 4.5
  //
  // We do NOT average noise, cleanliness, amenities,
  // etc. into the main property rating.
  // =====================================================

  const averageRating =
    useMemo(() => {
      // ReviewSection has not loaded yet.
      //
      // Use the server-provided rating temporarily
      // so the page does not flash 0 while loading.

      if (
        liveReviews.length ===
        0
      ) {
        return Number(
          apartment.rating ??
            0
        );
      }

      // Only use reviews with a valid overall score.

      const validReviews =
        liveReviews.filter(
          (
            review
          ) => {
            const overall =
              Number(
                review
                  .categories
                  .overall
              );

            return (
              Number.isFinite(
                overall
              ) &&
              overall > 0
            );
          }
        );

      // If reviews exist but none contain a valid
      // overall rating, fall back to the original
      // server rating.

      if (
        validReviews.length ===
        0
      ) {
        return Number(
          apartment.rating ??
            0
        );
      }

      const total =
        validReviews.reduce(
          (
            sum,
            review
          ) =>
            sum +
            Number(
              review
                .categories
                .overall
            ),
          0
        );

      return (
        total /
        validReviews.length
      );
    }, [
      liveReviews,
      apartment.rating,
    ]);

  // =====================================================
  // RECOMMENDATION %
  // =====================================================

  const recommendationPercent =
    useMemo(() => {
      if (
        liveReviews.length ===
        0
      ) {
        return null;
      }

      const recommended =
        liveReviews.filter(
          (
            review
          ) =>
            review.wouldRecommend
        ).length;

      return Math.round(
        (recommended /
          liveReviews.length) *
          100
      );
    }, [
      liveReviews,
    ]);

  // =====================================================
  // LABELS
  // =====================================================

  const housingTypeLabel =
    getHousingTypeLabel(
      apartment.housingType,
      apartment.category
    );

  const campusLabel =
    getCampusLabel(
      apartment.campusType
    );

  // =====================================================
  // ARRAYS
  // =====================================================

  const tags =
    Array.isArray(
      apartment.tags
    )
      ? apartment.tags
      : [];

  const features =
    Array.isArray(
      apartment.officialFeatures
    )
      ? apartment.officialFeatures
      : [];

  // =====================================================
  // GOOGLE MAPS DIRECTIONS
  // =====================================================

  const googleDirectionsUrl =
    useMemo(() => {
      const destination =
        apartment.latitude !=
          null &&
        apartment.longitude !=
          null
          ? `${apartment.latitude},${apartment.longitude}`
          : apartment.address;

      if (
        !destination
      ) {
        return "";
      }

      const params =
        new URLSearchParams({
          api: "1",
          destination,
        });

      return `https://www.google.com/maps/dir/?${params.toString()}`;
    }, [
      apartment.latitude,
      apartment.longitude,
      apartment.address,
    ]);

  return (
    <main className="min-h-screen bg-[#f8fafc] pt-20">

      {/* =====================================
          BREADCRUMB
      ====================================== */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">

            <Link
              href="/"
              className="transition hover:text-blue-700"
            >
              Home
            </Link>

            <span>
              ›
            </span>

            <Link
              href="/browse-housing"
              className="transition hover:text-blue-700"
            >
              Browse Housing
            </Link>

            <span>
              ›
            </span>

            <span className="font-semibold text-slate-800">
              {
                apartment.name
              }
            </span>

          </div>

        </div>

      </section>

      {/* =====================================
          PROPERTY HEADER
      ====================================== */}

      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-6 pb-8 pt-8 lg:px-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            {/* LEFT */}

            <div>

              {/* PROPERTY LABELS */}

              <div className="flex flex-wrap items-center gap-3">

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    apartment.campusType ===
                    "on-campus"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  {
                    campusLabel
                  }
                </span>

                <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                  {
                    housingTypeLabel
                  }
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {
                    apartment.source
                  }
                </span>

              </div>

              {/* NAME */}

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                {
                  apartment.name
                }
              </h1>

              {/* ADDRESS */}

              <p className="mt-3 text-lg text-slate-600">
                {
                  apartment.address
                }
              </p>

              {/* RATING */}

              <div className="mt-4 flex flex-wrap items-center gap-4">

                {reviewCount >
                0 ? (
                  <>
                    <div className="flex items-center gap-2">

                      {renderStars(
                        averageRating
                      )}

                      <span className="font-extrabold text-slate-950">
                        {averageRating.toFixed(
                          1
                        )}
                      </span>

                    </div>

                    <span className="text-sm text-slate-500">
                      {
                        reviewCount
                      }{" "}
                      {reviewCount ===
                      1
                        ? "review"
                        : "reviews"}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-slate-500">
                    No student reviews
                    yet
                  </span>
                )}

                <span className="text-slate-300">
                  •
                </span>

                <span className="text-sm font-semibold text-blue-700">
                  {
                    apartment.distanceFromUTA
                  }
                </span>

              </div>

            </div>

            {/* HEADER ACTIONS */}

            <div className="flex flex-wrap gap-3">

              <Link
                href={`/map?housing=${encodeURIComponent(
                  apartment.id
                )}`}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                ◎ View on Map
              </Link>

              {googleDirectionsUrl && (
                <a
                  href={
                    googleDirectionsUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-bold text-green-700 transition hover:-translate-y-0.5 hover:bg-green-100"
                >
                  ↗ Get Directions
                </a>
              )}

              <Link
                href={`/write-review?id=${encodeURIComponent(
                  apartment.id
                )}`}
                className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                Write a Review
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          LARGE PROPERTY PHOTO
      ====================================== */}

      <section className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="relative h-[360px] overflow-hidden rounded-[2rem] bg-slate-200 shadow-sm sm:h-[460px] lg:h-[520px]">

          <Image
            src={
              imageSrc
            }
            alt={
              apartment.name
            }
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />

          {/* IMAGE TAGS */}

          <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">

            {tags
              .slice(
                0,
                4
              )
              .map(
                (
                  tag,
                  index
                ) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm backdrop-blur"
                  >
                    {
                      tag
                    }
                  </span>
                )
              )}

          </div>

        </div>

      </section>

      {/* =====================================
          MAIN DETAILS
      ====================================== */}

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_360px] lg:px-8">

        {/* =====================================
            LEFT COLUMN
        ====================================== */}

        <div>

          {/* OVERVIEW */}

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
                Property Overview
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                About{" "}
                {
                  apartment.name
                }
              </h2>

            </div>

            <p className="mt-5 text-base leading-8 text-slate-600">
              {apartment.description ||
                "Property information is currently unavailable."}
            </p>

          </section>

          {/* =====================================
              QUICK METRICS
          ====================================== */}

          <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <InfoCard
              label="Housing Type"
              value={
                housingTypeLabel
              }
              icon={
                apartment.category ===
                "apartment"
                  ? "🏢"
                  : "🏠"
              }
            />

            <InfoCard
              label="Price Level"
              value={
                apartment.priceLevel ||
                "Not listed"
              }
              icon="$"
            />

            <InfoCard
              label="Location"
              value={
                apartment.shortLocation ||
                campusLabel
              }
              icon="⌖"
            />

            <InfoCard
              label="Student Rating"
              value={
                reviewCount >
                0
                  ? `${averageRating.toFixed(
                      1
                    )} / 5`
                  : "No reviews"
              }
              icon="★"
            />

          </section>

          {/* =====================================
              AMENITIES
          ====================================== */}

          <section className="mt-10">

            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
              Amenities
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
              What this property
              offers
            </h2>

            {features.length >
            0 ? (
              <div className="mt-7 grid gap-4 sm:grid-cols-2">

                {features.map(
                  (
                    feature,
                    index
                  ) => (
                    <div
                      key={`${feature}-${index}`}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                        ✓
                      </div>

                      <p className="font-semibold text-slate-700">
                        {
                          feature
                        }
                      </p>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">

                <p className="text-slate-500">
                  No amenities have
                  been listed yet.
                </p>

              </div>
            )}

          </section>

          {/* =====================================
              REVIEWS
          ====================================== */}

          <ReviewSection
            apartmentId={
              apartment.id
            }
            onReviewCountChange={
              setReviewCount
            }
            onReviewsLoaded={
              setLiveReviews
            }
          />

        </div>

        {/* =====================================
            RIGHT STICKY PANEL
        ====================================== */}

        <aside>

          <div className="sticky top-28 space-y-5">

            {/* RATING CARD */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Student rating
                  </p>

                  {reviewCount >
                  0 ? (
                    <div className="mt-1 flex items-end gap-2">

                      <span className="text-4xl font-extrabold text-slate-950">
                        {averageRating.toFixed(
                          1
                        )}
                      </span>

                      <span className="mb-1 text-slate-500">
                        / 5
                      </span>

                    </div>
                  ) : (
                    <p className="mt-2 text-lg font-bold text-slate-700">
                      No ratings yet
                    </p>
                  )}

                </div>

                <div className="text-4xl text-amber-400">
                  ★
                </div>

              </div>

              {reviewCount >
                0 && (
                <div className="mt-4">

                  {renderStars(
                    averageRating
                  )}

                </div>
              )}

              <p className="mt-3 text-sm text-slate-500">
                {reviewCount >
                0
                  ? `Based on ${reviewCount} ${
                      reviewCount ===
                      1
                        ? "review"
                        : "reviews"
                    }`
                  : "Be the first student to review this property."}
              </p>

              {/* RECOMMENDATION */}

              {recommendationPercent !==
                null && (
                <div className="mt-5 rounded-2xl bg-emerald-50 p-4">

                  <p className="text-3xl font-extrabold text-emerald-600">
                    {
                      recommendationPercent
                    }
                    %
                  </p>

                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    of reviewers would
                    recommend it
                  </p>

                </div>
              )}

              {/* WRITE REVIEW */}

              <Link
                href={`/write-review?id=${encodeURIComponent(
                  apartment.id
                )}`}
                className="mt-6 block w-full rounded-xl bg-blue-700 px-5 py-3.5 text-center font-bold text-white transition hover:bg-blue-800"
              >
                Write a Review
              </Link>

              {/* VIEW MAP */}

              <Link
                href={`/map?housing=${encodeURIComponent(
                  apartment.id
                )}`}
                className="mt-3 block w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-center font-bold text-slate-700 transition hover:bg-slate-50"
              >
                ◎ View Location
              </Link>

              {/* GOOGLE DIRECTIONS */}

              {googleDirectionsUrl && (
                <a
                  href={
                    googleDirectionsUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block w-full rounded-xl border border-green-200 bg-green-50 px-5 py-3.5 text-center font-bold text-green-700 transition hover:bg-green-100"
                >
                  ↗ Get Directions
                </a>
              )}

            </div>

            {/* =====================================
                QUICK FACTS
            ====================================== */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-extrabold text-slate-950">
                Quick Facts
              </h3>

              <div className="mt-5 space-y-4">

                <QuickFact
                  label="Campus"
                  value={
                    campusLabel
                  }
                />

                <QuickFact
                  label="Housing type"
                  value={
                    housingTypeLabel
                  }
                />

                <QuickFact
                  label="Provider"
                  value={
                    apartment.source
                  }
                />

                {apartment.ownership && (
                  <QuickFact
                    label="Ownership"
                    value={
                      apartment.ownership
                    }
                  />
                )}

                <QuickFact
                  label="Price"
                  value={
                    apartment.priceLevel
                  }
                />

                <QuickFact
                  label="Distance"
                  value={
                    apartment.distanceFromUTA
                  }
                />

                {apartment.studentFocused !==
                  undefined && (
                  <QuickFact
                    label="Student focused"
                    value={
                      apartment.studentFocused
                        ? "Yes"
                        : "No"
                    }
                  />
                )}

              </div>

              {/* OFFICIAL WEBSITE */}

              {apartment.officialUrl && (
                <a
                  href={
                    apartment.officialUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block rounded-xl bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  Visit Official
                  Website ↗
                </a>
              )}

            </div>

            {/* =====================================
                LOCATION CARD
            ====================================== */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700">
                ⌖
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-slate-950">
                Location
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {
                  apartment.address
                }
              </p>

              <p className="mt-3 text-sm font-semibold text-blue-700">
                {
                  apartment.distanceFromUTA
                }
              </p>

              {apartment.latitude !=
                null &&
              apartment.longitude !=
                null ? (
                <p className="mt-3 text-xs font-semibold text-emerald-600">
                  ✓ Map location
                  available
                </p>
              ) : (
                <p className="mt-3 text-xs font-semibold text-orange-600">
                  Map coordinates not
                  available
                </p>
              )}

            </div>

          </div>

        </aside>

      </section>

    </main>
  );
}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
        {
          icon
        }
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
        {
          label
        }
      </p>

      <p className="mt-1 font-extrabold text-slate-950">
        {
          value
        }
      </p>

    </article>
  );
}

// =====================================================
// QUICK FACT
// =====================================================

function QuickFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">

      <span className="text-sm text-slate-500">
        {
          label
        }
      </span>

      <span className="text-right text-sm font-bold text-slate-800">
        {value ||
          "Not listed"}
      </span>

    </div>
  );
}