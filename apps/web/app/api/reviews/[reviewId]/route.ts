import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const { reviewId } = await params;

  try {
    const body = await request.json();
    const action = body.action;

    if (action !== "like" && action !== "dislike") {
      return NextResponse.json(
        { error: "Action must be 'like' or 'dislike'" },
        { status: 400 }
      );
    }

    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("id, likes, dislikes")
      .eq("id", Number(reviewId))
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const updatePayload =
      action === "like"
        ? { likes: Number(existingReview.likes ?? 0) + 1 }
        : { dislikes: Number(existingReview.dislikes ?? 0) + 1 };

    const { data, error } = await supabase
      .from("reviews")
      .update(updatePayload)
      .eq("id", Number(reviewId))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}