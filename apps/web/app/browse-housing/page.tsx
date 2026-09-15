"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import type {
  HousingItem,
  CampusType,
  HousingType,
} from "@/app/lib/mapBuilding";

type CampusFilter =
  | "all"
  | CampusType;

type HousingTypeFilter =
  | "all"
  | HousingType;

type RatingFilter =
  | "all"
  | "4"
  | "3";

type SortOption =
  | "recommended"
  | "rating-high"
  | "reviews-high"
  | "name-az";

function normalizeText(
  value: string | null | undefined
) {
  return (value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeHousingItem(
  item: Record<string, unknown>
): HousingItem {
  const categoryText = String(
    item.category ??
      item.type ??
      ""
  ).toLowerCase();

  const campusType: CampusType =
    item.campusType === "on-campus" ||
    item.campus_type === "on-campus"
      ? "on-campus"
      : "off-campus";

  const rawHousingType = String(
    item.housingType ??
      item.housing_type ??
      ""
  );

  let housingType: HousingType;

  switch (rawHousingType) {
    case "residence-hall":
      housingType = "residence-hall";
      break;

    case "uta-apartment":
      housingType = "uta-apartment";
      break;

    case "private-student-apartment":
      housingType =
        "private-student-apartment";
      break;

    case "student-apartment":
      housingType = "student-apartment";
      break;

    case "apartment":
      housingType = "apartment";
      break;

    default:
      housingType =
        categoryText.includes(
          "residence"
        )
          ? "residence-hall"
          : "apartment";
  }

  return {
    id: String(
      item.id ??
        item.slug ??
        ""
    ),

    name: String(
      item.name ??
        "Unknown Housing"
    ),

    category:
      housingType ===
      "residence-hall"
        ? "residence-hall"
        : "apartment",

    source: String(
      item.source ??
        (campusType ===
        "on-campus"
          ? "UTA"
          : "Off Campus")
    ),

    campusType,

    housingType,

    ownership: String(
      item.ownership ??
        (campusType ===
        "on-campus"
          ? "UTA"
          : "Private")
    ),

    studentFocused:
      typeof item.studentFocused ===
      "boolean"
        ? item.studentFocused
        : typeof item.student_focused ===
          "boolean"
        ? item.student_focused
        : housingType !==
          "apartment",

    address: String(
      item.address ??
        "UTA area"
    ),

    shortLocation: String(
      item.shortLocation ??
        item.short_location ??
        item.location ??
        "Near UTA"
    ),

    description: String(
      item.description ??
        "Housing information is not available yet."
    ),

    image: String(
      item.image ?? ""
    ),

    priceLevel: String(
      item.priceLevel ??
        item.price_level ??
        "$$"
    ),

    officialFeatures:
      Array.isArray(
        item.officialFeatures
      )
        ? (item.officialFeatures as string[])
        : Array.isArray(
            item.official_features
          )
        ? (item.official_features as string[])
        : [],

    tags: Array.isArray(
      item.tags
    )
      ? (item.tags as string[])
      : [],

    officialUrl: String(
      item.officialUrl ??
        item.official_url ??
        ""
    ),

    rating: Number(
      item.rating ?? 0
    ),

    reviewCount: Number(
      item.reviewCount ??
        item.review_count ??
        0
    ),

    distanceFromUTA: String(
      item.distanceFromUTA ??
        item.distance_from_uta ??
        "Near UTA"
    ),

    latitude:
      item.latitude == null
        ? null
        : Number(
            item.latitude
          ),

    longitude:
      item.longitude == null
        ? null
        : Number(
            item.longitude
          ),
  };
}

function resolveImageSrc(
  housing: HousingItem
) {
  if (housing.image) {
    return housing.image.startsWith(
      "/"
    )
      ? housing.image
      : `/${housing.image}`;
  }

  return "/UTA-Logo.png";
}

function Stars({
  rating,
}: {
  rating: number;
}) {
  const rounded =
    Math.round(rating);

  return (
    <div className="flex items-center gap-0.5">
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
  }
}

function housingTypeIcon(
  type: HousingType
) {
  switch (type) {
    case "residence-hall":
      return "🏫";

    case "uta-apartment":
      return "🏠";

    case "private-student-apartment":
      return "🎓";

    case "student-apartment":
      return "🎓";

    case "apartment":
      return "🏢";
  }
}

export default function BrowseHousingPage() {
  const [
    housing,
    setHousing,
  ] =
    useState<HousingItem[]>(
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

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    campusFilter,
    setCampusFilter,
  ] =
    useState<CampusFilter>(
      "all"
    );

  const [
    housingTypeFilter,
    setHousingTypeFilter,
  ] =
    useState<HousingTypeFilter>(
      "all"
    );

  const [
    ratingFilter,
    setRatingFilter,
  ] =
    useState<RatingFilter>(
      "all"
    );

  const [
    sortBy,
    setSortBy,
  ] =
    useState<SortOption>(
      "recommended"
    );

  const [
    amenity,
    setAmenity,
  ] =
    useState("all");

  useEffect(() => {
    async function loadHousing() {
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
              "Unable to load housing."
          );
        }

        const normalized =
          Array.isArray(result)
            ? result.map(
                normalizeHousingItem
              )
            : [];

        setHousing(
          normalized
        );
      } catch (error) {
        console.error(
          "Browse housing error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load housing."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHousing();
  }, []);

  const counts =
    useMemo(() => {
      return {
        all: housing.length,

        onCampus:
          housing.filter(
            (item) =>
              item.campusType ===
              "on-campus"
          ).length,

        offCampus:
          housing.filter(
            (item) =>
              item.campusType ===
              "off-campus"
          ).length,

        residenceHalls:
          housing.filter(
            (item) =>
              item.housingType ===
              "residence-hall"
          ).length,

        utaApartments:
          housing.filter(
            (item) =>
              item.housingType ===
              "uta-apartment"
          ).length,

        privateStudent:
          housing.filter(
            (item) =>
              item.housingType ===
              "private-student-apartment"
          ).length,

        studentApartments:
          housing.filter(
            (item) =>
              item.housingType ===
              "student-apartment"
          ).length,

        apartments:
          housing.filter(
            (item) =>
              item.housingType ===
              "apartment"
          ).length,
      };
    }, [housing]);

  const allAmenities =
    useMemo(() => {
      const values =
        new Set<string>();

      housing.forEach(
        (property) => {
          [
            ...property.tags,
            ...property.officialFeatures,
          ].forEach(
            (value) => {
              if (
                value.trim()
              ) {
                values.add(
                  value
                );
              }
            }
          );
        }
      );

      return Array.from(
        values
      )
        .sort()
        .slice(0, 20);
    }, [housing]);

  const filteredHousing =
    useMemo(() => {
      let result = [
        ...housing,
      ];

      const query =
        normalizeText(
          search
        );

      if (query) {
        result =
          result.filter(
            (property) => {
              const searchable =
                [
                  property.name,
                  property.address,
                  property.shortLocation,
                  property.description,
                  property.source,
                  property.campusType,
                  property.housingType,
                  property.ownership,
                  ...property.tags,
                  ...property.officialFeatures,
                ]
                  .join(" ")
                  .toLowerCase();

              return searchable.includes(
                query
              );
            }
          );
      }

      if (
        campusFilter !==
        "all"
      ) {
        result =
          result.filter(
            (property) =>
              property.campusType ===
              campusFilter
          );
      }

      if (
        housingTypeFilter !==
        "all"
      ) {
        result =
          result.filter(
            (property) =>
              property.housingType ===
              housingTypeFilter
          );
      }

      if (
        ratingFilter ===
        "4"
      ) {
        result =
          result.filter(
            (property) =>
              property.rating >= 4
          );
      }

      if (
        ratingFilter ===
        "3"
      ) {
        result =
          result.filter(
            (property) =>
              property.rating >= 3
          );
      }

      if (
        amenity !==
        "all"
      ) {
        result =
          result.filter(
            (property) => {
              const values =
                [
                  ...property.tags,
                  ...property.officialFeatures,
                ].map(
                  normalizeText
                );

              return values.includes(
                normalizeText(
                  amenity
                )
              );
            }
          );
      }

      if (
        sortBy ===
        "rating-high"
      ) {
        result.sort(
          (a, b) =>
            b.rating -
            a.rating
        );
      }

      if (
        sortBy ===
        "reviews-high"
      ) {
        result.sort(
          (a, b) =>
            b.reviewCount -
            a.reviewCount
        );
      }

      if (
        sortBy ===
        "name-az"
      ) {
        result.sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        );
      }

      if (
        sortBy ===
        "recommended"
      ) {
        result.sort(
          (a, b) => {
            // Properties with reviews first.
            if (
              a.reviewCount ===
                0 &&
              b.reviewCount >
                0
            ) {
              return 1;
            }

            if (
              b.reviewCount ===
                0 &&
              a.reviewCount >
                0
            ) {
              return -1;
            }

            if (
              b.rating !==
              a.rating
            ) {
              return (
                b.rating -
                a.rating
              );
            }

            return (
              b.reviewCount -
              a.reviewCount
            );
          }
        );
      }

      return result;
    }, [
      housing,
      search,
      campusFilter,
      housingTypeFilter,
      ratingFilter,
      amenity,
      sortBy,
    ]);

  function selectCampus(
    campus: CampusFilter
  ) {
    setCampusFilter(
      campus
    );

    // Reset subtype whenever
    // the main campus tab changes.
    setHousingTypeFilter(
      "all"
    );
  }

  function clearFilters() {
    setSearch("");
    setCampusFilter(
      "all"
    );
    setHousingTypeFilter(
      "all"
    );
    setRatingFilter(
      "all"
    );
    setAmenity("all");
    setSortBy(
      "recommended"
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pt-20">

      {/* HERO */}
      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                Housing around UT Arlington
              </p>

              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                Find your next place.
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Explore on-campus and off-campus housing,
                compare student feedback, discover amenities,
                and find the right place near UTA.
              </p>
            </div>

            <Link
              href="/map"
              className="inline-flex w-fit items-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-bold text-blue-700 transition hover:bg-blue-100"
            >
              ◎ View Map
            </Link>

          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/5">

            <div className="relative">

              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search apartments, residence halls, pool, furnished..."
                className="w-full rounded-xl bg-slate-50 py-4 pl-12 pr-5 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

          </div>

        </div>

      </section>

      {/* MAIN CAMPUS FILTER */}
      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">

          <div className="flex gap-3 overflow-x-auto">

            <FilterChip
              active={
                campusFilter ===
                "all"
              }
              onClick={() =>
                selectCampus(
                  "all"
                )
              }
              label={`All Housing ${counts.all}`}
            />

            <FilterChip
              active={
                campusFilter ===
                "on-campus"
              }
              onClick={() =>
                selectCampus(
                  "on-campus"
                )
              }
              label={`🏫 On Campus ${counts.onCampus}`}
            />

            <FilterChip
              active={
                campusFilter ===
                "off-campus"
              }
              onClick={() =>
                selectCampus(
                  "off-campus"
                )
              }
              label={`🏙️ Off Campus ${counts.offCampus}`}
            />

          </div>

          {/* ON CAMPUS SUBTYPES */}

          {campusFilter ===
            "on-campus" && (
            <div className="mt-4 flex gap-2 overflow-x-auto border-t border-slate-100 pt-4">

              <SubFilterChip
                active={
                  housingTypeFilter ===
                  "all"
                }
                onClick={() =>
                  setHousingTypeFilter(
                    "all"
                  )
                }
                label={`All On Campus ${counts.onCampus}`}
              />

              <SubFilterChip
                active={
                  housingTypeFilter ===
                  "residence-hall"
                }
                onClick={() =>
                  setHousingTypeFilter(
                    "residence-hall"
                  )
                }
                label={`Residence Halls ${counts.residenceHalls}`}
              />

              <SubFilterChip
                active={
                  housingTypeFilter ===
                  "uta-apartment"
                }
                onClick={() =>
                  setHousingTypeFilter(
                    "uta-apartment"
                  )
                }
                label={`UTA Apartments ${counts.utaApartments}`}
              />

              <SubFilterChip
                active={
                  housingTypeFilter ===
                  "private-student-apartment"
                }
                onClick={() =>
                  setHousingTypeFilter(
                    "private-student-apartment"
                  )
                }
                label={`Private Student ${counts.privateStudent}`}
              />

            </div>
          )}

          {/* OFF CAMPUS SUBTYPES */}

          {campusFilter ===
            "off-campus" && (
            <div className="mt-4 flex gap-2 overflow-x-auto border-t border-slate-100 pt-4">

              <SubFilterChip
                active={
                  housingTypeFilter ===
                  "all"
                }
                onClick={() =>
                  setHousingTypeFilter(
                    "all"
                  )
                }
                label={`All Off Campus ${counts.offCampus}`}
              />

              <SubFilterChip
                active={
                  housingTypeFilter ===
                  "student-apartment"
                }
                onClick={() =>
                  setHousingTypeFilter(
                    "student-apartment"
                  )
                }
                label={`🎓 Student Apartments ${counts.studentApartments}`}
              />

              <SubFilterChip
                active={
                  housingTypeFilter ===
                  "apartment"
                }
                onClick={() =>
                  setHousingTypeFilter(
                    "apartment"
                  )
                }
                label={`🏢 Apartments ${counts.apartments}`}
              />

            </div>
          )}

        </div>

      </section>

      {/* FILTER BAR */}
      <section className="sticky top-20 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

            <div className="flex flex-wrap gap-3">

              <select
                value={
                  ratingFilter
                }
                onChange={(
                  event
                ) =>
                  setRatingFilter(
                    event.target
                      .value as RatingFilter
                  )
                }
                className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:border-blue-300 focus:border-blue-500"
              >
                <option value="all">
                  Any rating
                </option>

                <option value="4">
                  4★ & up
                </option>

                <option value="3">
                  3★ & up
                </option>
              </select>

              <select
                value={
                  amenity
                }
                onChange={(
                  event
                ) =>
                  setAmenity(
                    event.target.value
                  )
                }
                className="max-w-[220px] rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:border-blue-300 focus:border-blue-500"
              >
                <option value="all">
                  Any amenity
                </option>

                {allAmenities.map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  )
                )}
              </select>

            </div>

            <select
              value={sortBy}
              onChange={(
                event
              ) =>
                setSortBy(
                  event.target
                    .value as SortOption
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="recommended">
                Recommended
              </option>

              <option value="rating-high">
                Highest rated
              </option>

              <option value="reviews-high">
                Most reviewed
              </option>

              <option value="name-az">
                Name A–Z
              </option>
            </select>

          </div>

        </div>

      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-6 py-9 lg:px-8">

        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-2xl font-extrabold text-slate-950">
              {campusFilter ===
              "on-campus"
                ? "On-Campus Housing"
                : campusFilter ===
                  "off-campus"
                ? "Off-Campus Housing"
                : "Housing near UTA"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading properties..."
                : `${filteredHousing.length} option${
                    filteredHousing.length ===
                    1
                      ? ""
                      : "s"
                  } found`}
            </p>

          </div>

          {(search ||
            campusFilter !==
              "all" ||
            housingTypeFilter !==
              "all" ||
            ratingFilter !==
              "all" ||
            amenity !==
              "all") && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="w-fit text-sm font-bold text-blue-700 hover:underline"
            >
              Clear all filters
            </button>
          )}

        </div>

        {loading && (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white"
                >
                  <div className="h-64 bg-slate-200" />

                  <div className="space-y-4 p-6">
                    <div className="h-6 w-2/3 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-200" />
                  </div>
                </div>
              )
            )}

          </div>
        )}

        {!loading &&
          error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8">

              <h3 className="font-bold text-red-900">
                Unable to load housing
              </h3>

              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>

            </div>
          )}

        {!loading &&
          !error &&
          filteredHousing.length ===
            0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-700">
                ⌕
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">
                No housing matches your filters
              </h3>

              <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
                Try changing your search, rating requirement,
                housing type, or amenity.
              </p>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
              >
                Reset Filters
              </button>

            </div>
          )}

        {!loading &&
          !error &&
          filteredHousing.length >
            0 && (
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">

              {filteredHousing.map(
                (property) => (
                  <HousingCard
                    key={
                      property.id
                    }
                    property={
                      property
                    }
                  />
                )
              )}

            </div>
          )}

      </section>

    </main>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${
        active
          ? "bg-slate-950 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function SubFilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
      }`}
    >
      {label}
    </button>
  );
}

function HousingCard({
  property,
}: {
  property: HousingItem;
}) {
  const campusLabel =
    property.campusType ===
    "on-campus"
      ? "On Campus"
      : "Off Campus";

  const typeLabel =
    housingTypeLabel(
      property.housingType
    );

  const typeIcon =
    housingTypeIcon(
      property.housingType
    );

  return (
    <article className="group overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="relative h-64 overflow-hidden">

        <Image
          src={resolveImageSrc(
            property
          )}
          alt={property.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">

          <div className="flex flex-wrap gap-2">

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-extrabold shadow-sm backdrop-blur ${
                property.campusType ===
                "on-campus"
                  ? "bg-blue-700/95 text-white"
                  : "bg-white/95 text-slate-800"
              }`}
            >
              {campusLabel}
            </span>

            <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-slate-800 shadow-sm backdrop-blur">
              {typeIcon}{" "}
              {typeLabel}
            </span>

          </div>

          <span className="rounded-full bg-slate-950/85 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
            {property.priceLevel}
          </span>

        </div>

      </div>

      <div className="p-6">

        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
          {property.shortLocation}
        </p>

        <h3 className="mt-2 truncate text-2xl font-extrabold text-slate-950">
          {property.name}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-2">

          {property.reviewCount >
          0 ? (
            <>
              <Stars
                rating={
                  property.rating
                }
              />

              <span className="font-extrabold text-slate-950">
                {property.rating.toFixed(
                  1
                )}
              </span>

              <span className="text-sm text-slate-500">
                (
                {
                  property.reviewCount
                }{" "}
                review
                {property.reviewCount ===
                1
                  ? ""
                  : "s"}
                )
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-slate-500">
              No student reviews yet
            </span>
          )}

        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
          {property.address}
        </p>

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
          {property.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            {property.distanceFromUTA}
          </span>

          {property.studentFocused && (
            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
              Student Focused
            </span>
          )}

          {property.tags
            .slice(0, 2)
            .map(
              (
                tag,
                index
              ) => (
                <span
                  key={`${tag}-${index}`}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  {tag}
                </span>
              )
            )}

        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6">

          <Link
            href={`/housing/${property.id}`}
            className="rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800"
          >
            View Details
          </Link>

          <Link
            href={`/map?housing=${encodeURIComponent(
              property.id
            )}`}
            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
          >
            View Map
          </Link>

        </div>

      </div>

    </article>
  );
}