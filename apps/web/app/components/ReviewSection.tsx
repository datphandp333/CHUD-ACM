"use client";

import { useEffect, useMemo, useState } from "react";

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
  likes?: number;
  dislikes?: number;
  pros?: string;
  cons?: string;
  wouldRecommend?: boolean;
  categories?: ReviewCategories;
};

type ReviewSectionProps = {
  apartmentId: string;
  onReviewCountChange?: React.Dispatch<React.SetStateAction<number>>;
  onReviewsLoaded?: (reviews: ReviewItem[]) => void;
};

type ReviewApiRow = {
  id: number;
  user_name: string;
  review_date: string;
  comment: string;
  likes: number | null;
  dislikes: number | null;
  pros: string | null;
  cons: string | null;
  would_recommend: boolean | null;
  overall: number;
  value: number;
  safety: number;
  noise: number;
  maintenance: number;
  management: number;
  cleanliness: number;
  amenities: number;
  internet: number;
  study_friendly: number;
};

function formatReviewDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function mapReviewRow(row: ReviewApiRow): ReviewItem {
  return {
    id: row.id,
    user: row.user_name,
    date: formatReviewDate(row.review_date),
    comment: row.comment ?? "",
    categories: {
      overall: Number(row.overall),
      noise: Number(row.noise),
      cleanliness: Number(row.cleanliness),
      amenities: Number(row.amenities)
    },
  };
}

function getAverageRating(review: ReviewItem): number | null {
  if (!review.categories) return null;

  const values = Object.values(review.categories);
  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function ReviewSection({
  apartmentId,
  onReviewCountChange,
  onReviewsLoaded,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/reviews?housingId=${encodeURIComponent(apartmentId)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Failed to load reviews");
        }

        const data = (await response.json()) as ReviewApiRow[];
        const mapped = data.map(mapReviewRow);

        if (cancelled) return;

        setReviews(mapped);
        onReviewCountChange?.(mapped.length);
        onReviewsLoaded?.(mapped);
      } catch (err) {
        if (cancelled) return;

        console.error("ReviewSection load error:", err);
        setReviews([]);
        onReviewCountChange?.(0);
        onReviewsLoaded?.([]);
        setError("Could not load reviews right now.");
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
  }, [apartmentId, onReviewCountChange, onReviewsLoaded]);

  const sortedReviews = useMemo(() => {
    const copied = [...reviews];

    if (sortBy === "newest") {
      return copied.sort((a, b) => {
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        return bTime - aTime;
      });
    }

    if (sortBy === "highest") {
      return copied.sort(
        (a, b) => (getAverageRating(b) ?? 0) - (getAverageRating(a) ?? 0)
      );
    }

    return copied.sort(
      (a, b) => (getAverageRating(a) ?? 0) - (getAverageRating(b) ?? 0)
    );
  }, [reviews, sortBy]);

  const handleReaction = async (
    reviewId: number,
    action: "like" | "dislike"
  ) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reaction");
      }

      const updated = (await response.json()) as {
        id: number;
        likes: number | null;
        dislikes: number | null;
      };

      setReviews((currentReviews) => {
        const nextReviews = currentReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                likes: Number(updated.likes ?? 0),
                dislikes: Number(updated.dislikes ?? 0),
              }
            : review
        );

        onReviewsLoaded?.(nextReviews);
        return nextReviews;
      });
    } catch (err) {
      console.error("Review reaction error:", err);
    }
  };

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-blue-900">Student Reviews</h2>

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
            onChange={(e) =>
              setSortBy(e.target.value as "newest" | "highest" | "lowest")
            }
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Loading reviews...
        </div>
      ) : error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      ) : sortedReviews.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          No reviews yet. Be the first to leave one.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {sortedReviews.map((review) => {
            const avg = getAverageRating(review);

            return (
              <article
                key={review.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {review.user}
                    </h3>
                    <p className="text-sm text-slate-500">{review.date}</p>
                  </div>

                  {avg !== null && (
                    <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                      {avg.toFixed(1)} / 5
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Full Review
                  </p>
                  <p className="mt-2 leading-7 text-slate-700">
                    {review.comment || "No comment provided."}
                  </p>
                </div>

                {typeof review.wouldRecommend === "boolean" && (
                  <p className="mt-4 text-sm text-slate-600">
                    Would recommend:{" "}
                    <span className="font-semibold text-slate-800">
                      {review.wouldRecommend ? "Yes" : "No"}
                    </span>
                  </p>
                )}

                {(review.pros || review.cons) && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {review.pros && (
                      <div className="rounded-2xl bg-green-50 p-4">
                        <p className="text-sm font-semibold text-green-800">
                          Pros
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {review.pros}
                        </p>
                      </div>
                    )}

                    {review.cons && (
                      <div className="rounded-2xl bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-800">
                          Cons
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {review.cons}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {review.categories && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(review.categories).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <span className="block capitalize text-slate-500">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {value}/5
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleReaction(review.id, "like")}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    👍 {Number(review.likes ?? 0)}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReaction(review.id, "dislike")}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    👎 {Number(review.dislikes ?? 0)}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}