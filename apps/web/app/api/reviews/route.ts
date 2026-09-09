import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

type ReviewInsertBody = {
  housingSlug: string;
  housingName: string;
  userName: string;
  comment: string;
  pros?: string;
  cons?: string;
  wouldRecommend?: boolean;
  categories: {
    overall: number;
    noise: number;
    cleanliness: number;
    amenities: number;
  };
};

export async function GET(request: NextRequest) {
  const housingId = request.nextUrl.searchParams.get("housingId");

  if (!housingId) {
    return NextResponse.json(
      { error: "housingId is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("housing_slug", housingId)
    .order("review_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReviewInsertBody;

    const {
      housingSlug,
      housingName,
      userName,
      comment,
      pros,
      cons,
      wouldRecommend,
      categories,
    } = body;

    if (
      !housingSlug ||
      !housingName ||
      !userName ||
      !comment ||
      !categories
    ) {
      return NextResponse.json(
        { error: "Missing required review fields" },
        { status: 400 }
      );
    }

    const requiredCategoryFields: Array<keyof ReviewInsertBody["categories"]> = [
      "overall",
      "noise",
      "cleanliness",
      "amenities",
    ];

    for (const field of requiredCategoryFields) {
      const value = categories[field];
      if (typeof value !== "number" || value < 1 || value > 5) {
        return NextResponse.json(
          { error: `Invalid category value for ${field}` },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          housing_slug: housingSlug,
          housing_name: housingName,
          user_name: userName.trim(),
          review_date: new Date().toISOString(),
          comment: comment.trim(),
          pros: (pros ?? "").trim(),
          cons: (cons ?? "").trim(),
          would_recommend: Boolean(wouldRecommend),
          likes: 0,
          dislikes: 0,
          overall: categories.overall,
          noise: categories.noise,
          cleanliness: categories.cleanliness,
          amenities: categories.amenities,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}