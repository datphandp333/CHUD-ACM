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
// CREATE SUPABASE CLIENT
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
// GET ACCESS TOKEN
// =====================================================

function getAccessToken(
  request: NextRequest
) {
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
    return null;
  }

  return authorization.slice(
    7
  );
}

// =====================================================
// GET AUTHENTICATED USER
// =====================================================

async function getAuthenticatedUser(
  request: NextRequest
) {
  const accessToken =
    getAccessToken(
      request
    );

  if (!accessToken) {
    return {
      user: null,
      supabase: null,
      error:
        "You must be logged in.",
    };
  }

  const supabase =
    createRequestClient(
      accessToken
    );

  const {
    data,
    error,
  } =
    await supabase.auth.getUser(
      accessToken
    );

  if (
    error ||
    !data.user
  ) {
    return {
      user: null,
      supabase: null,
      error:
        "Your login session is invalid or expired.",
    };
  }

  return {
    user: data.user,
    supabase,
    error: null,
  };
}

// =====================================================
// PATCH
//
// Supports:
//
// 1. Like
// 2. Dislike
// 3. Edit review
// =====================================================

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      reviewId: string;
    }>;
  }
) {
  try {
    const {
      reviewId,
    } =
      await params;

    const numericReviewId =
      Number(
        reviewId
      );

    if (
      !Number.isInteger(
        numericReviewId
      ) ||
      numericReviewId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid review ID.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // AUTHENTICATION
    // =================================================

    const auth =
      await getAuthenticatedUser(
        request
      );

    if (
      !auth.user ||
      !auth.supabase
    ) {
      return NextResponse.json(
        {
          error:
            auth.error ??
            "You must be logged in.",
        },
        {
          status: 401,
        }
      );
    }

    const user =
      auth.user;

    const supabase =
      auth.supabase;

    // =================================================
    // BODY
    // =================================================

    const body =
      await request.json();

    const action =
      typeof body.action ===
      "string"
        ? body.action
        : "";

    // =================================================
    // LIKE / DISLIKE
    // =================================================

    if (
      action === "like" ||
      action === "dislike"
    ) {
      const reactionValue =
        action === "like"
          ? 1
          : -1;

      // ===============================================
      // MAKE SURE REVIEW EXISTS
      // ===============================================

      const {
        data:
          existingReview,
        error:
          reviewError,
      } =
        await supabase
          .from("reviews")
          .select("id")
          .eq(
            "id",
            numericReviewId
          )
          .maybeSingle();

      if (
        reviewError
      ) {
        console.error(
          "Find review error:",
          reviewError
        );

        return NextResponse.json(
          {
            error:
              "Failed to find review.",
            details:
              reviewError.message,
          },
          {
            status: 500,
          }
        );
      }

      if (
        !existingReview
      ) {
        return NextResponse.json(
          {
            error:
              "Review not found.",
          },
          {
            status: 404,
          }
        );
      }

      // ===============================================
      // CHECK CURRENT USER REACTION
      // ===============================================

      const {
        data:
          existingReaction,
        error:
          reactionLookupError,
      } =
        await supabase
          .from(
            "review_reactions"
          )
          .select(
            "id, reaction"
          )
          .eq(
            "review_id",
            numericReviewId
          )
          .eq(
            "user_id",
            user.id
          )
          .maybeSingle();

      if (
        reactionLookupError
      ) {
        console.error(
          "Reaction lookup error:",
          reactionLookupError
        );

        return NextResponse.json(
          {
            error:
              "Failed to check your reaction.",
            details:
              reactionLookupError.message,
          },
          {
            status: 500,
          }
        );
      }

      // ===============================================
      // SAME BUTTON CLICKED AGAIN
      //
      // 👍 → click 👍 again → remove 👍
      // 👎 → click 👎 again → remove 👎
      // ===============================================

      if (
        existingReaction &&
        Number(
          existingReaction.reaction
        ) ===
          reactionValue
      ) {
        const {
          error:
            deleteReactionError,
        } =
          await supabase
            .from(
              "review_reactions"
            )
            .delete()
            .eq(
              "id",
              existingReaction.id
            )
            .eq(
              "user_id",
              user.id
            );

        if (
          deleteReactionError
        ) {
          console.error(
            "Remove reaction error:",
            deleteReactionError
          );

          return NextResponse.json(
            {
              error:
                "Failed to remove reaction.",
              details:
                deleteReactionError.message,
            },
            {
              status: 500,
            }
          );
        }
      }

      // ===============================================
      // CHANGE REACTION
      //
      // 👍 → 👎
      // 👎 → 👍
      // ===============================================

      else if (
        existingReaction
      ) {
        const {
          error:
            updateReactionError,
        } =
          await supabase
            .from(
              "review_reactions"
            )
            .update({
              reaction:
                reactionValue,

              updated_at:
                new Date()
                  .toISOString(),
            })
            .eq(
              "id",
              existingReaction.id
            )
            .eq(
              "user_id",
              user.id
            );

        if (
          updateReactionError
        ) {
          console.error(
            "Update reaction error:",
            updateReactionError
          );

          return NextResponse.json(
            {
              error:
                "Failed to update reaction.",
              details:
                updateReactionError.message,
            },
            {
              status: 500,
            }
          );
        }
      }

      // ===============================================
      // FIRST REACTION
      // ===============================================

      else {
        const {
          error:
            insertReactionError,
        } =
          await supabase
            .from(
              "review_reactions"
            )
            .insert({
              review_id:
                numericReviewId,

              user_id:
                user.id,

              reaction:
                reactionValue,
            });

        if (
          insertReactionError
        ) {
          console.error(
            "Create reaction error:",
            insertReactionError
          );

          return NextResponse.json(
            {
              error:
                "Failed to save reaction.",
              details:
                insertReactionError.message,
            },
            {
              status: 500,
            }
          );
        }
      }

      // ===============================================
      // GET CURRENT TOTALS
      // ===============================================

      const {
        data:
          reactionRows,
        error:
          totalsError,
      } =
        await supabase
          .from(
            "review_reactions"
          )
          .select(
            "reaction"
          )
          .eq(
            "review_id",
            numericReviewId
          );

      if (
        totalsError
      ) {
        console.error(
          "Reaction totals error:",
          totalsError
        );

        return NextResponse.json(
          {
            error:
              "Reaction saved, but totals could not be loaded.",
            details:
              totalsError.message,
          },
          {
            status: 500,
          }
        );
      }

      const rows =
        reactionRows ??
        [];

      const likes =
        rows.filter(
          (
            row
          ) =>
            Number(
              row.reaction
            ) === 1
        ).length;

      const dislikes =
        rows.filter(
          (
            row
          ) =>
            Number(
              row.reaction
            ) === -1
        ).length;

      const {
        data:
          currentReaction,
      } =
        await supabase
          .from(
            "review_reactions"
          )
          .select(
            "reaction"
          )
          .eq(
            "review_id",
            numericReviewId
          )
          .eq(
            "user_id",
            user.id
          )
          .maybeSingle();

      return NextResponse.json(
        {
          message:
            "Reaction updated.",

          review: {
            id:
              numericReviewId,

            likes,

            dislikes,

            userReaction:
              currentReaction
                ?.reaction ??
              null,
          },
        },
        {
          status: 200,
        }
      );
    }

    // =================================================
    // EDIT REVIEW
    //
    // Anything other than like/dislike is treated as
    // an attempt to edit the review.
    // =================================================

    const {
      data:
        existingReview,
      error:
        reviewLookupError,
    } =
      await supabase
        .from("reviews")
        .select(
          "id, user_id, is_external_summary"
        )
        .eq(
          "id",
          numericReviewId
        )
        .maybeSingle();

    if (
      reviewLookupError
    ) {
      console.error(
        "Review lookup error:",
        reviewLookupError
      );

      return NextResponse.json(
        {
          error:
            "Failed to load review.",
          details:
            reviewLookupError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (
      !existingReview
    ) {
      return NextResponse.json(
        {
          error:
            "Review not found.",
        },
        {
          status: 404,
        }
      );
    }

    // =================================================
    // OWNER SECURITY CHECK
    // =================================================

    if (
      existingReview.user_id !==
      user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You can only edit your own review.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      existingReview.is_external_summary
    ) {
      return NextResponse.json(
        {
          error:
            "External review summaries cannot be edited.",
        },
        {
          status: 403,
        }
      );
    }

    // =================================================
    // VALIDATE EDIT DATA
    // =================================================

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

    if (
      !comment ||
      comment.length < 10
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

    const ratings = [
      overall,
      noise,
      cleanliness,
      amenities,
    ];

    if (
      ratings.some(
        (
          rating
        ) =>
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
    // UPDATE
    //
    // We include user_id in the query as an additional
    // application-level security check.
    //
    // Your Supabase RLS policy independently enforces:
    //
    // auth.uid() = user_id
    // =================================================

    const {
      data:
        updatedReview,
      error:
        updateError,
    } =
      await supabase
        .from("reviews")
        .update({
          comment,
          pros,
          cons,

          would_recommend:
            wouldRecommend,

          overall,
          noise,
          cleanliness,
          amenities,
        })
        .eq(
          "id",
          numericReviewId
        )
        .eq(
          "user_id",
          user.id
        )
        .select()
        .single();

    if (
      updateError
    ) {
      console.error(
        "Update review error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Failed to update review.",
          details:
            updateError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Review updated successfully.",

        review:
          updatedReview,
      },
      {
        status: 200,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "PATCH review error:",
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
// DELETE
//
// Only the authenticated review owner can delete.
//
// Security exists at TWO levels:
//
// 1. API verifies review.user_id === authenticated user
// 2. Supabase RLS independently requires
//    auth.uid() = user_id
// =====================================================

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      reviewId: string;
    }>;
  }
) {
  try {
    const {
      reviewId,
    } =
      await params;

    const numericReviewId =
      Number(
        reviewId
      );

    if (
      !Number.isInteger(
        numericReviewId
      ) ||
      numericReviewId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid review ID.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // AUTHENTICATION
    // =================================================

    const auth =
      await getAuthenticatedUser(
        request
      );

    if (
      !auth.user ||
      !auth.supabase
    ) {
      return NextResponse.json(
        {
          error:
            auth.error ??
            "You must be logged in.",
        },
        {
          status: 401,
        }
      );
    }

    const user =
      auth.user;

    const supabase =
      auth.supabase;

    // =================================================
    // FIND REVIEW
    // =================================================

    const {
      data:
        existingReview,
      error:
        reviewError,
    } =
      await supabase
        .from("reviews")
        .select(
          "id, user_id, is_external_summary"
        )
        .eq(
          "id",
          numericReviewId
        )
        .maybeSingle();

    if (
      reviewError
    ) {
      console.error(
        "Find review error:",
        reviewError
      );

      return NextResponse.json(
        {
          error:
            "Failed to load review.",
          details:
            reviewError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (
      !existingReview
    ) {
      return NextResponse.json(
        {
          error:
            "Review not found.",
        },
        {
          status: 404,
        }
      );
    }

    // =================================================
    // OWNER CHECK
    // =================================================

    if (
      existingReview.user_id !==
      user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You can only delete your own review.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      existingReview.is_external_summary
    ) {
      return NextResponse.json(
        {
          error:
            "External review summaries cannot be deleted.",
        },
        {
          status: 403,
        }
      );
    }

    // =================================================
    // DELETE
    //
    // review_reactions uses ON DELETE CASCADE,
    // so reactions belonging to this review will also
    // be removed automatically.
    // =================================================

    const {
      error:
        deleteError,
    } =
      await supabase
        .from("reviews")
        .delete()
        .eq(
          "id",
          numericReviewId
        )
        .eq(
          "user_id",
          user.id
        );

    if (
      deleteError
    ) {
      console.error(
        "Delete review error:",
        deleteError
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete review.",
          details:
            deleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Review deleted successfully.",

        reviewId:
          numericReviewId,
      },
      {
        status: 200,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "DELETE review error:",
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