export type BuildingRow = {
  id: string;
  slug?: string | null;
  name: string | null;
  category: string | null;
  source: string | null;
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
  type?: string | null;
  location?: string | null;
};

export type HousingItem = {
  id: string;
  name: string;
  category: "apartment" | "residence-hall";
  source: "UTA" | "Off Campus" | string;
  address: string;
  shortLocation: string;
  description: string;
  image: string;
  priceLevel: "$" | "$$" | "$$$" | string;
  officialFeatures: string[];
  tags: string[];
  officialUrl: string;
  rating: number;
  reviewCount: number;
  distanceFromUTA: string;
};

export function mapBuildingRow(row: BuildingRow): HousingItem {
  const safeCategory: "apartment" | "residence-hall" =
    row.category === "apartment" || row.category === "residence-hall"
      ? row.category
      : row.type?.toLowerCase().includes("apartment")
      ? "apartment"
      : "residence-hall";

  const safeSource =
    row.source === "UTA" || row.source === "Off Campus"
      ? row.source
      : "Off Campus";

  const safePrice =
    row.price_level === "$" ||
    row.price_level === "$$" ||
    row.price_level === "$$$"
      ? row.price_level
      : "$$";

  return {
    id: row.slug ?? row.id,
    name: row.name ?? "Unknown Housing",
    category: safeCategory,
    source: safeSource,
    address: row.address ?? "UTA area",
    shortLocation: row.short_location ?? row.location ?? "Near UTA",
    description: row.description ?? "No description available.",
    image: row.image ?? "",
    priceLevel: safePrice,
    officialFeatures: row.official_features ?? [],
    tags: row.tags ?? [],
    officialUrl: row.official_url ?? "",
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    distanceFromUTA: row.distance_from_uta ?? "Not listed",
  };
}