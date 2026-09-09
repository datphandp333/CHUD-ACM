import { notFound } from "next/navigation";
import HousingProfileClient from "@/app/components/HousingProfileClient";
import { supabase } from "@/app/lib/supabaseClient";
import { mapBuildingRow, type BuildingRow } from "@/app/lib/mapBuilding";

export default async function HousingProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("buildings")
    .select("*")
    .eq("slug", id)
    .maybeSingle();

  if (error || !data) {
    console.error("Supabase detail page error:", error);
    notFound();
  }

  const { data: reviewData } = await supabase
    .from("ratingauth")
    .select("score")
    .eq("listing_id", id);

  const reviewCount = reviewData?.length ?? 0;
  const avgRating =
    reviewCount > 0
      ? reviewData!.reduce((sum, r) => sum + r.score, 0) / reviewCount
      : 0;

  const apartment = {
    ...mapBuildingRow(data as BuildingRow),
    rating: avgRating,
    reviewCount,
  };

  return <HousingProfileClient apartment={apartment} />;
}