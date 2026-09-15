"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

type CampusType =
  | "on-campus"
  | "off-campus";

type HousingType =
  | "residence-hall"
  | "uta-apartment"
  | "private-student-apartment"
  | "student-apartment"
  | "apartment";

type Building = {
  id: string;
  name: string;

  category:
    | "apartment"
    | "residence-hall";

  source: string;

  campusType: CampusType;
  housingType: HousingType;

  ownership: string;
  studentFocused: boolean;

  address: string;
  shortLocation: string;
  description: string;

  image: string;
  priceLevel: string;

  officialFeatures: string[];
  tags: string[];

  officialUrl: string;

  rating: number;
  reviewCount: number;

  distanceFromUTA: string;

  latitude: number | null;
  longitude: number | null;
};

function resolveImageSrc(
  building: Building
) {
  if (!building.image) {
    return "/UTA-Logo.png";
  }

  return building.image.startsWith("/")
    ? building.image
    : `/${building.image}`;
}

function housingTypeLabel(
  type: HousingType
) {
  switch (type) {
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
      return "Housing";
  }
}

function Stars({
  rating,
}: {
  rating: number;
}) {
  const rounded =
    Math.round(rating);

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
            key={star}
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

function HeroBenefit({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-white text-lg shadow-sm">
        {icon}
      </div>

      <div>

        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="text-xs text-slate-500">
          {subtitle}
        </p>

      </div>

    </div>
  );
}

export default function TopRatedPage() {
  const [
    buildings,
    setBuildings,
  ] =
    useState<Building[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/browse-housing",
            {
              cache:
                "no-store",
            }
          );

        const result =
          await response
            .json()
            .catch(
              () => null
            );

        if (!response.ok) {
          throw new Error(
            result?.error ||
              result?.details ||
              "Failed to load housing."
          );
        }

        setBuildings(
          Array.isArray(result)
            ? result
            : []
        );
      } catch (error) {
        console.error(
          "Top rated load error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load top rated housing."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // =====================================================
  // RANKINGS
  //
  // Rating and reviewCount already come from the corrected
  // /api/browse-housing endpoint.
  //
  // Ranking:
  // 1. Highest rating
  // 2. Highest review count
  // 3. Alphabetical name
  // =====================================================

  const rankedHousing =
    useMemo(() => {
      return [...buildings].sort(
        (a, b) => {
          if (
            b.rating !==
            a.rating
          ) {
            return (
              b.rating -
              a.rating
            );
          }

          if (
            b.reviewCount !==
            a.reviewCount
          ) {
            return (
              b.reviewCount -
              a.reviewCount
            );
          }

          return a.name.localeCompare(
            b.name
          );
        }
      );
    }, [buildings]);

  const rankedWithReviews =
    useMemo(
      () =>
        rankedHousing.filter(
          (building) =>
            building.reviewCount >
            0
        ),
      [rankedHousing]
    );

  const waitingForReviews =
    useMemo(
      () =>
        rankedHousing.filter(
          (building) =>
            building.reviewCount ===
            0
        ),
      [rankedHousing]
    );

  const counts =
    useMemo(() => {
      return {
        total:
          buildings.length,

        reviewed:
          rankedWithReviews.length,

        waiting:
          waitingForReviews.length,

        onCampus:
          buildings.filter(
            (building) =>
              building.campusType ===
              "on-campus"
          ).length,

        offCampus:
          buildings.filter(
            (building) =>
              building.campusType ===
              "off-campus"
          ).length,
      };
    }, [
      buildings,
      rankedWithReviews,
      waitingForReviews,
    ]);

  return (
    <main className="min-h-screen bg-[#f7faff] pt-20">

      {/* ============================================
          HERO
      ============================================ */}

      <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-blue-50">

        <div className="absolute inset-y-0 right-0 hidden w-[47%] lg:block">

          <Image
            src="/UTA_image2.jpg"
            alt="UT Arlington campus"
            fill
            priority
            className="object-cover"
            sizes="47vw"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />

        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-700">
              Student Ratings
            </p>

            <h1 className="mt-4 max-w-3xl text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">
              Top Rated Housing
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Discover UTA housing and nearby apartments
              ranked using reviews submitted through CHUD.
              Compare real student feedback before choosing
              where to live.
            </p>

            <div className="mt-8 grid max-w-2xl gap-5 sm:grid-cols-3">

              <HeroBenefit
                icon="▣"
                title="Student Reviews"
                subtitle="Real experiences"
              />

              <HeroBenefit
                icon="★"
                title="Live Ratings"
                subtitle="Updated from CHUD"
              />

              <HeroBenefit
                icon="⌖"
                title="Near UTA"
                subtitle="On & off campus"
              />

            </div>

            <div className="mt-9 flex flex-wrap gap-4">

              <Link
                href="/browse-housing"
                className="inline-flex items-center rounded-xl bg-blue-700 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-700/15 transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                Browse All Housing

                <span className="ml-2">
                  →
                </span>
              </Link>

              <Link
                href="/write-review"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Write a Review
              </Link>

            </div>

          </div>

          <div className="hidden items-end justify-end lg:flex">

            <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/80 bg-white/90 p-7 shadow-2xl shadow-blue-900/10 backdrop-blur">

              <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
                CHUD Housing
              </p>

              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-slate-950">
                Find Your Home Near UTA
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Compare. Explore. Live better.
              </p>

              {!loading && (
                <div className="mt-6 grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-blue-50 p-4">

                    <p className="text-2xl font-extrabold text-blue-700">
                      {counts.total}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-blue-600">
                      Properties
                    </p>

                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">

                    <p className="text-2xl font-extrabold text-amber-700">
                      {counts.reviewed}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-amber-700">
                      Reviewed
                    </p>

                  </div>

                </div>
              )}

              <div className="mt-6 flex gap-1">

                <div className="h-1 w-12 rounded-full bg-orange-500" />

                <div className="h-1 w-5 rounded-full bg-blue-700" />

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ============================================
          SUMMARY
      ============================================ */}

      {!loading &&
        !error && (
          <section className="border-b border-slate-200 bg-white">

            <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <SummaryCard
                  number={
                    counts.total
                  }
                  label="Total Properties"
                />

                <SummaryCard
                  number={
                    counts.reviewed
                  }
                  label="Reviewed"
                />

                <SummaryCard
                  number={
                    counts.onCampus
                  }
                  label="On Campus"
                />

                <SummaryCard
                  number={
                    counts.offCampus
                  }
                  label="Off Campus"
                />

              </div>

            </div>

          </section>
        )}

      {/* ============================================
          TOP RATED
      ============================================ */}

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
              Rankings
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              Top Rated by UTA Students
            </h2>

            <p className="mt-3 text-lg text-slate-600">
              Ranked by average CHUD rating.
              Review count is used as a tie-breaker.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            {!loading &&
              rankedWithReviews.length >
                0 && (
                <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  {
                    rankedWithReviews.length
                  }{" "}
                  reviewed{" "}
                  {rankedWithReviews.length ===
                  1
                    ? "property"
                    : "properties"}
                </div>
              )}

            <Link
              href="/browse-housing"
              className="rounded-xl border border-blue-300 bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-500 hover:bg-blue-50"
            >
              View All Housing →
            </Link>

          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="mt-9 grid gap-7 md:grid-cols-2 xl:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white"
                >

                  <div className="h-64 bg-slate-200" />

                  <div className="space-y-4 p-6">

                    <div className="h-6 w-3/4 rounded bg-slate-200" />

                    <div className="h-4 w-1/2 rounded bg-slate-200" />

                    <div className="h-20 rounded bg-slate-100" />

                  </div>

                </div>
              )
            )}

          </div>
        )}

        {/* ERROR */}

        {!loading &&
          error && (
            <div className="mt-9 rounded-3xl border border-red-200 bg-red-50 p-8">

              <h3 className="font-bold text-red-900">
                Unable to load rankings
              </h3>

              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>

            </div>
          )}

        {/* RANKED CARDS */}

        {!loading &&
          !error &&
          rankedWithReviews.length >
            0 && (
            <div className="mt-9 grid gap-7 md:grid-cols-2 xl:grid-cols-3">

              {rankedWithReviews.map(
                (
                  building,
                  index
                ) => (
                  <TopHousingCard
                    key={
                      building.id
                    }
                    building={
                      building
                    }
                    rank={
                      index + 1
                    }
                  />
                )
              )}

            </div>
          )}

        {/* NO REVIEWS */}

        {!loading &&
          !error &&
          rankedWithReviews.length ===
            0 && (
            <div className="mt-9 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-sm">

              <div className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center">

                <div>

                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-xl">
                    ★
                  </div>

                  <h3 className="mt-5 text-2xl font-extrabold text-slate-950">
                    Be the first to shape the rankings
                  </h3>

                  <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                    CHUD uses student reviews for these
                    rankings. Once reviews are submitted,
                    the highest-rated housing will
                    automatically appear here.
                  </p>

                </div>

                <Link
                  href="/write-review"
                  className="inline-flex w-fit rounded-xl bg-blue-700 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-800"
                >
                  Write the First Review
                </Link>

              </div>

            </div>
          )}

      </section>

      {/* ============================================
          WAITING FOR REVIEWS
      ============================================ */}

      {!loading &&
        !error &&
        waitingForReviews.length >
          0 && (
          <section className="border-t border-blue-100 bg-gradient-to-b from-blue-50/50 to-white">

            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                <div>

                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                    Help the community
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                    Waiting for Reviews
                  </h2>

                  <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
                    These properties are available in CHUD
                    but do not have student feedback yet.
                    Be the first to share your experience.
                  </p>

                </div>

                <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                  {waitingForReviews.length}{" "}
                  waiting for feedback
                </div>

              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {waitingForReviews.map(
                  (building) => (
                    <WaitingCard
                      key={
                        building.id
                      }
                      building={
                        building
                      }
                    />
                  )
                )}

              </div>

            </div>

          </section>
        )}

      {/* ============================================
          CTA
      ============================================ */}

      <section className="relative overflow-hidden bg-blue-800">

        <div className="absolute inset-0 opacity-10">

          <Image
            src="/UTA_image.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />

        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-14 text-white lg:grid-cols-[1fr_1fr_auto] lg:items-center lg:px-8">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
              Help the UTA Community
            </p>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight">
              Lived somewhere near UTA?
              <br />
              Share your experience.
            </h2>

          </div>

          <p className="max-w-xl leading-7 text-blue-100">
            Your review can help another student
            understand the location, noise level,
            cleanliness, amenities, and overall
            experience before choosing where to live.
          </p>

          <Link
            href="/write-review"
            className="inline-flex w-fit items-center rounded-xl bg-white px-6 py-3.5 font-semibold text-blue-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
          >
            Write a Review

            <span className="ml-2">
              →
            </span>
          </Link>

        </div>

      </section>

    </main>
  );
}

