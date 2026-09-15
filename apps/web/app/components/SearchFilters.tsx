"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CampusType,
  HousingItem,
  HousingType,
} from "@/app/lib/mapBuilding";

// ====================================================
// TYPES
// ====================================================

type SearchFiltersProps = {
  showHeader?: boolean;

  onFilteredChange?: (
    items: HousingItem[]
  ) => void;
};

// ====================================================
// CAMPUS TYPE
// ====================================================

function getCampusType(
  item: Record<string, unknown>
): CampusType {
  const value =
    String(
      item.campusType ??
        item.campus_type ??
        ""
    )
      .trim()
      .toLowerCase();

  if (
    value === "on-campus"
  ) {
    return "on-campus";
  }

  if (
    value === "off-campus"
  ) {
    return "off-campus";
  }

  const source =
    String(
      item.source ?? ""
    )
      .trim()
      .toLowerCase();

  if (source === "uta") {
    return "on-campus";
  }

  return "off-campus";
}

// ====================================================
// HOUSING TYPE
// ====================================================

function getHousingType(
  item: Record<string, unknown>,
  campusType: CampusType
): HousingType {
  const value =
    String(
      item.housingType ??
        item.housing_type ??
        item.type ??
        ""
    )
      .trim()
      .toLowerCase();

  if (
    value === "residence-hall"
  ) {
    return "residence-hall";
  }

  if (
    value === "uta-apartment"
  ) {
    return "uta-apartment";
  }

  if (
    value ===
    "private-student-apartment"
  ) {
    return "private-student-apartment";
  }

  if (
    value === "student-apartment"
  ) {
    return "student-apartment";
  }

  if (
    value === "apartment"
  ) {
    return "apartment";
  }

  const category =
    String(
      item.category ?? ""
    )
      .trim()
      .toLowerCase();

  if (
    category === "residence-hall"
  ) {
    return "residence-hall";
  }

  if (
    campusType === "on-campus"
  ) {
    return "uta-apartment";
  }

  return "apartment";
}

// ====================================================
// NUMBER HELPER
// ====================================================

