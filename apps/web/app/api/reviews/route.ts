import {
  createClient,
} from "@supabase/supabase-js";

import {
  NextRequest,
  NextResponse,
} from "next/server";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// =====================================================
// CREATE REQUEST SUPABASE CLIENT
// =====================================================

function createRequestClient(
  accessToken?: string
) {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    accessToken
      ? {
          global: {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          },
        }
      : undefined
  );
}

// =====================================================
// GET ALL REVIEWS FOR ONE PROPERTY
// =====================================================

export async function GET(
  request: NextRequest
) {
  try {
    const {
      searchParams,
    } =
      new URL(
        request.url
      );

    const housingSlug =
      searchParams.get(
        "housingSlug"
      ) ??
      searchParams.get(
        "housingId"
      );

    if (!housingSlug) {
      return NextResponse.json(
        {
          error:
            "housingSlug is required.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      createRequestClient();

    const {
      data,
      error,
    } =
      await supabase
        .from("reviews")
        .select(`
          id,
          user_id,
          user_name,
          user_email,
          housing_slug,
          housing_name,
          review_date,
          comment,
          pros,
          cons,
          would_recommend,
          likes,
          dislikes,
          overall,
          noise,
          cleanliness,
          amenities,
          source_type,
          source_name,
          source_url,
          is_external_summary,
          created_at
        `)
        .eq(
          "housing_slug",
          housingSlug
        )
        .order(
          "review_date",
          {
            ascending:
              false,
          }
        );

    if (error) {
      console.error(
        "Load reviews error:",
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
      "GET reviews error:",
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

// =====================================================
// CREATE REVIEW
// =====================================================

export async function POST(
  request: NextRequest
) {
  try {
    // =================================================
    // AUTHORIZATION HEADER
    // =================================================

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to write a review.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authorization.slice(
        7
      );

    const supabase =
      createRequestClient(
        accessToken
      );

    // =================================================
    // AUTHENTICATE USER
    // =================================================

    const {
      data: userData,
      error: userError,
    } =
      await supabase.auth.getUser(
        accessToken
      );

    if (
      userError ||
      !userData.user
    ) {
      console.error(
        "Review authentication error:",
        userError
      );

      return NextResponse.json(
        {
          error:
            "Your login session is invalid or expired.",
        },
        {
          status: 401,
        }
      );
    }

    const user =
      userData.user;

    // =================================================
    // REVIEWER DISPLAY NAME
    // =================================================

    const metadataName =
      typeof user
        .user_metadata
        ?.full_name ===
      "string"
        ? user.user_metadata.full_name.trim()
        : "";

    const userEmail =
      user.email?.trim() ??
      "";

    const reviewerName =
      metadataName ||
      userEmail ||
      "CHUD User";

    // =================================================
    // REQUEST BODY
    // =================================================

    const body =
      await request.json();

    const housingSlug =
      typeof body.housingSlug ===
      "string"
        ? body.housingSlug.trim()
        : "";

    const housingName =
      typeof body.housingName ===
      "string"
        ? body.housingName.trim()
        : "";

    const comment =
      typeof body.comment ===
      "string"
        ? body.comment.trim()
        : "";

    const pros =
      typeof body.pros ===
      "string"
        ? body.pros.trim()
        : "";

    const cons =
      typeof body.cons ===
      "string"
        ? body.cons.trim()
        : "";

    const wouldRecommend =
      Boolean(
        body.wouldRecommend
      );

    const overall =
      Number(
        body.overall
      );

    const noise =
      Number(
        body.noise
      );

    const cleanliness =
      Number(
        body.cleanliness
      );

    const amenities =
      Number(
        body.amenities
      );

    // =================================================
    // VALIDATE PROPERTY
    // =================================================

    if (
      !housingSlug ||
      !housingName
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a housing property.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // VALIDATE REVIEW TEXT
    // =================================================

    if (!comment) {
      return NextResponse.json(
        {
          error:
            "Please write a review.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      comment.length <
      10
    ) {
      return NextResponse.json(
        {
          error:
            "Please write at least 10 characters.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // VALIDATE RATINGS
    // =================================================

    const ratings = [
      overall,
      noise,
      cleanliness,
      amenities,
    ];

    if (
      ratings.some(
        (rating) =>
          !Number.isInteger(
            rating
          ) ||
          rating < 1 ||
          rating > 5
      )
    ) {
      return NextResponse.json(
        {
          error:
            "All ratings must be between 1 and 5.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // CHECK FOR EXISTING REVIEW
    //
    // SECURITY / DATA QUALITY:
    //
    // One authenticated user may submit only
    // one review for each housing property.
    // =================================================

    const {
      data:
        existingReview,
      error:
        existingReviewError,
    } =
      await supabase
        .from("reviews")
        .select(
          "id, housing_slug"
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "housing_slug",
          housingSlug
        )
        .maybeSingle();

    if (
      existingReviewError
    ) {
      console.error(
        "Existing review check error:",
        existingReviewError
      );

      return NextResponse.json(
        {
          error:
            "Unable to check for an existing review.",
          details:
            existingReviewError.message,
        },
        {
          status: 500,
        }
      );
    }

    // =================================================
    // ALREADY REVIEWED
    // =================================================

    if (
      existingReview
    ) {
      return NextResponse.json(
        {
          error:
            "You have already reviewed this property. Please edit your existing review instead.",

          code:
            "REVIEW_ALREADY_EXISTS",

          reviewId:
            existingReview.id,
        },
        {
          status: 409,
        }
      );
    }

    // =================================================
    // CREATE REVIEW
    //
    // user_id comes ONLY from Supabase authentication.
    //
    // We NEVER trust a user_id sent by the browser.
    // =================================================

    const {
      data,
      error,
    } =
      await supabase
        .from("reviews")
        .insert({
          user_id:
            user.id,

          user_name:
            reviewerName,

          user_email:
            userEmail ||
            null,

          housing_slug:
            housingSlug,

          housing_name:
            housingName,

          review_date:
            new Date()
              .toISOString(),

          comment,

          pros,

          cons,

          would_recommend:
            wouldRecommend,

          likes: 0,

          dislikes: 0,

          overall,

          noise,

          cleanliness,

          amenities,

          source_type:
            "chud_user",

          source_name:
            null,

          source_url:
            null,

          is_external_summary:
            false,
        })
        .select()
        .single();

    if (error) {
      console.error(
        "Create review error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to submit review.",
          details:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    // =================================================
    // SUCCESS
    // =================================================

    return NextResponse.json(
      {
        message:
          "Review submitted successfully.",

        review:
          data,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST review error:",
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