export type CampusType =
  | "on-campus"
  | "off-campus";

export type HousingType =
  | "residence-hall"
  | "uta-apartment"
  | "private-student-apartment"
  | "student-apartment"
  | "apartment";

// =====================================================
// DATABASE ROW
// =====================================================

export type BuildingRow = {
  id: string;
  slug?: string | null;

  name: string | null;

  category: string | null;
  source: string | null;

  campus_type?: string | null;
  housing_type?: string | null;

  ownership?: string | null;
  student_focused?: boolean | null;

  address: string | null;
  short_location: string | null;

  description: string | null;
  image: string | null;

  price_level: string | null;

  official_features: string[] | null;
  tags: string[] | null;

  official_url: string | null;

  rating: number | null;
  review_count: number | null;

  distance_from_uta: string | null;

  latitude?: number | null;
  longitude?: number | null;

  // Older database fields kept for compatibility
  type?: string | null;
  location?: string | null;
};

// =====================================================
// FRONTEND HOUSING MODEL
//
// IMPORTANT:
//
// HousingItem.id is the frontend housing slug.
//
// Example:
// id = "the-arlie"
//
// Used by:
// /housing/the-arlie
// /map?housing=the-arlie
// /write-review?id=the-arlie
// =====================================================

export type HousingItem = {
  id: string;

  name: string;

  // General classification.
  // Existing components still use this.
  category:
    | "apartment"
    | "residence-hall";

  source: string;

  // Detailed housing classification
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

// =====================================================
// CAMPUS TYPE
// =====================================================

function getCampusType(
  row: BuildingRow
): CampusType {
  if (
    row.campus_type ===
    "on-campus"
  ) {
    return "on-campus";
  }

  if (
    row.campus_type ===
    "off-campus"
  ) {
    return "off-campus";
  }

  // ===================================================
  // BACKWARD COMPATIBILITY
  // ===================================================

  if (
    row.source === "UTA"
  ) {
    return "on-campus";
  }

  return "off-campus";
}

// =====================================================
// HOUSING TYPE
// =====================================================

function getHousingType(
  row: BuildingRow
): HousingType {
  const value =
    row.housing_type
      ?.trim()
      .toLowerCase();

  switch (value) {
    case "residence-hall":
      return "residence-hall";

    case "uta-apartment":
      return "uta-apartment";

    case "private-student-apartment":
      return "private-student-apartment";

    case "student-apartment":
      return "student-apartment";

    case "apartment":
      return "apartment";
  }

  // ===================================================
  // BACKWARD COMPATIBILITY
  // ===================================================

  if (
    row.category ===
    "residence-hall"
  ) {
    return "residence-hall";
  }

  if (
    row.source === "UTA"
  ) {
    return "uta-apartment";
  }

  return "apartment";
}

// =====================================================
// MAP DATABASE ROW → FRONTEND HOUSING ITEM
// =====================================================

export function mapBuildingRow(
  row: BuildingRow
): HousingItem {
  const campusType =
    getCampusType(row);

  const housingType =
    getHousingType(row);

  // ===================================================
  // FRONTEND ID
  //
  // Prefer the readable database slug.
  //
  // Example:
  // database slug = "the-arlie"
  //
  // frontend id = "the-arlie"
  // ===================================================

  const frontendId =
    row.slug?.trim() ||
    String(row.id);

  // ===================================================
  // GENERAL CATEGORY
  // ===================================================

  const category:
    | "apartment"
    | "residence-hall" =
    housingType ===
    "residence-hall"
      ? "residence-hall"
      : "apartment";

  // ===================================================
  // PRICE LEVEL
  // ===================================================

  const safePrice =
    row.price_level === "$" ||
    row.price_level === "$$" ||
    row.price_level === "$$$"
      ? row.price_level
      : "$$";

  // ===================================================
  // STUDENT FOCUSED
  // ===================================================

  const studentFocused =
    row.student_focused ??
    (
      housingType ===
        "residence-hall" ||
      housingType ===
        "uta-apartment" ||
      housingType ===
        "private-student-apartment" ||
      housingType ===
        "student-apartment"
    );

  // ===================================================
  // LATITUDE
  // ===================================================

  const latitude =
    row.latitude != null &&
    Number.isFinite(
      Number(
        row.latitude
      )
    )
      ? Number(
          row.latitude
        )
      : null;

  // ===================================================
  // LONGITUDE
  // ===================================================

  const longitude =
    row.longitude != null &&
    Number.isFinite(
      Number(
        row.longitude
      )
    )
      ? Number(
          row.longitude
        )
      : null;

  // ===================================================
  // RETURN FRONTEND OBJECT
  // ===================================================

  return {
    id:
      frontendId,

    name:
      row.name ??
      "Unknown Housing",

    category,

    source:
      row.source ??
      (
        campusType ===
        "on-campus"
          ? "UTA"
          : "Off Campus"
      ),

    campusType,

    housingType,

    ownership:
      row.ownership ??
      (
        campusType ===
        "on-campus"
          ? "UTA"
          : "Private"
      ),

    studentFocused,

    address:
      row.address ??
      "UTA area",

    shortLocation:
      row.short_location ??
      row.location ??
      (
        campusType ===
        "on-campus"
          ? "On campus"
          : "Near UTA"
      ),

    description:
      row.description ??
      "No description available.",

    image:
      row.image ??
      "/UTA-Logo.png",

    priceLevel:
      safePrice,

    officialFeatures:
      Array.isArray(
        row.official_features
      )
        ? row.official_features
        : [],

    tags:
      Array.isArray(
        row.tags
      )
        ? row.tags
        : [],

    officialUrl:
      row.official_url ??
      "",

    // =================================================
    // REVIEW VALUES
    //
    // These database values are fallbacks.
    //
    // /api/browse-housing and the housing detail page
    // can overwrite them with live ratingauth values.
    // =================================================

    rating:
      Number(
        row.rating ??
        0
      ),

    reviewCount:
      Number(
        row.review_count ??
        0
      ),

    distanceFromUTA:
      row.distance_from_uta ??
      "Not listed",

    latitude,

    longitude,
  };
}