"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type ReviewCategories = {
  overall: number;
  noise: number;
  cleanliness: number;
  amenities: number;
};

export type ReviewItem = {
  id: number;
  user: string;
  date: string;
  comment: string;

  likes: number;
  dislikes: number;

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

  onReviewCountChange?: React.Dispatch<
    React.SetStateAction<number>
  >;

  onReviewsLoaded?: (
    reviews: ReviewItem[]
  ) => void;
};

type ReviewApiRow = {
  id: number;

  user_id: string | null;
  user_name: string;
  user_email: string | null;

  housing_slug: string;
  housing_name: string;

  review_date: string;

  comment: string;

  likes: number | null;
  dislikes: number | null;

  pros: string | null;
  cons: string | null;

  would_recommend: boolean | null;

  overall: number;
  noise: number;
  cleanliness: number;
  amenities: number;

  source_type: string | null;
  source_name: string | null;
  source_url: string | null;
  is_external_summary: boolean | null;

  created_at: string;
};

type ReviewApiResponse = {
  reviews: ReviewApiRow[];
};

function formatReviewDate(
  value: string
) {
  const parsed = new Date(value);

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

function mapReviewRow(
  row: ReviewApiRow
): ReviewItem {
  return {
    id: row.id,

    user:
      row.user_name ||
      row.user_email ||
      "CHUD User",

    date:
      formatReviewDate(
        row.review_date
      ),

    comment:
      row.comment ?? "",

    likes:
      Number(
        row.likes ?? 0
      ),

    dislikes:
      Number(
        row.dislikes ?? 0
      ),

    pros:
      row.pros ?? "",

    cons:
      row.cons ?? "",

    wouldRecommend:
      Boolean(
        row.would_recommend
      ),

    categories: {
      overall:
        Number(
          row.overall
        ),

      noise:
        Number(
          row.noise
        ),

      cleanliness:
        Number(
          row.cleanliness
        ),

      amenities:
        Number(
          row.amenities
        ),
    },

    isExternalSummary:
      Boolean(
        row.is_external_summary
      ),

    sourceName:
      row.source_name ?? "",

    sourceUrl:
      row.source_url ?? "",
  };
}

function getAverageRating(
  review: ReviewItem
) {
  const values =
    Object.values(
      review.categories
    );

  return (
    values.reduce(
      (
        sum,
        value
      ) =>
        sum + value,
      0
    ) /
    values.length
  );
}

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

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/reviews?housingId=${encodeURIComponent(
              apartmentId
            )}`,
            {
              cache: "no-store",
            }
          );

        const result =
          (await response.json()) as
            | ReviewApiResponse
            | {
                error?: string;
                details?: string;
              };

        if (!response.ok) {
          const errorResult =
            result as {
              error?: string;
              details?: string;
            };

          throw new Error(
            errorResult.details ||
              errorResult.error ||
              "Failed to load reviews."
          );
        }

        const reviewResult =
          result as ReviewApiResponse;

        const mapped =
          (
            reviewResult.reviews ??
            []
          ).map(
            mapReviewRow
          );

        if (cancelled) {
          return;
        }

        setReviews(mapped);

        onReviewCountChange?.(
          mapped.length
        );

        onReviewsLoaded?.(
          mapped
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "ReviewSection load error:",
          err
        );

        setReviews([]);

        onReviewCountChange?.(
          0
        );

        onReviewsLoaded?.(
          []
        );

        setError(
          err instanceof Error
            ? err.message
            : "Could not load reviews right now."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [
    apartmentId,
    onReviewCountChange,
    onReviewsLoaded,
  ]);

  const sortedReviews =
    useMemo(() => {
      const copied = [
        ...reviews,
      ];

      if (
        sortBy === "highest"
      ) {
        return copied.sort(
          (a, b) =>
            getAverageRating(
              b
            ) -
            getAverageRating(
              a
            )
        );
      }

      if (
        sortBy === "lowest"
      ) {
        return copied.sort(
          (a, b) =>
            getAverageRating(
              a
            ) -
            getAverageRating(
              b
            )
        );
      }

      return copied.sort(
        (a, b) =>
          new Date(
            b.date
          ).getTime() -
          new Date(
            a.date
          ).getTime()
      );
    }, [
      reviews,
      sortBy,
    ]);

  async function handleReaction(
    reviewId: number,
    action:
      | "like"
      | "dislike"
  ) {
    try {
      const response =
        await fetch(
          `/api/reviews/${reviewId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                action,
              }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to update reaction."
        );
      }

      const updated =
        result as {
          id: number;
          likes:
            | number
            | null;
          dislikes:
            | number
            | null;
        };

      setReviews(
        (
          currentReviews
        ) => {
          const nextReviews =
            currentReviews.map(
              (
                review
              ) =>
                review.id ===
                reviewId
                  ? {
                      ...review,

                      likes:
                        Number(
                          updated.likes ??
                            0
                        ),

                      dislikes:
                        Number(
                          updated.dislikes ??
                            0
                        ),
                    }
                  : review
            );

          onReviewsLoaded?.(
            nextReviews
          );

          return nextReviews;
        }
      );
    } catch (err) {
      console.error(
        "Review reaction error:",
        err
      );
    }
  }

  return (
    <section className="mt-12">

      {/* Header */}
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
            value={sortBy}
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
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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

      {/* Loading */}
      {loading && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">
            Loading reviews...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading &&
        error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">

            <p className="font-semibold text-red-800">
              Could not load reviews
            </p>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {error}
            </p>

          </div>
        )}

      {/* Empty */}
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
              Be the first student to share an experience for this housing property.
            </p>

          </div>
        )}

      {/* Reviews */}
      {!loading &&
        !error &&
        sortedReviews.length >
          0 && (
          <div className="mt-6 space-y-6">

            {sortedReviews.map(
              (
                review
              ) => {
                const avg =
                  getAverageRating(
                    review
                  );

                return (
                  <article
                    key={
                      review.id
                    }
                    className={`rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                      review.isExternalSummary
                        ? "border-blue-200"
                        : "border-slate-200"
                    }`}
                  >

                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">

                      <div className="flex items-start gap-4">

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                            review.isExternalSummary
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
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

                            {review.isExternalSummary && (
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                External Review Summary
                              </span>
                            )}

                          </div>

                          {review.isExternalSummary ? (
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              Based on{" "}
                              {review.sourceName ||
                                "public review sources"}
                            </p>
                          ) : (
                            <p className="mt-1 text-sm text-slate-500">
                              Verified CHUD account
                            </p>
                          )}

                          <p className="mt-1 text-sm text-slate-500">
                            {
                              review.date
                            }
                          </p>

                        </div>

                      </div>

                      <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
                        ★{" "}
                        {avg.toFixed(
                          1
                        )}{" "}
                        / 5
                      </div>

                    </div>

                    {/* Summary notice */}
                    {review.isExternalSummary && (
                      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

                        <p className="text-sm leading-6 text-blue-900">
                          This is a CHUD summary of recurring themes found in
                          public review sources. It is not a review submitted
                          directly by a CHUD user.
                        </p>

                      </div>
                    )}

                    {/* Comment */}
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

                    {/* Recommendation */}
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

                    {/* Pros and cons */}
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

                    {/* Category ratings */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                      {Object.entries(
                        review.categories
                      ).map(
                        ([
                          key,
                          value,
                        ]) => (
                          <div
                            key={key}
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

                    {/* Source */}
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

                    {/* Reactions */}
                    {!review.isExternalSummary && (
                      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">

                        <button
                          type="button"
                          onClick={() =>
                            handleReaction(
                              review.id,
                              "like"
                            )
                          }
                          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          👍{" "}
                          {
                            review.likes
                          }
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleReaction(
                              review.id,
                              "dislike"
                            )
                          }
                          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          👎{" "}
                          {
                            review.dislikes
                          }
                        </button>

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