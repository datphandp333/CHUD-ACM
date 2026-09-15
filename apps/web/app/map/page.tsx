"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import HousingMap from "@/app/components/HousingMap";

type CampusType =
  | "on-campus"
  | "off-campus";

type HousingType =
  | "residence-hall"
  | "uta-apartment"
  | "private-student-apartment"
  | "student-apartment"
  | "apartment";

type CampusFilter =
  | "all"
  | CampusType;

type HousingTypeFilter =
  | "all"
  | HousingType;

type Building = {
  id: string;
  slug: string;
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

type UserLocation = {
  latitude: number;
  longitude: number;
};

function normalizeBuilding(
  item: Record<string, unknown>
): Building {
  const rawCampusType =
    String(
      item.campusType ??
        item.campus_type ??
        ""
    );

  const campusType: CampusType =
    rawCampusType === "on-campus"
      ? "on-campus"
      : "off-campus";

  const rawHousingType =
    String(
      item.housingType ??
        item.housing_type ??
        ""
    );

  let housingType: HousingType;

  switch (rawHousingType) {
    case "residence-hall":
      housingType =
        "residence-hall";
      break;

    case "uta-apartment":
      housingType =
        "uta-apartment";
      break;

    case "private-student-apartment":
      housingType =
        "private-student-apartment";
      break;

    case "student-apartment":
      housingType =
        "student-apartment";
      break;

    case "apartment":
      housingType =
        "apartment";
      break;

    default: {
      const category =
        String(
          item.category ??
            ""
        ).toLowerCase();

      housingType =
        category.includes(
          "residence"
        )
          ? "residence-hall"
          : "apartment";
    }
  }

  const id =
    String(
      item.id ??
        item.slug ??
        ""
    );

  const slug =
    String(
      item.slug ??
        item.id ??
        ""
    );

  return {
    id,
    slug,

    name:
      String(
        item.name ??
          "Unknown Housing"
      ),

    category:
      housingType ===
      "residence-hall"
        ? "residence-hall"
        : "apartment",

    source:
      String(
        item.source ??
          (campusType ===
          "on-campus"
            ? "UTA"
            : "Off Campus")
      ),

    campusType,
    housingType,

    ownership:
      String(
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

    address:
      String(
        item.address ??
          ""
      ),

    shortLocation:
      String(
        item.shortLocation ??
          item.short_location ??
          item.location ??
          "Near UTA"
      ),

    description:
      String(
        item.description ??
          ""
      ),

    image:
      String(
        item.image ??
          ""
      ),

    priceLevel:
      String(
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

    tags:
      Array.isArray(
        item.tags
      )
        ? (item.tags as string[])
        : [],

    officialUrl:
      String(
        item.officialUrl ??
          item.official_url ??
          ""
      ),

    rating:
      Number(
        item.rating ??
          0
      ),

    reviewCount:
      Number(
        item.reviewCount ??
          item.review_count ??
          0
      ),

    distanceFromUTA:
      String(
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
  building: Building
) {
  if (!building.image) {
    return "/UTA-Logo.png";
  }

  return building.image.startsWith(
    "/"
  )
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

export default function MapPage() {
  const searchParams =
    useSearchParams();

  const initialHousing =
    searchParams.get(
      "housing"
    ) ?? "";

  const [
    buildings,
    setBuildings,
  ] =
    useState<Building[]>(
      []
    );

  const [
    selectedSlug,
    setSelectedSlug,
  ] =
    useState(
      initialHousing
    );

  const [
    userLocation,
    setUserLocation,
  ] =
    useState<UserLocation | null>(
      null
    );

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
    search,
    setSearch,
  ] =
    useState("");

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

  // =====================================================
  // LOAD HOUSING
  // =====================================================

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
              "Failed to load housing."
          );
        }

        const normalized =
          Array.isArray(result)
            ? result.map(
                normalizeBuilding
              )
            : [];

        setBuildings(
          normalized
        );

        if (
          normalized.length >
          0
        ) {
          const requestedBuilding =
            initialHousing
              ? normalized.find(
                  (building) =>
                    building.slug ===
                      initialHousing ||
                    building.id ===
                      initialHousing
                )
              : null;

          setSelectedSlug(
            requestedBuilding?.slug ??
              normalized[0].slug
          );
        }
      } catch (error) {
        console.error(
          "Map housing load error:",
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
  }, [initialHousing]);

  // =====================================================
  // COUNTS
  // =====================================================

  const counts =
    useMemo(() => {
      return {
        all:
          buildings.length,

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

        residenceHalls:
          buildings.filter(
            (building) =>
              building.housingType ===
              "residence-hall"
          ).length,

        utaApartments:
          buildings.filter(
            (building) =>
              building.housingType ===
              "uta-apartment"
          ).length,

        privateStudent:
          buildings.filter(
            (building) =>
              building.housingType ===
              "private-student-apartment"
          ).length,

        studentApartments:
          buildings.filter(
            (building) =>
              building.housingType ===
              "student-apartment"
          ).length,

        apartments:
          buildings.filter(
            (building) =>
              building.housingType ===
              "apartment"
          ).length,
      };
    }, [buildings]);

  // =====================================================
  // FILTER HOUSING
  // =====================================================

  const filteredBuildings =
    useMemo(() => {
      let result = [
        ...buildings,
      ];

      if (
        campusFilter !==
        "all"
      ) {
        result =
          result.filter(
            (building) =>
              building.campusType ===
              campusFilter
          );
      }

      if (
        housingTypeFilter !==
        "all"
      ) {
        result =
          result.filter(
            (building) =>
              building.housingType ===
              housingTypeFilter
          );
      }

      const query =
        search
          .trim()
          .toLowerCase();

      if (query) {
        result =
          result.filter(
            (building) =>
              [
                building.name,
                building.address,
                building.shortLocation,
                building.description,
                building.source,
                building.housingType,
                building.campusType,
                ...building.tags,
              ]
                .join(" ")
                .toLowerCase()
                .includes(
                  query
                )
          );
      }

      return result;
    }, [
      buildings,
      campusFilter,
      housingTypeFilter,
      search,
    ]);

  // =====================================================
  // ONLY PROPERTIES WITH COORDINATES GO TO MAPBOX
  // =====================================================

  const mapBuildings =
    useMemo(
      () =>
        filteredBuildings
          .filter(
            (building) =>
              building.latitude !=
                null &&
              building.longitude !=
                null &&
              Number.isFinite(
                building.latitude
              ) &&
              Number.isFinite(
                building.longitude
              )
          )
          .map(
            (building) => ({
              id:
                building.id,

              slug:
                building.slug,

              name:
                building.name,

              address:
                building.address,

              latitude:
                building.latitude as number,

              longitude:
                building.longitude as number,

              category:
                building.category,
            })
          ),
      [filteredBuildings]
    );

  const totalMapped =
    useMemo(
      () =>
        buildings.filter(
          (building) =>
            building.latitude !=
              null &&
            building.longitude !=
              null &&
            Number.isFinite(
              building.latitude
            ) &&
            Number.isFinite(
              building.longitude
            )
        ).length,
      [buildings]
    );

  // =====================================================
  // SELECTED PROPERTY
  // =====================================================

  const selectedBuilding =
    useMemo(
      () =>
        buildings.find(
          (building) =>
            building.slug ===
            selectedSlug
        ) ?? null,
      [
        buildings,
        selectedSlug,
      ]
    );

  // =====================================================
  // GOOGLE MAPS DIRECTIONS
  // =====================================================

  const googleDirectionsUrl =
    useMemo(() => {
      if (
        !selectedBuilding
      ) {
        return "";
      }

      const destination =
        selectedBuilding.latitude !=
          null &&
        selectedBuilding.longitude !=
          null
          ? `${selectedBuilding.latitude},${selectedBuilding.longitude}`
          : selectedBuilding.address;

      if (!destination) {
        return "";
      }

      const origin =
        userLocation
          ? `${userLocation.latitude},${userLocation.longitude}`
          : "";

      const params =
        new URLSearchParams({
          api: "1",
          destination,
        });

      if (origin) {
        params.set(
          "origin",
          origin
        );
      }

      return `https://www.google.com/maps/dir/?${params.toString()}`;
    }, [
      selectedBuilding,
      userLocation,
    ]);

  // =====================================================
  // FILTER HANDLERS
  // =====================================================

  function selectCampus(
    value: CampusFilter
  ) {
    setCampusFilter(
      value
    );

    setHousingTypeFilter(
      "all"
    );

    const first =
      value === "all"
        ? buildings[0]
        : buildings.find(
            (building) =>
              building.campusType ===
              value
          );

    if (first) {
      setSelectedSlug(
        first.slug
      );
    }
  }

  function selectHousingType(
    value: HousingTypeFilter
  ) {
    setHousingTypeFilter(
      value
    );

    if (value === "all") {
      const first =
        campusFilter ===
        "all"
          ? buildings[0]
          : buildings.find(
              (building) =>
                building.campusType ===
                campusFilter
            );

      if (first) {
        setSelectedSlug(
          first.slug
        );
      }

      return;
    }

    const first =
      buildings.find(
        (building) =>
          building.housingType ===
            value &&
          (campusFilter ===
            "all" ||
            building.campusType ===
              campusFilter)
      );

    if (first) {
      setSelectedSlug(
        first.slug
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24">

      {/* ============================================
          HEADER
      ============================================ */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Explore Housing
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            UTA Housing Map
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Explore on-campus and
            off-campus housing around UT
            Arlington. Select a property
            to view its location, compare
            housing information, and get
            directions with Google Maps.
          </p>

          {!loading &&
            !error && (
              <div className="mt-7 flex flex-wrap gap-3">

                <StatPill
                  value={
                    counts.all
                  }
                  label="Properties"
                />

                <StatPill
                  value={
                    counts.onCampus
                  }
                  label="On Campus"
                />

                <StatPill
                  value={
                    counts.offCampus
                  }
                  label="Off Campus"
                />

                <StatPill
                  value={
                    totalMapped
                  }
                  label="Mapped"
                />

              </div>
            )}

        </div>

      </section>

      {/* ============================================
          FILTERS
      ============================================ */}

      {!loading &&
        !error && (
          <section className="border-b border-slate-200 bg-white">

            <div className="mx-auto max-w-[1500px] px-5 py-5 lg:px-8">

              <div className="flex gap-3 overflow-x-auto pb-1">

                <FilterButton
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

                <FilterButton
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

                <FilterButton
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

              {/* ON CAMPUS SUBFILTERS */}

              {campusFilter ===
                "on-campus" && (
                <div className="mt-4 flex gap-2 overflow-x-auto border-t border-slate-100 pt-4">

                  <SubFilterButton
                    active={
                      housingTypeFilter ===
                      "all"
                    }
                    onClick={() =>
                      selectHousingType(
                        "all"
                      )
                    }
                    label={`All On Campus ${counts.onCampus}`}
                  />

                  <SubFilterButton
                    active={
                      housingTypeFilter ===
                      "residence-hall"
                    }
                    onClick={() =>
                      selectHousingType(
                        "residence-hall"
                      )
                    }
                    label={`Residence Halls ${counts.residenceHalls}`}
                  />

                  <SubFilterButton
                    active={
                      housingTypeFilter ===
                      "uta-apartment"
                    }
                    onClick={() =>
                      selectHousingType(
                        "uta-apartment"
                      )
                    }
                    label={`UTA Apartments ${counts.utaApartments}`}
                  />

                  <SubFilterButton
                    active={
                      housingTypeFilter ===
                      "private-student-apartment"
                    }
                    onClick={() =>
                      selectHousingType(
                        "private-student-apartment"
                      )
                    }
                    label={`Private Student ${counts.privateStudent}`}
                  />

                </div>
              )}

              {/* OFF CAMPUS SUBFILTERS */}

              {campusFilter ===
                "off-campus" && (
                <div className="mt-4 flex gap-2 overflow-x-auto border-t border-slate-100 pt-4">

                  <SubFilterButton
                    active={
                      housingTypeFilter ===
                      "all"
                    }
                    onClick={() =>
                      selectHousingType(
                        "all"
                      )
                    }
                    label={`All Off Campus ${counts.offCampus}`}
                  />

                  <SubFilterButton
                    active={
                      housingTypeFilter ===
                      "student-apartment"
                    }
                    onClick={() =>
                      selectHousingType(
                        "student-apartment"
                      )
                    }
                    label={`🎓 Student Apartments ${counts.studentApartments}`}
                  />

                  <SubFilterButton
                    active={
                      housingTypeFilter ===
                      "apartment"
                    }
                    onClick={() =>
                      selectHousingType(
                        "apartment"
                      )
                    }
                    label={`🏢 Apartments ${counts.apartments}`}
                  />

                </div>
              )}

            </div>

          </section>
        )}

      {/* ============================================
          MAIN CONTENT
      ============================================ */}

      <section className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <p className="font-medium text-slate-600">
              Loading housing map...
            </p>

          </div>
        )}

        {!loading &&
          error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
              {error}
            </div>
          )}

        {!loading &&
          !error && (
            <div className="grid gap-6 xl:grid-cols-[400px_1fr]">

              {/* ==================================
                  SIDEBAR
              ================================== */}

              <aside className="order-2 xl:order-1">

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                  <div className="border-b border-slate-100 p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h2 className="text-xl font-extrabold text-slate-950">
                          Housing Locations
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Select a property to
                          focus the map.
                        </p>

                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {
                          filteredBuildings.length
                        }{" "}
                        shown
                      </span>

                    </div>

                    {/* SEARCH */}

                    <div className="relative mt-5">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        ⌕
                      </span>

                      <input
                        type="search"
                        value={
                          search
                        }
                        onChange={(
                          event
                        ) =>
                          setSearch(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Search housing..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                      />

                    </div>

                    <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3">

                      <p className="text-sm font-semibold text-blue-800">
                        {
                          filteredBuildings.length
                        }{" "}
                        housing options
                      </p>

                      <p className="mt-1 text-xs text-blue-600">
                        {
                          mapBuildings.length
                        }{" "}
                        currently mapped
                      </p>

                    </div>

                  </div>

                  {/* PROPERTY LIST */}

                  <div className="max-h-[680px] space-y-2 overflow-y-auto p-3">

                    {filteredBuildings.length ===
                    0 ? (
                      <div className="px-4 py-12 text-center">

                        <p className="font-bold text-slate-900">
                          No housing found
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          Try changing your
                          search or filters.
                        </p>

                      </div>
                    ) : (
                      filteredBuildings.map(
                        (
                          building
                        ) => {
                          const selected =
                            building.slug ===
                            selectedSlug;

                          const hasLocation =
                            building.latitude !=
                              null &&
                            building.longitude !=
                              null &&
                            Number.isFinite(
                              building.latitude
                            ) &&
                            Number.isFinite(
                              building.longitude
                            );

                          return (
                            <button
                              key={`${building.slug}-${building.id}`}
                              type="button"
                              onClick={() =>
                                setSelectedSlug(
                                  building.slug
                                )
                              }
                              className={`w-full rounded-2xl border p-4 text-left transition ${
                                selected
                                  ? "border-blue-400 bg-blue-50 shadow-sm"
                                  : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                              }`}
                            >

                              <div className="flex gap-4">

                                {/* IMAGE */}

                                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                                  <Image
                                    src={resolveImageSrc(
                                      building
                                    )}
                                    alt={
                                      building.name
                                    }
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                  />

                                </div>

                                <div className="min-w-0 flex-1">

                                  <div className="flex items-start justify-between gap-2">

                                    <p className="truncate font-bold text-slate-950">
                                      {
                                        building.name
                                      }
                                    </p>

                                    {selected && (
                                      <span className="shrink-0 text-blue-700">
                                        ●
                                      </span>
                                    )}

                                  </div>

                                  {/* LABELS */}

                                  <div className="mt-1 flex flex-wrap gap-1.5">

                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        building.campusType ===
                                        "on-campus"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {building.campusType ===
                                      "on-campus"
                                        ? "On Campus"
                                        : "Off Campus"}
                                    </span>

                                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                                      {housingTypeLabel(
                                        building.housingType
                                      )}
                                    </span>

                                  </div>

                                  <p className="mt-2 truncate text-sm text-slate-500">
                                    {
                                      building.shortLocation
                                    }
                                  </p>

                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">

                                    {building.reviewCount >
                                    0 ? (
                                      <span className="font-bold text-amber-500">
                                        ★{" "}
                                        {building.rating.toFixed(
                                          1
                                        )}{" "}
                                        <span className="font-normal text-slate-400">
                                          (
                                          {
                                            building.reviewCount
                                          }
                                          )
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">
                                        No reviews
                                      </span>
                                    )}

                                    <span className="text-slate-400">
                                      {
                                        building.distanceFromUTA
                                      }
                                    </span>

                                  </div>

                                  {!hasLocation && (
                                    <p className="mt-2 text-xs font-semibold text-orange-600">
                                      Map location
                                      not available
                                    </p>
                                  )}

                                </div>

                              </div>

                            </button>
                          );
                        }
                      )
                    )}

                  </div>

                </div>

              </aside>

              {/* ==================================
                  MAPBOX
              ================================== */}

              <div className="order-1 xl:order-2">

                <HousingMap
                  buildings={
                    mapBuildings
                  }
                  selectedSlug={
                    selectedSlug
                  }
                  onSelect={
                    setSelectedSlug
                  }
                  onUserLocationChange={
                    setUserLocation
                  }
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">

                  <p className="text-xs text-slate-500">
                    Showing{" "}
                    {
                      mapBuildings.length
                    }{" "}
                    mapped properties from
                    the current filters.
                  </p>

                  {userLocation ? (
                    <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                      ● Your location is
                      available
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Enable location for
                      directions from your
                      current position
                    </span>
                  )}

                </div>

              </div>

            </div>
          )}

        {/* ============================================
            SELECTED PROPERTY
        ============================================ */}

        {selectedBuilding &&
          !loading &&
          !error && (
            <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="grid gap-6 p-6 lg:grid-cols-[190px_1fr_auto] lg:items-center">

                {/* PROPERTY IMAGE */}

                <div className="relative h-36 overflow-hidden rounded-2xl bg-slate-100">

                  <Image
                    src={resolveImageSrc(
                      selectedBuilding
                    )}
                    alt={
                      selectedBuilding.name
                    }
                    fill
                    className="object-cover"
                    sizes="190px"
                  />

                </div>

                {/* PROPERTY INFORMATION */}

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        selectedBuilding.campusType ===
                        "on-campus"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {selectedBuilding.campusType ===
                      "on-campus"
                        ? "On Campus"
                        : "Off Campus"}
                    </span>

                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                      {housingTypeLabel(
                        selectedBuilding.housingType
                      )}
                    </span>

                  </div>

                  <h2 className="mt-3 text-2xl font-extrabold text-slate-950">
                    {
                      selectedBuilding.name
                    }
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {
                      selectedBuilding.address
                    }
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">

                    {selectedBuilding.reviewCount >
                    0 ? (
                      <>
                        <span className="font-bold text-amber-500">
                          ★{" "}
                          {selectedBuilding.rating.toFixed(
                            1
                          )}
                        </span>

                        <span className="text-slate-500">
                          {
                            selectedBuilding.reviewCount
                          }{" "}
                          review
                          {selectedBuilding.reviewCount !==
                          1
                            ? "s"
                            : ""}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium text-slate-500">
                        No student reviews
                        yet
                      </span>
                    )}

                    <span className="font-semibold text-blue-700">
                      {
                        selectedBuilding.distanceFromUTA
                      }
                    </span>

                    <span className="font-bold text-slate-700">
                      {
                        selectedBuilding.priceLevel
                      }
                    </span>

                  </div>

                  {selectedBuilding.description && (
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                      {
                        selectedBuilding.description
                      }
                    </p>
                  )}

                  {selectedBuilding.latitude !=
                    null &&
                  selectedBuilding.longitude !=
                    null ? (
                    <p className="mt-3 text-xs font-semibold text-green-700">
                      ✓ Map location
                      available
                    </p>
                  ) : (
                    <p className="mt-3 text-xs font-semibold text-orange-600">
                      Map coordinates have
                      not been added for
                      this property yet.
                    </p>
                  )}

                </div>

                {/* ACTIONS */}

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">

                  <Link
                    href={`/housing/${selectedBuilding.slug}`}
                    className="rounded-xl bg-blue-700 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800"
                  >
                    View Details
                  </Link>

                  {googleDirectionsUrl && (
                    <a
                      href={
                        googleDirectionsUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-center text-sm font-bold text-green-700 transition hover:bg-green-100"
                    >
                      ↗ Get Directions
                    </a>
                  )}

                  <Link
                    href={`/write-review?id=${encodeURIComponent(
                      selectedBuilding.slug
                    )}`}
                    className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                  >
                    Write Review
                  </Link>

                </div>

              </div>

              {/* LOCATION STATUS */}

              {userLocation && (
                <div className="border-t border-green-100 bg-green-50 px-6 py-4">

                  <p className="text-sm font-medium text-green-700">
                    ✓ Your current
                    location is ready.
                    Get Directions will
                    use your location as
                    the starting point.
                  </p>

                </div>
              )}

            </section>
          )}

      </section>

    </main>
  );
}

// =====================================================
// FILTER BUTTON
// =====================================================

function FilterButton({
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

// =====================================================
// SUB FILTER BUTTON
// =====================================================

function SubFilterButton({
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

// =====================================================
// STAT PILL
// =====================================================

function StatPill({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">

      <span className="font-extrabold text-slate-950">
        {value}
      </span>

      <span className="ml-2 text-sm font-medium text-slate-500">
        {label}
      </span>

    </div>
  );
}