"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  supabase,
} from "@/app/lib/supabaseClient";

// =====================================================
// TYPES
// =====================================================

type ReviewCategories = {
  overall: number;
  noise: number;
  cleanliness: number;
  amenities: number;
};

type UserReaction =
  | 1
  | -1
  | null;

export type ReviewItem = {
  id: number;

  userId: string | null;

  user: string;

  date: string;
  rawDate: string;

  comment: string;

  likes: number;
  dislikes: number;

  userReaction: UserReaction;

  pros: string;
  cons: string;

  wouldRecommend: boolean;

  categories: ReviewCategories;

  isExternalSummary: boolean;

  sourceName: string;
  sourceUrl: string;
};

type ReviewSectionProps = {
  apartmentId: string;

  onReviewCountChange?: (
    count: number
  ) => void;

  onReviewsLoaded?: (
    reviews: ReviewItem[]
  ) => void;
};

type ReviewApiRow = {
  id: number;

  user_id: string | null;
  user_name: string | null;
  user_email: string | null;

  housing_slug: string;
  housing_name: string;

  review_date: string;

  comment: string | null;

  likes: number | null;
  dislikes: number | null;

  pros: string | null;
  cons: string | null;

  would_recommend: boolean | null;

  overall: number | null;
  noise: number | null;
  cleanliness: number | null;
  amenities: number | null;

  source_type: string | null;
  source_name: string | null;
  source_url: string | null;

  is_external_summary: boolean | null;

  created_at: string;
};

type ReactionRow = {
  review_id: number;
  user_id: string;
  reaction: number;
};

// =====================================================
// DATE
// =====================================================

function formatReviewDate(
  value: string
) {
  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value;
  }

  return parsed.toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

// =====================================================
// MAP REVIEW
// =====================================================

function mapReviewRow(
  row: ReviewApiRow
): ReviewItem {
  return {
    id:
      Number(row.id),

    userId:
      row.user_id ??
      null,

    user:
      row.user_name ||
      row.user_email ||
      "CHUD User",

    date:
      formatReviewDate(
        row.review_date
      ),

    rawDate:
      row.review_date,

    comment:
      row.comment ??
      "",

    // These will be replaced by the values calculated
    // from review_reactions after reviews are loaded.

    likes: 0,

    dislikes: 0,

    userReaction:
      null,

    pros:
      row.pros ??
      "",

    cons:
      row.cons ??
      "",

    wouldRecommend:
      Boolean(
        row.would_recommend
      ),

    categories: {
      overall:
        Number(
          row.overall ??
          0
        ),

      noise:
        Number(
          row.noise ??
          0
        ),

      cleanliness:
        Number(
          row.cleanliness ??
          0
        ),

      amenities:
        Number(
          row.amenities ??
          0
        ),
    },

    isExternalSummary:
      Boolean(
        row.is_external_summary
      ),

    sourceName:
      row.source_name ??
      "",

    sourceUrl:
      row.source_url ??
      "",
  };
}

// =====================================================
// MAIN REVIEW RATING
//
// Main score = OVERALL only.
// =====================================================

function getAverageRating(
  review: ReviewItem
) {
  return Number(
    review.categories.overall ??
    0
  );
}

// =====================================================
// COMPONENT
// =====================================================

