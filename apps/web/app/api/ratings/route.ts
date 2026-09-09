import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

// GET /api/ratings?buildingId=xxx
// Returns text reviews from ratingauth + detailed breakdown averages from ratings
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const buildingId = searchParams.get("buildingId") ?? "";

  const [{ data: reviews, error: reviewsError }, { data: detailedRatings, error: ratingsError }] =
    await Promise.all([
      supabase
        .from("ratingauth")
        .select("id, reviewer_name, score, comment, created_at")
        .eq("listing_id", buildingId),
      supabase
        .from("ratings")
        .select("cleanliness, noise, laundry, entertainment, overall, reviewer_name")
        .eq("building_id", buildingId),
    ]);

  if (reviewsError) return NextResponse.json({ error: reviewsError.message }, { status: 500 });
  if (ratingsError) return NextResponse.json({ error: ratingsError.message }, { status: 500 });

  const rows = detailedRatings ?? [];
  const avg = (field: string) => {
    const vals = rows.map((r) => (r as Record<string, number | null>)[field]).filter((v) => v !== null) as number[];
    return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
  };

  return NextResponse.json({
    reviews: reviews ?? [],
    detailedAverages: rows.length > 0 ? {
      cleanliness: avg("cleanliness"),
      noise: avg("noise"),
      laundry: avg("laundry"),
      entertainment: avg("entertainment"),
      overall: avg("overall"),
    } : null,
  });
}
