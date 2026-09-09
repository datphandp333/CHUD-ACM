"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { utaHousing } from "@/app/data/utaHousing";
import { supabase } from "@/app/lib/supabase";
import type { HousingItem } from "@/app/lib/mapBuilding";

type ReviewCategories = {
  overall: number;
  value: number;
  safety: number;
  noise: number;
  maintenance: number;
  management: number;
  cleanliness: number;
  amenities: number;
  internet: number;
  studyFriendly: number;
};

type SavedReview = {
  id: number;
  user: string;
  date: string;
  comment: string;
  likes: number;
  dislikes: number;
  apartmentId: string;
  apartmentName: string;
  pros: string;
  cons: string;
  wouldRecommend: boolean;
  categories: ReviewCategories;
};

type SubmittedReviewApiRow = {
  id?: number;
  user_name?: string;
  user?: string;
  review_date?: string;
  date?: string;
  comment?: string;
  likes?: number;
  dislikes?: number;
  housing_slug?: string;
  apartmentId?: string;
  housing_name?: string;
  apartmentName?: string;
  pros?: string;
  cons?: string;
  would_recommend?: boolean;
  wouldRecommend?: boolean;
  overall?: number;
  value?: number;
  safety?: number;
  noise?: number;
  maintenance?: number;
  management?: number;
  cleanliness?: number;
  amenities?: number;
  internet?: number;
  study_friendly?: number;
  categories?: Partial<ReviewCategories>;
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

function getTodayFormatted() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeHousingItem(item: Record<string, unknown>): HousingItem {
  const categoryValue =
    item.category === "apartment" || item.category === "residence-hall"
      ? item.category
      : String(item.type ?? "").toLowerCase().includes("apartment")
      ? "apartment"
      : "residence-hall";

  return {
    id: String(item.slug ?? item.id ?? ""),
    name: String(item.name ?? "Unknown Housing"),
    category: categoryValue,
    source: String(item.source ?? "Off Campus"),
    address: String(item.address ?? "UTA area"),
    shortLocation: String(
      item.shortLocation ?? item.short_location ?? item.location ?? "Near UTA"
    ),
    description: String(item.description ?? "No description available."),
    image: String(item.image ?? ""),
    priceLevel: String(item.priceLevel ?? item.price_level ?? "$$"),
    officialFeatures: Array.isArray(item.officialFeatures)
      ? (item.officialFeatures as string[])
      : Array.isArray(item.official_features)
      ? (item.official_features as string[])
      : [],
    tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
    officialUrl: String(item.officialUrl ?? item.official_url ?? ""),
    rating: Number(item.rating ?? 0),
    reviewCount: Number(item.reviewCount ?? item.review_count ?? 0),
    distanceFromUTA: String(
      item.distanceFromUTA ?? item.distance_from_uta ?? "Not listed"
    ),
  };
}

function mapSubmittedReview(item: SubmittedReviewApiRow): SavedReview {
  const categories: ReviewCategories = {
    overall: Number(item.overall ?? item.categories?.overall ?? 0),
    value: Number(item.value ?? item.categories?.value ?? 0),
    safety: Number(item.safety ?? item.categories?.safety ?? 0),
    noise: Number(item.noise ?? item.categories?.noise ?? 0),
    maintenance: Number(item.maintenance ?? item.categories?.maintenance ?? 0),
    management: Number(item.management ?? item.categories?.management ?? 0),
    cleanliness: Number(item.cleanliness ?? item.categories?.cleanliness ?? 0),
    amenities: Number(item.amenities ?? item.categories?.amenities ?? 0),
    internet: Number(item.internet ?? item.categories?.internet ?? 0),
    studyFriendly: Number(
      item.study_friendly ?? item.categories?.studyFriendly ?? 0
    ),
  };

  return {
    id: Number(item.id ?? Date.now()),
    user: String(item.user_name ?? item.user ?? ""),
    date: formatReviewDate(String(item.review_date ?? item.date ?? "")),
    comment: String(item.comment ?? ""),
    likes: Number(item.likes ?? 0),
    dislikes: Number(item.dislikes ?? 0),
    apartmentId: String(item.housing_slug ?? item.apartmentId ?? ""),
    apartmentName: String(item.housing_name ?? item.apartmentName ?? ""),
    pros: String(item.pros ?? ""),
    cons: String(item.cons ?? ""),
    wouldRecommend: Boolean(item.would_recommend ?? item.wouldRecommend),
    categories,
  };
}

function RatingSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500"
      >
        <option value={5}>5 - Excellent</option>
        <option value={4}>4 - Good</option>
        <option value={3}>3 - Average</option>
        <option value={2}>2 - Poor</option>
        <option value={1}>1 - Very Bad</option>
      </select>
    </div>
  );
}

