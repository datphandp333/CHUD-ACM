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
} from "@/app/lib/mapBuilding";

// ====================================================
// TYPES
// ====================================================

type DifferenceTone =
  | "better"
  | "neutral";

type DifferenceBadgeProps = {
  text: string;
  tone?: DifferenceTone;
};

// ====================================================
// HELPERS
// ====================================================

function getHousingTypeLabel(
  type: HousingItem["housingType"]
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

    default:
      return "Apartment";
  }
}

function getCampusLabel(
  campusType: HousingItem["campusType"]
) {
  return campusType === "on-campus"
    ? "On Campus"
    : "Off Campus";
}

function getPriceNumber(
  price: string
) {
  switch (price) {
    case "$":
      return 1;

    case "$$":
      return 2;

    case "$$$":
      return 3;

    default:
      return 0;
  }
}

function getImage(
  property: HousingItem
) {
  if (!property.image) {
    return "/UTA-Logo.png";
  }

  return property.image.startsWith("/")
    ? property.image
    : `/${property.image}`;
}

// ====================================================
// MAIN COMPONENT
// ====================================================

export default function CompareApartments() {
  const [
    housing,
    setHousing,
  ] =
    useState<HousingItem[]>([]);

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
    firstId,
    setFirstId,
  ] =
    useState("");

  const [
    secondId,
    setSecondId,
  ] =
    useState("");

  // ==================================================
  // LOAD HOUSING
  // ==================================================

  useEffect(() => {
    async function loadHousing() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/browse-housing",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load housing."
          );
        }

        const data =
          await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "Housing data is invalid."
          );
        }

        setHousing(
          data as HousingItem[]
        );

        // Automatically choose the first
        // two different properties so the
        // user immediately sees how the
        // comparison works.
        if (data.length >= 2) {
          setFirstId(
            String(data[0].id)
          );

          setSecondId(
            String(data[1].id)
          );
        }
      } catch (err) {
        console.error(
          "Compare housing error:",
          err
        );

        setError(
          "Unable to load housing comparison."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHousing();
  }, []);

  // ==================================================
  // SELECTED PROPERTIES
  // ==================================================

  const firstProperty =
    useMemo(
      () =>
        housing.find(
          (property) =>
            property.id ===
            firstId
        ) ?? null,
      [
        housing,
        firstId,
      ]
    );

  const secondProperty =
    useMemo(
      () =>
        housing.find(
          (property) =>
            property.id ===
            secondId
        ) ?? null,
      [
        housing,
        secondId,
      ]
    );

  const sameProperty =
    firstId !== "" &&
    secondId !== "" &&
    firstId === secondId;

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">

            <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />

            <div className="mt-5 h-10 max-w-xl animate-pulse rounded bg-slate-200" />

            <div className="mt-10 grid gap-5 md:grid-cols-2">

              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />

              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />

            </div>

          </div>

        </div>
      </section>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
            {error}
          </div>

        </div>
      </section>
    );
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <section className="border-y border-slate-200 bg-slate-50">

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
            Compare housing
          </p>

          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
            Compare two places side by side.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Choose two housing options to quickly compare
            price, location, ratings, housing type, and
            amenities.
          </p>

        </div>

        {/* ============================================
            SELECTORS
        ============================================ */}

        <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-end">

            {/* PROPERTY A */}

            <div>

              <label
                htmlFor="property-a"
                className="text-sm font-bold text-slate-800"
              >
                Property A
              </label>

              <select
                id="property-a"
                value={firstId}
                onChange={(event) =>
                  setFirstId(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >

                {housing.map(
                  (property) => (
                    <option
                      key={
                        property.id
                      }
                      value={
                        property.id
                      }
                    >
                      {
                        property.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* VS */}

            <div className="hidden pb-3 text-center md:block">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-500">
                VS
              </div>

            </div>

            {/* PROPERTY B */}

            <div>

              <label
                htmlFor="property-b"
                className="text-sm font-bold text-slate-800"
              >
                Property B
              </label>

              <select
                id="property-b"
                value={secondId}
                onChange={(event) =>
                  setSecondId(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >

                {housing.map(
                  (property) => (
                    <option
                      key={
                        property.id
                      }
                      value={
                        property.id
                      }
                    >
                      {
                        property.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {sameProperty && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              Choose two different properties to compare.
            </div>
          )}

        </div>

        {/* ============================================
            COMPARISON
        ============================================ */}

        {!sameProperty &&
          firstProperty &&
          secondProperty && (
            <Comparison
              first={
                firstProperty
              }
              second={
                secondProperty
              }
            />
          )}

      </div>

    </section>
  );
}

// ====================================================
// COMPARISON
// ====================================================

function Comparison({
  first,
  second,
}: {
  first: HousingItem;
  second: HousingItem;
}) {
  const firstPrice =
    getPriceNumber(
      first.priceLevel
    );

  const secondPrice =
    getPriceNumber(
      second.priceLevel
    );

  const firstRatingBetter =
    first.rating >
    second.rating;

  const secondRatingBetter =
    second.rating >
    first.rating;

  const firstPriceLower =
    firstPrice > 0 &&
    secondPrice > 0 &&
    firstPrice <
      secondPrice;

  const secondPriceLower =
    firstPrice > 0 &&
    secondPrice > 0 &&
    secondPrice <
      firstPrice;

  return (
    <div className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">

      {/* ============================================
          PROPERTY HEADERS
      ============================================ */}

      <div className="grid grid-cols-[130px_1fr_1fr] border-b border-slate-200 md:grid-cols-[200px_1fr_1fr]">

        <div className="hidden p-5 md:block" />

        <PropertyHeader
          property={first}
        />

        <PropertyHeader
          property={second}
        />

      </div>

      {/* ============================================
          QUICK FACTS
      ============================================ */}

      <SectionTitle title="Quick facts" />

      <ComparisonRow
        label="Overall rating"
        first={
          <RatingValue
            rating={
              first.rating
            }
            reviews={
              first.reviewCount
            }
            highlighted={
              firstRatingBetter
            }
          />
        }
        second={
          <RatingValue
            rating={
              second.rating
            }
            reviews={
              second.reviewCount
            }
            highlighted={
              secondRatingBetter
            }
          />
        }
      />

      <ComparisonRow
        label="Price level"
        first={
          <Value
            value={
              first.priceLevel
            }
            highlighted={
              firstPriceLower
            }
            badge={
              firstPriceLower
                ? "Lower price level"
                : undefined
            }
          />
        }
        second={
          <Value
            value={
              second.priceLevel
            }
            highlighted={
              secondPriceLower
            }
            badge={
              secondPriceLower
                ? "Lower price level"
                : undefined
            }
          />
        }
      />

      <ComparisonRow
        label="Distance from UTA"
        first={
          <Value
            value={
              first.distanceFromUTA
            }
          />
        }
        second={
          <Value
            value={
              second.distanceFromUTA
            }
          />
        }
      />

      <ComparisonRow
        label="Campus"
        first={
          <Value
            value={getCampusLabel(
              first.campusType
            )}
          />
        }
        second={
          <Value
            value={getCampusLabel(
              second.campusType
            )}
          />
        }
      />

      <ComparisonRow
        label="Housing type"
        first={
          <Value
            value={getHousingTypeLabel(
              first.housingType
            )}
          />
        }
        second={
          <Value
            value={getHousingTypeLabel(
              second.housingType
            )}
          />
        }
      />

      <ComparisonRow
        label="Student focused"
        first={
          <YesNo
            value={
              first.studentFocused
            }
          />
        }
        second={
          <YesNo
            value={
              second.studentFocused
            }
          />
        }
      />

      {/* ============================================
          FEATURES
      ============================================ */}

      <SectionTitle title="Amenities & features" />

      <FeatureComparison
        first={first}
        second={second}
      />

      {/* ============================================
          SUMMARY
      ============================================ */}

      <SectionTitle title="Key differences" />

      <div className="grid gap-0 md:grid-cols-[200px_1fr_1fr]">

        <div className="hidden border-r border-slate-200 p-6 md:block">

          <p className="text-sm font-bold text-slate-700">
            Highlights
          </p>

        </div>

        <DifferenceSummary
          property={first}
          other={second}
        />

        <DifferenceSummary
          property={second}
          other={first}
          right
        />

      </div>

    </div>
  );
}

// ====================================================
// PROPERTY HEADER
// ====================================================

function PropertyHeader({
  property,
}: {
  property: HousingItem;
}) {
  return (
    <div className="border-l border-slate-200 p-4 sm:p-6">

      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">

        <Image
          src={getImage(
            property
          )}
          alt={
            property.name
          }
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 400px"
        />

      </div>

      <div className="mt-4">

        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
          {getCampusLabel(
            property.campusType
          )}
        </p>

        <h3 className="mt-1 text-lg font-extrabold text-slate-950 sm:text-xl">
          {property.name}
        </h3>

        <p className="mt-2 hidden text-sm leading-6 text-slate-500 sm:block">
          {property.shortLocation}
        </p>

        <Link
          href={`/housing/${property.id}`}
          className="mt-4 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900"
        >
          View details →
        </Link>

      </div>

    </div>
  );
}

// ====================================================
// SECTION TITLE
// ====================================================

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <div className="border-y border-slate-200 bg-slate-50 px-5 py-3">

      <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-500">
        {title}
      </p>

    </div>
  );
}

// ====================================================
// COMPARISON ROW
// ====================================================

function ComparisonRow({
  label,
  first,
  second,
}: {
  label: string;
  first: React.ReactNode;
  second: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[130px_1fr_1fr] border-b border-slate-200 md:grid-cols-[200px_1fr_1fr]">

      <div className="flex items-center p-4 md:p-5">

        <p className="text-xs font-bold text-slate-600 sm:text-sm">
          {label}
        </p>

      </div>

      <div className="flex items-center border-l border-slate-200 p-4 md:p-5">
        {first}
      </div>

      <div className="flex items-center border-l border-slate-200 p-4 md:p-5">
        {second}
      </div>

    </div>
  );
}

// ====================================================
// VALUE
// ====================================================

function Value({
  value,
  highlighted = false,
  badge,
}: {
  value: string;
  highlighted?: boolean;
  badge?: string;
}) {
  return (
    <div>

      <p
        className={
          highlighted
            ? "font-extrabold text-emerald-700"
            : "font-semibold text-slate-800"
        }
      >
        {value}
      </p>

      {badge && (
        <DifferenceBadge
          text={badge}
        />
      )}

    </div>
  );
}

// ====================================================
// RATING
// ====================================================

function RatingValue({
  rating,
  reviews,
  highlighted,
}: {
  rating: number;
  reviews: number;
  highlighted: boolean;
}) {
  if (reviews === 0) {
    return (
      <div>

        <p className="font-semibold text-slate-500">
          Not rated yet
        </p>

        <p className="mt-1 text-xs text-slate-400">
          0 reviews
        </p>

      </div>
    );
  }

  return (
    <div>

      <div className="flex items-center gap-1">

        <span className="text-amber-400">
          ★
        </span>

        <span
          className={
            highlighted
              ? "font-extrabold text-emerald-700"
              : "font-extrabold text-slate-900"
          }
        >
          {rating.toFixed(
            1
          )}
        </span>

      </div>

      <p className="mt-1 text-xs text-slate-500">
        {reviews}{" "}
        {reviews === 1
          ? "review"
          : "reviews"}
      </p>

      {highlighted && (
        <DifferenceBadge
          text="Higher rating"
        />
      )}

    </div>
  );
}

// ====================================================
// YES / NO
// ====================================================

function YesNo({
  value,
}: {
  value: boolean;
}) {
  return value ? (
    <span className="inline-flex items-center gap-2 font-semibold text-emerald-700">

      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs">
        ✓
      </span>

      Yes

    </span>
  ) : (
    <span className="inline-flex items-center gap-2 font-semibold text-slate-500">

      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs">
        —
      </span>

      No

    </span>
  );
}

// ====================================================
// FEATURE COMPARISON
// ====================================================

function FeatureComparison({
  first,
  second,
}: {
  first: HousingItem;
  second: HousingItem;
}) {
  const allFeatures =
    Array.from(
      new Set([
        ...first.officialFeatures,
        ...second.officialFeatures,
      ])
    );

  if (
    allFeatures.length === 0
  ) {
    return (
      <div className="p-6 text-sm text-slate-500">
        No amenity information available.
      </div>
    );
  }

  return (
    <>
      {allFeatures.map(
        (feature) => {
          const firstHas =
            first.officialFeatures.includes(
              feature
            );

          const secondHas =
            second.officialFeatures.includes(
              feature
            );

          return (
            <ComparisonRow
              key={feature}
              label={feature}
              first={
                <FeatureStatus
                  value={
                    firstHas
                  }
                  unique={
                    firstHas &&
                    !secondHas
                  }
                />
              }
              second={
                <FeatureStatus
                  value={
                    secondHas
                  }
                  unique={
                    secondHas &&
                    !firstHas
                  }
                />
              }
            />
          );
        }
      )}
    </>
  );
}

// ====================================================
// FEATURE STATUS
// ====================================================

function FeatureStatus({
  value,
  unique,
}: {
  value: boolean;
  unique: boolean;
}) {
  if (!value) {
    return (
      <span
        aria-label="Not listed"
        className="text-lg font-bold text-slate-300"
      >
        —
      </span>
    );
  }

  return (
    <div>

      <span
        aria-label="Available"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700"
      >
        ✓
      </span>

      {unique && (
        <DifferenceBadge
          text="Only here"
        />
      )}

    </div>
  );
}

// ====================================================
// DIFFERENCE SUMMARY
// ====================================================

function DifferenceSummary({
  property,
  other,
  right = false,
}: {
  property: HousingItem;
  other: HousingItem;
  right?: boolean;
}) {
  const differences:
    string[] = [];

  const propertyPrice =
    getPriceNumber(
      property.priceLevel
    );

  const otherPrice =
    getPriceNumber(
      other.priceLevel
    );

  if (
    propertyPrice > 0 &&
    otherPrice > 0 &&
    propertyPrice <
      otherPrice
  ) {
    differences.push(
      "Lower general price level"
    );
  }

  if (
    property.reviewCount > 0 &&
    other.reviewCount > 0 &&
    property.rating >
      other.rating
  ) {
    differences.push(
      `${(
        property.rating -
        other.rating
      ).toFixed(
        1
      )} higher overall rating`
    );
  }

  if (
    property.studentFocused &&
    !other.studentFocused
  ) {
    differences.push(
      "Student-focused housing"
    );
  }

  const uniqueFeatures =
    property.officialFeatures.filter(
      (feature) =>
        !other.officialFeatures.includes(
          feature
        )
    );

  uniqueFeatures
    .slice(0, 3)
    .forEach(
      (feature) => {
        differences.push(
          `Offers ${feature}`
        );
      }
    );

  return (
    <div
      className={`p-5 md:p-6 ${
        right
          ? "border-l border-slate-200"
          : "border-l border-slate-200"
      }`}
    >

      <p className="font-extrabold text-slate-950">
        {property.name}
      </p>

      {differences.length >
      0 ? (
        <ul className="mt-4 space-y-3">

          {differences.map(
            (
              difference,
              index
            ) => (
              <li
                key={`${difference}-${index}`}
                className="flex gap-2 text-sm leading-6 text-slate-600"
              >

                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                  ✓
                </span>

                <span>
                  {difference}
                </span>

              </li>
            )
          )}

        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">
          No major differences identified
          from the currently available data.
        </p>
      )}

    </div>
  );
}

// ====================================================
// DIFFERENCE BADGE
// ====================================================

function DifferenceBadge({
  text,
}: DifferenceBadgeProps) {
  return (
    <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
      {text}
    </span>
  );
}