function toNullableNumber(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

// ====================================================
// NORMALIZE HOUSING ITEM
// ====================================================

function normalizeHousingItem(
  item: Record<string, unknown>
): HousingItem {
  const campusType =
    getCampusType(item);

  const housingType =
    getHousingType(
      item,
      campusType
    );

  const category:
    | "apartment"
    | "residence-hall" =
    housingType ===
    "residence-hall"
      ? "residence-hall"
      : "apartment";

  const studentFocusedValue =
    item.studentFocused ??
    item.student_focused;

  const studentFocused =
    typeof studentFocusedValue ===
    "boolean"
      ? studentFocusedValue
      : housingType ===
          "residence-hall" ||
        housingType ===
          "uta-apartment" ||
        housingType ===
          "private-student-apartment" ||
        housingType ===
          "student-apartment";

  return {
    id: String(
      item.slug ??
        item.id ??
        ""
    ),

    name: String(
      item.name ??
        "Unknown Housing"
    ),

    category,

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

    studentFocused,

    address: String(
      item.address ??
        "UTA area"
    ),

    shortLocation: String(
      item.shortLocation ??
        item.short_location ??
        item.location ??
        (campusType ===
        "on-campus"
          ? "On campus"
          : "Near UTA")
    ),

    description: String(
      item.description ??
        "No description available."
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
        ? (
            item.officialFeatures as string[]
          )
        : Array.isArray(
            item.official_features
          )
        ? (
            item.official_features as string[]
          )
        : [],

    tags:
      Array.isArray(
        item.tags
      )
        ? (
            item.tags as string[]
          )
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

    distanceFromUTA:
      String(
        item.distanceFromUTA ??
          item.distance_from_uta ??
          "Not listed"
      ),

    latitude:
      toNullableNumber(
        item.latitude
      ),

    longitude:
      toNullableNumber(
        item.longitude
      ),
  };
}

// ====================================================
// COMPONENT
// ====================================================

export default function SearchFilters({
  showHeader = true,
  onFilteredChange,
}: SearchFiltersProps) {
  const [
    allHousing,
    setAllHousing,
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
    searchTerm,
    setSearchTerm,
  ] =
    useState("");

  const [
    selectedType,
    setSelectedType,
  ] =
    useState("");

  const [
    selectedPrice,
    setSelectedPrice,
  ] =
    useState("");

  // ==================================================
  // LOAD HOUSING
  // ==================================================

  useEffect(() => {
    async function loadHousing() {
      try {
        const response =
          await fetch(
            "/api/browse-housing",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load housing"
          );
        }

        const data =
          (await response.json()) as Record<
            string,
            unknown
          >[];

        setAllHousing(
          data.map(
            normalizeHousingItem
          )
        );

      } catch (error) {
        console.error(
          "SearchFilters error:",
          error
        );

        setAllHousing(
          []
        );

      } finally {
        setLoading(
          false
        );
      }
    }

    loadHousing();
  }, []);

  // ==================================================
  // FILTER
  // ==================================================

  const filteredHousing =
    useMemo(() => {
      return allHousing.filter(
        (item) => {
          const query =
            searchTerm
              .trim()
              .toLowerCase();

          const matchesSearchTerm =
            query === "" ||
            item.name
              .toLowerCase()
              .includes(
                query
              ) ||
            item.address
              .toLowerCase()
              .includes(
                query
              ) ||
            item.shortLocation
              .toLowerCase()
              .includes(
                query
              ) ||
            item.tags.some(
              (tag) =>
                tag
                  .toLowerCase()
                  .includes(
                    query
                  )
            );

          const matchesType =
            selectedType === "" ||
            item.category ===
              selectedType;

          const matchesPrice =
            selectedPrice === "" ||
            item.priceLevel ===
              selectedPrice;

          return (
            matchesSearchTerm &&
            matchesType &&
            matchesPrice
          );
        }
      );
    }, [
      allHousing,
      searchTerm,
      selectedType,
      selectedPrice,
    ]);

  // ==================================================
  // SEND FILTERED RESULTS TO PARENT
  // ==================================================

  useEffect(() => {
    onFilteredChange?.(
      filteredHousing
    );
  }, [
    filteredHousing,
    onFilteredChange,
  ]);

  // ==================================================
  // CLEAR FILTERS
  // ==================================================

  function clearFilters() {
    setSearchTerm("");
    setSelectedType("");
    setSelectedPrice("");
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <section className="w-full rounded-3xl bg-white px-6 py-10 shadow-sm md:px-8">

      {/* HEADER */}

      {showHeader && (
        <div className="mb-10 text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Search Housing
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-900 md:text-4xl">
            Find Housing That Fits Your Needs
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Search UTA and near-UTA housing by
            name, type, and price.
          </p>

        </div>
      )}

      {/* FILTER CONTROLS */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search housing..."
          value={
            searchTerm
          }
          onChange={(
            event
          ) =>
            setSearchTerm(
              event.target.value
            )
          }
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 xl:col-span-2"
        />

        {/* TYPE */}

        <select
          value={
            selectedType
          }
          onChange={(
            event
          ) =>
            setSelectedType(
              event.target.value
            )
          }
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">
            All Types
          </option>

          <option value="apartment">
            Apartments
          </option>

          <option value="residence-hall">
            Residence Halls
          </option>
        </select>

        {/* PRICE */}

        <select
          value={
            selectedPrice
          }
          onChange={(
            event
          ) =>
            setSelectedPrice(
              event.target.value
            )
          }
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">
            All Prices
          </option>

          <option value="$">
            $ Budget
          </option>

          <option value="$$">
            $$ Moderate
          </option>

          <option value="$$$">
            $$$ Premium
          </option>
        </select>

      </div>

      {/* RESULTS / CLEAR */}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm text-slate-500">

          {loading
            ? "Loading housing options..."
            : `${
                filteredHousing.length
              } housing option${
                filteredHousing.length !==
                1
                  ? "s"
                  : ""
              } found`}

        </p>

        <button
          type="button"
          onClick={
            clearFilters
          }
          disabled={
            loading
          }
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-blue-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear Filters
        </button>

      </div>

    </section>
  );
}