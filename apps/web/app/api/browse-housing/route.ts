import { NextResponse } from "next/server";

import { supabase } from "@/app/lib/supabaseClient";

import {
  mapBuildingRow,
  type BuildingRow,
  type HousingItem,
} from "@/app/lib/mapBuilding";

type ReviewRow = {
  housing_slug: string | null;
  overall: number | null;
};

type ReviewStats = {
  total: number;
  count: number;
};

export async function GET() {
  try {
    // =====================================================
    // 1. Load all housing
    // =====================================================

    const {
      data: buildingData,
      error: buildingError,
    } = await supabase
      .from("buildings")
      .select("*")
      .order("name", {
        ascending: true,
      });

    if (buildingError) {
      console.error(
        "Buildings error:",
        buildingError
      );

      return NextResponse.json(
        {
          error: buildingError.message,
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // 2. Load reviews
    //
    // IMPORTANT:
    // The housing detail page uses:
    //
    // reviews.housing_slug
    // reviews.overall
    //
    // Browse/Home should use the SAME source.
    // =====================================================

    const {
      data: reviewData,
      error: reviewError,
    } = await supabase
      .from("reviews")
      .select(
        "housing_slug, overall"
      );

    if (reviewError) {
      console.error(
        "Reviews error:",
        reviewError
      );

      return NextResponse.json(
        {
          error: reviewError.message,
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // 3. Calculate rating statistics for every property
    // =====================================================

    const reviewMap =
      new Map<string, ReviewStats>();

    for (
      const review of
      (reviewData ?? []) as ReviewRow[]
    ) {
      const housingSlug =
        review.housing_slug?.trim();

      if (!housingSlug) {
        continue;
      }

      const overall =
        Number(review.overall ?? 0);

      if (!Number.isFinite(overall)) {
        continue;
      }

      const current =
        reviewMap.get(housingSlug) ?? {
          total: 0,
          count: 0,
        };

      current.total += overall;
      current.count += 1;

      reviewMap.set(
        housingSlug,
        current
      );
    }

    // =====================================================
    // 4. Map buildings and apply LIVE review statistics
    // =====================================================

    const housing: HousingItem[] = (
      (buildingData ?? []) as BuildingRow[]
    ).map((row) => {
      const item =
        mapBuildingRow(row);

      const slug =
        row.slug ??
        String(row.id);

      const stats =
        reviewMap.get(slug);

      const reviewCount =
        stats?.count ?? 0;

      const rating =
        stats && stats.count > 0
          ? stats.total /
            stats.count
          : 0;

      return {
        ...item,

        rating,

        reviewCount,
      };
    });

    // =====================================================
    // 5. Return housing
    // =====================================================

    return NextResponse.json(
      housing
    );
  } catch (error) {
    console.error(
      "Browse housing API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load housing data",
      },
      {
        status: 500,
      }
    );
  }
}