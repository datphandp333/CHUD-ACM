import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, buildingId, rating, comment, cleanliness, noise, laundry, entertainment } = body;

  if (!name || !buildingId || !rating || !comment) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  // Insert text review into ratingauth
  const { data, error } = await supabase
    .from("ratingauth")
    .insert([{ listing_id: buildingId, reviewer_name: name, score: rating, comment }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If detailed scores are provided, insert into ratings table
  if (cleanliness || noise || laundry || entertainment) {
    await supabase.from("ratings").insert([{
      building_id: buildingId,
      reviewer_name: name,
      cleanliness: cleanliness ?? null,
      noise: noise ?? null,
      laundry: laundry ?? null,
      entertainment: entertainment ?? null,
      overall: rating,
    }]);
  }

  return NextResponse.json(data, { status: 201 });
}
