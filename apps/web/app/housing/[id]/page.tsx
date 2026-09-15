import {
  notFound,
} from "next/navigation";

import HousingProfileClient from "@/app/components/HousingProfileClient";

import {
  supabase,
} from "@/app/lib/supabaseClient";

import {
  mapBuildingRow,
  type BuildingRow,
} from "@/app/lib/mapBuilding";

export const dynamic =
  "force-dynamic";

export default async function HousingProfilePage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    id,
  } =
    await params;

  // =====================================================
  // GET BUILDING
  // =====================================================

  const {
    data: buildingData,
    error: buildingError,
  } =
    await supabase
      .from("buildings")
      .select("*")
      .eq("slug", id)
      .maybeSingle();

  if (
    buildingError ||
    !buildingData
  ) {
    console.error(
      "Housing detail error:",
      buildingError
    );

    notFound();
  }

  // =====================================================
  // GET OVERALL REVIEWS
  //
  // ratingauth is the source of truth for:
  // - overall rating
  // - review count
  //
  // This matches Browse Housing, Home, Top Rated, and Map.
  // =====================================================

  const {
    data: reviewData,
    error: reviewError,
  } =
    await supabase
      .from("ratingauth")
      .select("score")
      .eq(
        "listing_id",
        id
      );

  if (reviewError) {
    console.error(
      "Housing rating error:",
      reviewError
    );
  }

  const reviews =
    reviewData ?? [];

  // =====================================================
  // REVIEW COUNT
  // =====================================================

  const reviewCount =
    reviews.length;

  // =====================================================
  // AVERAGE RATING
  // =====================================================

  const validScores =
    reviews
      .map(
        (review) =>
          Number(
            review.score
          )
      )
      .filter(
        (score) =>
          Number.isFinite(
            score
          )
      );

  const averageRating =
    validScores.length > 0
      ? validScores.reduce(
          (
            total,
            score
          ) =>
            total +
            score,
          0
        ) /
        validScores.length
      : 0;

  // =====================================================
  // MAP DATABASE ROW TO HOUSING ITEM
  // =====================================================

  const apartment = {
    ...mapBuildingRow(
      buildingData as BuildingRow
    ),

    rating:
      Math.round(
        averageRating *
          10
      ) / 10,

    reviewCount,
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <HousingProfileClient
      apartment={
        apartment
      }
    />
  );
}