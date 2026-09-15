import {
  createClient,
} from "@supabase/supabase-js";

import {
  NextResponse,
} from "next/server";

const supabaseUrl =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey =
  process.env
    .NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey
  );

export async function GET() {
  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "reviews"
        )
        .select(
          `
            id,
            housing_slug,
            overall,
            would_recommend
          `
        );

    if (error) {
      console.error(
        "Load all reviews error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to load reviews.",
          details:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        reviews:
          data ?? [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "All reviews API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected server error.",
      },
      {
        status: 500,
      }
    );
  }
}