export default function ReviewSection({
  apartmentId,
  onReviewCountChange,
  onReviewsLoaded,
}: ReviewSectionProps) {
  const [
    reviews,
    setReviews,
  ] =
    useState<
      ReviewItem[]
    >([]);

  const [
    currentUserId,
    setCurrentUserId,
  ] =
    useState<
      string | null
    >(null);

  const [
    sortBy,
    setSortBy,
  ] =
    useState<
      | "newest"
      | "highest"
      | "lowest"
    >("newest");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    reactionError,
    setReactionError,
  ] =
    useState("");

  const [
    reactingReviewId,
    setReactingReviewId,
  ] =
    useState<
      number | null
    >(null);

  const [
    deleteConfirmId,
    setDeleteConfirmId,
  ] =
    useState<
      number | null
    >(null);

  const [
    deletingReviewId,
    setDeletingReviewId,
  ] =
    useState<
      number | null
    >(null);

  const [
    deleteError,
    setDeleteError,
  ] =
    useState("");

  // ===================================================
  // CURRENT USER
  // ===================================================

  useEffect(() => {
    let cancelled =
      false;

    async function loadCurrentUser() {
      const {
        data,
        error:
          authError,
      } =
        await supabase.auth.getUser();

      if (
        cancelled
      ) {
        return;
      }

      if (
        authError
      ) {
        console.error(
          "Load current user error:",
          authError
        );

        setCurrentUserId(
          null
        );

        return;
      }

      setCurrentUserId(
        data.user?.id ??
        null
      );
    }

    loadCurrentUser();

    const {
      data:
        authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          if (
            cancelled
          ) {
            return;
          }

          setCurrentUserId(
            session
              ?.user
              ?.id ??
            null
          );
        }
      );

    return () => {
      cancelled =
        true;

      authListener
        .subscription
        .unsubscribe();
    };
  }, []);

  // ===================================================
  // LOAD REACTION COUNTS
  // ===================================================

  const attachReactionData =
    useCallback(
      async (
        reviewList:
          ReviewItem[]
      ) => {
        if (
          reviewList.length ===
          0
        ) {
          return reviewList;
        }

        const reviewIds =
          reviewList.map(
            (
              review
            ) =>
              review.id
          );

        const {
          data:
            reactionData,
          error:
            reactionLoadError,
        } =
          await supabase
            .from(
              "review_reactions"
            )
            .select(
              "review_id, user_id, reaction"
            )
            .in(
              "review_id",
              reviewIds
            );

        if (
          reactionLoadError
        ) {
          console.error(
            "Load review reactions error:",
            reactionLoadError
          );

          return reviewList;
        }

        const reactionRows =
          (
            reactionData ??
            []
          ) as ReactionRow[];

        return reviewList.map(
          (
            review
          ) => {
            const reviewReactions =
              reactionRows.filter(
                (
                  reaction
                ) =>
                  Number(
                    reaction.review_id
                  ) ===
                  review.id
              );

            const likes =
              reviewReactions.filter(
                (
                  reaction
                ) =>
                  Number(
                    reaction.reaction
                  ) ===
                  1
              ).length;

            const dislikes =
              reviewReactions.filter(
                (
                  reaction
                ) =>
                  Number(
                    reaction.reaction
                  ) ===
                  -1
              ).length;

            const myReaction =
              currentUserId
                ? reviewReactions.find(
                    (
                      reaction
                    ) =>
                      reaction.user_id ===
                      currentUserId
                  )
                : undefined;

            let userReaction:
              UserReaction =
              null;

            if (
              Number(
                myReaction?.reaction
              ) ===
              1
            ) {
              userReaction =
                1;
            }

            if (
              Number(
                myReaction?.reaction
              ) ===
              -1
            ) {
              userReaction =
                -1;
            }

            return {
              ...review,

              likes,

              dislikes,

              userReaction,
            };
          }
        );
      },
      [
        currentUserId,
      ]
    );

  // ===================================================
  // LOAD REVIEWS
  // ===================================================

  useEffect(() => {
    let cancelled =
      false;

    async function loadReviews() {
      try {
        setLoading(
          true
        );

        setError(
          ""
        );

        const response =
          await fetch(
            `/api/reviews?housingId=${encodeURIComponent(
              apartmentId
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            result.details ||
            result.error ||
            "Failed to load reviews."
          );
        }

        const mapped =
          (
            result.reviews ??
            []
          ).map(
            (
              row:
                ReviewApiRow
            ) =>
              mapReviewRow(
                row
              )
          );

        const withReactions =
          await attachReactionData(
            mapped
          );

        if (
          cancelled
        ) {
          return;
        }

        setReviews(
          withReactions
        );

        onReviewCountChange?.(
          withReactions.length
        );

        onReviewsLoaded?.(
          withReactions
        );
      } catch (
        err
      ) {
        if (
          cancelled
        ) {
          return;
        }

        console.error(
          "ReviewSection load error:",
          err
        );

        setReviews(
          []
        );

        onReviewCountChange?.(
          0
        );

        onReviewsLoaded?.(
          []
        );

        setError(
          err instanceof Error
            ? err.message
            : "Could not load reviews."
        );
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false
          );
        }
      }
    }

    loadReviews();

    return () => {
      cancelled =
        true;
    };
  }, [
    apartmentId,
    attachReactionData,
    onReviewCountChange,
    onReviewsLoaded,
  ]);

  // ===================================================
  // SORT
  // ===================================================

  const sortedReviews =
    useMemo(() => {
      const copied = [
        ...reviews,
      ];

      if (
        sortBy ===
        "highest"
      ) {
        return copied.sort(
          (
            a,
            b
          ) =>
            getAverageRating(
              b
            ) -
            getAverageRating(
              a
            )
        );
      }

      if (
        sortBy ===
        "lowest"
      ) {
        return copied.sort(
          (
            a,
            b
          ) =>
            getAverageRating(
              a
            ) -
            getAverageRating(
              b
            )
        );
      }

      return copied.sort(
        (
          a,
          b
        ) =>
          new Date(
            b.rawDate
          ).getTime() -
          new Date(
            a.rawDate
          ).getTime()
      );
    }, [
      reviews,
      sortBy,
    ]);

  // ===================================================
  // LIKE / DISLIKE
  // ===================================================

  async function handleReaction(
    reviewId: number,
    action:
      | "like"
      | "dislike"
  ) {
    try {
      setReactionError(
        ""
      );

      setReactingReviewId(
        reviewId
      );

      // -----------------------------------------------
      // GET AUTH SESSION
      // -----------------------------------------------

      const {
        data:
          sessionData,
        error:
          sessionError,
      } =
        await supabase.auth.getSession();

      if (
        sessionError
      ) {
        throw new Error(
          "Could not verify your login session."
        );
      }

      const accessToken =
        sessionData
          .session
          ?.access_token;

      if (
        !accessToken
      ) {
        throw new Error(
          "You must be logged in to like or dislike a review."
        );
      }

      // -----------------------------------------------
      // CALL API
      // -----------------------------------------------

      const response =
        await fetch(
          `/api/reviews/${reviewId}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body:
              JSON.stringify({
                action,
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.details ||
          result.error ||
          "Failed to update reaction."
        );
      }

      const updated =
        result.review;

      const userReactionValue =
        Number(
          updated?.userReaction
        );

      let nextUserReaction:
        UserReaction =
        null;

      if (
        userReactionValue ===
        1
      ) {
        nextUserReaction =
          1;
      }

      if (
        userReactionValue ===
        -1
      ) {
        nextUserReaction =
          -1;
      }

      const nextReviews =
        reviews.map(
          (
            review
          ) =>
            review.id ===
            reviewId
              ? {
                  ...review,

                  likes:
                    Number(
                      updated
                        ?.likes ??
                      0
                    ),

                  dislikes:
                    Number(
                      updated
                        ?.dislikes ??
                      0
                    ),

                  userReaction:
                    nextUserReaction,
                }
              : review
        );

      setReviews(
        nextReviews
      );

      onReviewsLoaded?.(
        nextReviews
      );
    } catch (
      err
    ) {
      console.error(
        "Review reaction error:",
        err
      );

      setReactionError(
        err instanceof Error
          ? err.message
          : "Could not update reaction."
      );
    } finally {
      setReactingReviewId(
        null
      );
    }
  }

  // ===================================================
  // DELETE
  // ===================================================

  async function handleDeleteReview(
    reviewId: number
  ) {
    try {
      setDeleteError(
        ""
      );

      setDeletingReviewId(
        reviewId
      );

      const {
        data:
          sessionData,
        error:
          sessionError,
      } =
        await supabase.auth.getSession();

      if (
        sessionError
      ) {
        throw new Error(
          "Could not verify your login session."
        );
      }

      const accessToken =
        sessionData
          .session
          ?.access_token;

      if (
        !accessToken
      ) {
        throw new Error(
          "You must be logged in to delete a review."
        );
      }

      const response =
        await fetch(
          `/api/reviews/${reviewId}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.details ||
          result.error ||
          "Failed to delete review."
        );
      }

      const nextReviews =
        reviews.filter(
          (
            review
          ) =>
            review.id !==
            reviewId
        );

      setReviews(
        nextReviews
      );

      onReviewCountChange?.(
        nextReviews.length
      );

      onReviewsLoaded?.(
        nextReviews
      );

      setDeleteConfirmId(
        null
      );
    } catch (
      err
    ) {
      console.error(
        "Delete review error:",
        err
      );

      setDeleteError(
        err instanceof Error
          ? err.message
          : "Could not delete review."
      );
    } finally {
      setDeletingReviewId(
        null
      );
    }
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <section className="mt-12">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
            Community Feedback
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
            Student Reviews
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Real CHUD reviews and clearly labeled external review summaries.
          </p>

        </div>

        <div className="flex items-center gap-2">

          <label
            htmlFor="sortReviews"
            className="text-sm font-medium text-slate-600"
          >
            Sort by
          </label>

          <select
            id="sortReviews"
            value={
              sortBy
            }
            onChange={(
              event
            ) =>
              setSortBy(
                event
                  .target
                  .value as
                  | "newest"
                  | "highest"
                  | "lowest"
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none"
          >

            <option value="newest">
              Newest
            </option>

            <option value="highest">
              Highest Rated
            </option>

            <option value="lowest">
              Lowest Rated
            </option>

          </select>

        </div>

      </div>

      {/* REACTION ERROR */}

      {reactionError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">

          <p className="font-semibold text-red-800">
            Could not update reaction
          </p>

          <p className="mt-1 text-sm text-red-700">
            {
              reactionError
            }
          </p>

        </div>
      )}

      {/* DELETE ERROR */}

      {deleteError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">

          <p className="font-semibold text-red-800">
            Could not delete review
          </p>

          <p className="mt-1 text-sm text-red-700">
            {
              deleteError
            }
          </p>

        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <p className="text-slate-600">
            Loading reviews...
          </p>

        </div>
      )}

      {/* ERROR */}

      {!loading &&
        error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6">

            <p className="font-semibold text-red-800">
              Could not load reviews
            </p>

            <p className="mt-2 text-sm text-red-700">
              {
                error
              }
            </p>

          </div>
        )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        sortedReviews.length ===
          0 && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-700">
              ★
            </div>

            <p className="mt-4 text-lg font-bold text-slate-900">
              No reviews yet
            </p>

            <p className="mt-2 text-slate-600">
              Be the first student to share an experience for this property.
            </p>

          </div>
        )}

      {/* REVIEWS */}

      {!loading &&
        !error &&
        sortedReviews.length >
          0 && (
          <div className="mt-6 space-y-6">

            {sortedReviews.map(
              (
                review
              ) => {
                const rating =
                  getAverageRating(
                    review
                  );

                const isOwner =
                  !review.isExternalSummary &&
                  Boolean(
                    currentUserId
                  ) &&
                  review.userId ===
                    currentUserId;

                const isReacting =
                  reactingReviewId ===
                  review.id;

                return (
                  <article
                    key={
                      review.id
                    }
                    className={`rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                      review.isExternalSummary
                        ? "border-blue-200"
                        : isOwner
                          ? "border-blue-300"
                          : "border-slate-200"
                    }`}
                  >

                    {/* REVIEW HEADER */}

                    <div className="flex flex-wrap items-start justify-between gap-4">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-700">

                          {review.isExternalSummary
                            ? "E"
                            : review.user
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-lg font-bold text-slate-950">
                              {
                                review.user
                              }
                            </h3>

                            {isOwner && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                Your Review
                              </span>
                            )}

                            {review.isExternalSummary && (
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                External Review Summary
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {
                              review.date
                            }
                          </p>

                        </div>

                      </div>

                      <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
                        ★{" "}
                        {rating.toFixed(
                          1
                        )}{" "}
                        / 5
                      </div>

                    </div>

                    {/* COMMENT */}

                    <div className="mt-5 rounded-2xl bg-slate-50 p-5">

                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        {review.isExternalSummary
                          ? "Review Summary"
                          : "Review"}
                      </p>

                      <p className="mt-3 leading-7 text-slate-700">
                        {review.comment ||
                          "No comment provided."}
                      </p>

                    </div>

                    {/* RECOMMENDATION */}

                    <div className="mt-4">

                      <span
                        className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                          review.wouldRecommend
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >

                        {review.wouldRecommend
                          ? "✓ Would recommend"
                          : "✕ Would not recommend"}

                      </span>

                    </div>

                    {/* PROS / CONS */}

                    {(review.pros ||
                      review.cons) && (
                      <div className="mt-5 grid gap-4 md:grid-cols-2">

                        {review.pros && (
                          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">

                            <p className="font-bold text-green-800">
                              Pros
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {
                                review.pros
                              }
                            </p>

                          </div>
                        )}

                        {review.cons && (
                          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

                            <p className="font-bold text-red-800">
                              Cons
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {
                                review.cons
                              }
                            </p>

                          </div>
                        )}

                      </div>
                    )}

                    {/* CATEGORY RATINGS */}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                      {Object.entries(
                        review.categories
                      ).map(
                        ([
                          key,
                          value,
                        ]) => (
                          <div
                            key={
                              key
                            }
                            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                          >

                            <span className="block text-sm capitalize text-slate-500">
                              {key.replace(
                                /([A-Z])/g,
                                " $1"
                              )}
                            </span>

                            <div className="mt-2 flex items-center gap-2">

                              <span className="text-lg text-amber-500">
                                ★
                              </span>

                              <span className="font-bold text-slate-950">
                                {
                                  value
                                }
                                /5
                              </span>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                    {/* EXTERNAL SOURCE */}

                    {review.isExternalSummary &&
                      review.sourceUrl && (
                        <div className="mt-5 border-t border-slate-100 pt-5">

                          <a
                            href={
                              review.sourceUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-blue-700 hover:underline"
                          >
                            View public source ↗
                          </a>

                        </div>
                      )}

                    {/* REACTIONS */}

                    {!review.isExternalSummary && (
                      <div className="mt-6 border-t border-slate-100 pt-5">

                        <div className="flex flex-wrap items-center justify-between gap-4">

                          <div className="flex items-center gap-3">

                            {/* LIKE */}

                            <button
                              type="button"
                              disabled={
                                isReacting
                              }
                              onClick={() =>
                                handleReaction(
                                  review.id,
                                  "like"
                                )
                              }
                              className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                review.userReaction ===
                                1
                                  ? "border-blue-300 bg-blue-100 text-blue-800"
                                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              👍{" "}
                              {
                                review.likes
                              }
                            </button>

                            {/* DISLIKE */}

                            <button
                              type="button"
                              disabled={
                                isReacting
                              }
                              onClick={() =>
                                handleReaction(
                                  review.id,
                                  "dislike"
                                )
                              }
                              className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                review.userReaction ===
                                -1
                                  ? "border-red-300 bg-red-100 text-red-800"
                                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              👎{" "}
                              {
                                review.dislikes
                              }
                            </button>

                          </div>

                          {/* OWNER ACTIONS */}

                          {isOwner && (
                            <div className="flex items-center gap-2">

                              <Link
                                href={`/write-review?id=${encodeURIComponent(
                                  apartmentId
                                )}&edit=${review.id}`}
                                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                              >
                                Edit
                              </Link>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteError(
                                    ""
                                  );

                                  setDeleteConfirmId(
                                    review.id
                                  );
                                }}
                                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                              >
                                Delete
                              </button>

                            </div>
                          )}

                        </div>

                        {/* DELETE CONFIRMATION */}

                        {isOwner &&
                          deleteConfirmId ===
                            review.id && (
                            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">

                              <p className="font-bold text-red-900">
                                Delete your review?
                              </p>

                              <p className="mt-2 text-sm text-red-700">
                                This action cannot be undone.
                              </p>

                              <div className="mt-4 flex gap-3">

                                <button
                                  type="button"
                                  disabled={
                                    deletingReviewId ===
                                    review.id
                                  }
                                  onClick={() =>
                                    setDeleteConfirmId(
                                      null
                                    )
                                  }
                                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    deletingReviewId ===
                                    review.id
                                  }
                                  onClick={() =>
                                    handleDeleteReview(
                                      review.id
                                    )
                                  }
                                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                                >

                                  {deletingReviewId ===
                                  review.id
                                    ? "Deleting..."
                                    : "Delete Review"}

                                </button>

                              </div>

                            </div>
                          )}

                      </div>
                    )}

                  </article>
                );
              }
            )}

          </div>
        )}

    </section>
  );
}