function SummaryCard({
  number,
  label,
}: {
  number: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <p className="text-3xl font-extrabold text-slate-950">
        {number}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        {label}
      </p>

    </div>
  );
}

function TopHousingCard({
  building,
  rank,
}: {
  building: Building;
  rank: number;
}) {
  const imageSrc =
    resolveImageSrc(
      building
    );

  const rankStyle =
    rank === 1
      ? "bg-amber-400 text-slate-950"
      : rank === 2
      ? "bg-slate-200 text-slate-800"
      : rank === 3
      ? "bg-orange-300 text-orange-950"
      : "bg-blue-700 text-white";

  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-md shadow-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="relative h-64 overflow-hidden">

        <Image
          src={imageSrc}
          alt={
            building.name
          }
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <div
          className={`absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold shadow-lg ${rankStyle}`}
        >
          #{rank}
        </div>

        <div className="absolute right-4 top-4 flex flex-col items-end gap-2">

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur ${
              building.campusType ===
              "on-campus"
                ? "bg-blue-700/95 text-white"
                : "bg-white/95 text-slate-800"
            }`}
          >
            {building.campusType ===
            "on-campus"
              ? "On Campus"
              : "Off Campus"}
          </span>

          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm backdrop-blur">
            {housingTypeLabel(
              building.housingType
            )}
          </span>

        </div>

      </div>

      <div className="p-6">

        <h3 className="text-2xl font-extrabold text-slate-950">
          {building.name}
        </h3>

        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">

          <span className="text-blue-700">
            ●
          </span>

          {building.distanceFromUTA}

        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">

          <Stars
            rating={
              building.rating
            }
          />

          <span className="text-lg font-extrabold text-slate-950">
            {building.rating.toFixed(
              1
            )}
          </span>

          <span className="text-sm text-slate-500">
            (
            {building.reviewCount}{" "}
            review
            {building.reviewCount !==
            1
              ? "s"
              : ""}
            )
          </span>

        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">

          <div className="rounded-2xl bg-blue-50 p-4">

            <p className="text-sm font-extrabold text-blue-800">
              {building.campusType ===
              "on-campus"
                ? "On Campus"
                : "Off Campus"}
            </p>

            <p className="mt-1 text-xs font-semibold text-blue-600">
              Campus location
            </p>

          </div>

          <div className="rounded-2xl bg-slate-50 p-4">

            <p className="text-2xl font-extrabold text-slate-900">
              {building.priceLevel}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-600">
              Price level
            </p>

          </div>

        </div>

        <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-600">
          {building.description}
        </p>

        {building.tags.length >
          0 && (
          <div className="mt-5 flex flex-wrap gap-2">

            {building.tags
              .slice(
                0,
                3
              )
              .map(
                (
                  tag,
                  index
                ) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                  >
                    {tag}
                  </span>
                )
              )}

            {building.tags.length >
              3 && (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                +
                {building.tags.length -
                  3}
              </span>
            )}

          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">

          <Link
            href={`/housing/${building.id}`}
            className="rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800"
          >
            View Details
          </Link>

          <Link
            href={`/map?housing=${encodeURIComponent(
              building.id
            )}`}
            className="rounded-xl border border-blue-300 bg-white px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            View Map
          </Link>

        </div>

      </div>

    </article>
  );
}

function WaitingCard({
  building,
}: {
  building: Building;
}) {
  return (
    <Link
      href={`/housing/${building.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
    >

      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">

        <Image
          src={resolveImageSrc(
            building
          )}
          alt={
            building.name
          }
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="96px"
        />

      </div>

      <div className="min-w-0 flex-1">

        <div className="flex flex-wrap gap-2">

          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
              building.campusType ===
              "on-campus"
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {building.campusType ===
            "on-campus"
              ? "On Campus"
              : "Off Campus"}
          </span>

        </div>

        <h3 className="mt-2 truncate font-bold text-slate-950">
          {building.name}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          No student reviews yet
        </p>

      </div>

      <span className="text-xl text-blue-600">
        ›
      </span>

    </Link>
  );
}