export default function WriteReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const idFromQuery = searchParams.get("id") || "";
  const apartmentFromQuery = searchParams.get("apartment") || "";

  const getInitialHousingId = () => {
    if (idFromQuery) {
      const matchedById = utaHousing.find((item) => item.id === idFromQuery);
      if (matchedById) return matchedById.id;
    }
    if (apartmentFromQuery) {
      const matchedByName = utaHousing.find(
        (item) => item.name.toLowerCase() === apartmentFromQuery.toLowerCase()
      );
      if (matchedByName) return matchedByName.id;
    }
    return utaHousing[0]?.id ?? "";
  };

  const [name, setName] = useState("");
  const [housingId, setHousingId] = useState("");
  const [comment, setComment] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);

  const [overall, setOverall] = useState(5);
  const [value, setValue] = useState(5);
  const [safety, setSafety] = useState(5);
  const [noise, setNoise] = useState(5);
  const [maintenance, setMaintenance] = useState(5);
  const [management, setManagement] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [amenities, setAmenities] = useState(5);
  const [internet, setInternet] = useState(5);
  const [studyFriendly, setStudyFriendly] = useState(5);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submittedReview, setSubmittedReview] = useState<SavedReview | null>(null);
  const [loadingHousing, setLoadingHousing] = useState(false);
  const [housingLoadError, setHousingLoadError] = useState("");
  const [housingOptions, setHousingOptions] = useState<HousingItem[]>([]);

  // Auth check — redirect to login if not logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login?redirect=/write-review");
      }
    });
  }, [router]);

  useEffect(() => {
    async function loadHousing() {
      try {
        setLoadingHousing(true);
        setHousingLoadError("");

        const response = await fetch("/api/browse-housing", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load housing options.");
        }

        const data = (await response.json()) as Record<string, unknown>[];
        const mapped = data.map(normalizeHousingItem);

        setHousingOptions(mapped);

        if (idFromQuery) {
          const matchedById = mapped.find((item) => item.id === idFromQuery);
          if (matchedById) {
            setHousingId(matchedById.id);
            return;
          }
        }

        if (apartmentFromQuery) {
          const normalizedApartment = normalizeText(apartmentFromQuery);

          const matchedByName = mapped.find(
            (item) => normalizeText(item.name) === normalizedApartment
          );

          if (matchedByName) {
            setHousingId(matchedByName.id);
            return;
          }
        }

        if (mapped.length > 0) {
          setHousingId(mapped[0].id);
        }
      } catch (err) {
        console.error("WriteReviewPage load error:", err);
        setHousingOptions([]);
        setHousingLoadError("Could not load housing options right now.");
      } finally {
        setLoadingHousing(false);
      }
    }

    loadHousing();
  }, [idFromQuery, apartmentFromQuery]);

  const selectedHousing = useMemo(() => {
    return housingOptions.find((item) => item.id === housingId) ?? null;
  }, [housingOptions, housingId]);

  const averageScore = useMemo(() => {
    const values = [overall, value, safety, noise, maintenance, management, cleanliness, amenities, internet, studyFriendly];
    return values.reduce((sum, item) => sum + item, 0) / values.length;
  }, [overall, value, safety, noise, maintenance, management, cleanliness, amenities, internet, studyFriendly]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    if (!name.trim() || !comment.trim()) {
      setError("Please fill out your name and main review comment.");
      setSubmitted(false);
      setSubmitting(false);
      return;
    }

    if (!selectedHousing) {
      setError("Please choose a housing option.");
      setSubmitted(false);
      setSubmitting(false);
      return;
    }

    // Look up Supabase building UUID by name and insert review
    const { data: buildingData } = await supabase
      .from("buildings")
      .select("id")
      .eq("name", selectedHousing.name)
      .single();

    if (buildingData) {
      await supabase.from("ratingauth").insert([{
        listing_id: buildingData.id,
        reviewer_name: name.trim(),
        score: overall,
        comment: comment.trim(),
      }]);

      await supabase.from("ratings").insert([{
        building_id: buildingData.id,
        reviewer_name: name.trim(),
        cleanliness,
        noise,
        entertainment: amenities,
        overall,
      }]);
    }

    // Post to reviews table so it shows on the detail page
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        housingSlug: selectedHousing.id,
        housingName: selectedHousing.name,
        userName: name.trim(),
        comment: comment.trim(),
        pros: pros.trim(),
        cons: cons.trim(),
        wouldRecommend,
        categories: { overall, noise, cleanliness, amenities },
      }),
    });

    // Save to localStorage for local display
    const storageKey = `reviews-${selectedHousing.id}`;
    const existingReviews = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as SavedReview[];

    const newReview: SavedReview = {
      id: Date.now(),
      user: name.trim(),
      date: getTodayFormatted(),
      comment: comment.trim(),
      likes: 0,
      dislikes: 0,
      apartmentId: selectedHousing.id,
      apartmentName: selectedHousing.name,
      pros: pros.trim(),
      cons: cons.trim(),
      wouldRecommend,
      categories: { overall, value, safety, noise, maintenance, management, cleanliness, amenities, internet, studyFriendly },
    };

    localStorage.setItem(storageKey, JSON.stringify([newReview, ...existingReviews]));

    setSubmittedReview(newReview);
    setSubmitted(true);
    setError("");
    setSubmitting(false);
    setName("");
    setComment("");
    setPros("");
    setCons("");
    setWouldRecommend(true);
    setOverall(5); setValue(5); setSafety(5); setNoise(5);
    setMaintenance(5); setManagement(5); setCleanliness(5);
    setAmenities(5); setInternet(5); setStudyFriendly(5);
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-28">
      <section className="mx-auto max-w-4xl px-6 pb-14">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Write a Review
          </p>

          <h1 className="mt-2 text-3xl font-bold text-blue-900 md:text-5xl">
            Share your housing experience
          </h1>

          <p className="mt-3 text-slate-600">
            Leave a detailed review so other students can compare housing choices more accurately.
          </p>

          {submitted && submittedReview && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Your review for{" "}
              <span className="font-semibold">
                {submittedReview.apartmentName}
              </span>{" "}
              was submitted successfully.
            </div>
          )}

          {housingLoadError && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {housingLoadError}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div>
              <label
                htmlFor="reviewerName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Your Name
              </label>
              <input
                id="reviewerName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="housing" className="mb-2 block text-sm font-medium text-slate-700">
                Housing Option
              </label>
              <select
                id="housing"
                value={housingId}
                onChange={(e) => setHousingId(e.target.value)}
                disabled={loadingHousing || housingOptions.length === 0}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
              >
                {loadingHousing ? (
                  <option value="">Loading housing options...</option>
                ) : housingOptions.length === 0 ? (
                  <option value="">No housing options available</option>
                ) : (
                  housingOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-blue-900">Category Ratings</h2>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Current Average: {averageScore.toFixed(1)} / 5
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <RatingSelect id="overall" label="Overall Rating" value={overall} onChange={setOverall} />
                <RatingSelect id="noise" label="Noise Level" value={noise} onChange={setNoise} />
                <RatingSelect id="cleanliness" label="Cleanliness" value={cleanliness} onChange={setCleanliness} />
                <RatingSelect id="entertainment" label="Entertainment" value={amenities} onChange={setAmenities} />
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="mb-2 block text-sm font-medium text-slate-700">
                Full Review
              </label>
              <textarea
                id="comment"
                rows={6}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your overall thoughts about this housing option..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || loadingHousing || !selectedHousing}
              className="inline-flex rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {submittedReview && (
          <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Submitted Review Preview
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-blue-900">
                  {submittedReview.apartmentName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {submittedReview.date}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                Avg {((Object.values(submittedReview.categories) as number[]).reduce((sum, v) => sum + v, 0) / Object.values(submittedReview.categories).length).toFixed(1)} / 5
              </div>
            </div>

            <p className="mt-4 font-semibold text-slate-800">{submittedReview.user}</p>
            <p className="mt-3 text-sm text-slate-500">
              Would Recommend: {submittedReview.wouldRecommend ? "Yes" : "No"}
            </p>

            {submittedReview.pros && (
              <p className="mt-4 text-slate-700">
                <span className="font-semibold">Pros:</span> {submittedReview.pros}
              </p>
            )}

            {submittedReview.cons && (
              <p className="mt-2 text-slate-700">
                <span className="font-semibold">Cons:</span> {submittedReview.cons}
              </p>
            )}

            <p className="mt-4 leading-8 text-slate-600">{submittedReview.comment}</p>
          </div>
        )}
      </section>
    </main>
  );
}