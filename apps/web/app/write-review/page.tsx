"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import type {
  User,
} from "@supabase/supabase-js";

import {
  supabase,
} from "@/app/lib/supabase";

import {
  getUserDisplayName,
} from "@/app/lib/auth";

type Housing = {
  id: string;
  slug: string;
  name: string;
  category: string;
  address: string;
  shortLocation: string;
  image: string;
};

function resolveImageSrc(
  housing: Housing
) {
  if (
    housing.image
  ) {
    return housing.image.startsWith(
      "/"
    )
      ? housing.image
      : `/${housing.image}`;
  }

  return "/UTA-Logo.png";
}

export default function WriteReviewPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const initialSlug =
    searchParams.get(
      "housing"
    ) ??
    searchParams.get(
      "id"
    ) ??
    "";

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    authLoading,
    setAuthLoading,
  ] =
    useState(true);

  const [
    housing,
    setHousing,
  ] =
    useState<
      Housing[]
    >([]);

  const [
    housingLoading,
    setHousingLoading,
  ] =
    useState(true);

  const [
    selectedSlug,
    setSelectedSlug,
  ] =
    useState(
      initialSlug
    );

  const [
    overall,
    setOverall,
  ] =
    useState(5);

  const [
    noise,
    setNoise,
  ] =
    useState(5);

  const [
    cleanliness,
    setCleanliness,
  ] =
    useState(5);

  const [
    amenities,
    setAmenities,
  ] =
    useState(5);

  const [
    comment,
    setComment,
  ] =
    useState("");

  const [
    pros,
    setPros,
  ] =
    useState("");

  const [
    cons,
    setCons,
  ] =
    useState("");

  const [
    wouldRecommend,
    setWouldRecommend,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  useEffect(() => {
    let mounted =
      true;

    async function loadUser() {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (!user) {
        const destination =
          initialSlug
            ? `/write-review?id=${initialSlug}`
            : "/write-review";

        router.replace(
          `/login?redirect=${encodeURIComponent(
            destination
          )}`
        );

        return;
      }

      setUser(user);
      setAuthLoading(false);
    }

    loadUser();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          if (
            !session?.user
          ) {
            router.replace(
              "/login?redirect=/write-review"
            );

            return;
          }

          setUser(
            session.user
          );

          setAuthLoading(
            false
          );
        }
      );

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, [
    router,
    initialSlug,
  ]);

  useEffect(() => {
    async function loadHousing() {
      try {
        setHousingLoading(
          true
        );

        const response =
          await fetch(
            "/api/browse-housing",
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
            result?.error ||
              "Unable to load housing."
          );
        }

        const normalized: Housing[] =
          Array.isArray(
            result
          )
            ? result.map(
                (
                  item
                ) => ({
                  id:
                    String(
                      item.id ??
                        ""
                    ),

                  slug:
                    String(
                      item.id ??
                        item.slug ??
                        ""
                    ),

                  name:
                    String(
                      item.name ??
                        "Unknown Housing"
                    ),

                  category:
                    String(
                      item.category ??
                        ""
                    ),

                  address:
                    String(
                      item.address ??
                        ""
                    ),

                  shortLocation:
                    String(
                      item.shortLocation ??
                        item.short_location ??
                        "Near UTA"
                    ),

                  image:
                    String(
                      item.image ??
                        ""
                    ),
                })
              )
            : [];

        setHousing(
          normalized
        );

        if (
          initialSlug &&
          normalized.some(
            (
              item
            ) =>
              item.slug ===
              initialSlug
          )
        ) {
          setSelectedSlug(
            initialSlug
          );
        } else if (
          normalized.length >
            0 &&
          !selectedSlug
        ) {
          setSelectedSlug(
            normalized[0].slug
          );
        }
      } catch (error) {
        console.error(
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load housing."
        );
      } finally {
        setHousingLoading(
          false
        );
      }
    }

    loadHousing();
  }, [
    initialSlug,
    selectedSlug,
  ]);

  const selectedHousing =
    useMemo(
      () =>
        housing.find(
          (
            property
          ) =>
            property.slug ===
            selectedSlug
        ) ??
        null,
      [
        housing,
        selectedSlug,
      ]
    );

  const reviewerName =
    useMemo(() => {
      if (!user) {
        return "";
      }

      const fullName =
        typeof user.user_metadata
          ?.full_name ===
        "string"
          ? user.user_metadata.full_name
          : null;

      return getUserDisplayName(
        fullName,
        user.email
      );
    }, [
      user,
    ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !selectedHousing
    ) {
      setError(
        "Please choose a housing property."
      );

      return;
    }

    if (
      comment.trim().length <
      10
    ) {
      setError(
        "Please write at least 10 characters about your experience."
      );

      return;
    }

    setSubmitting(
      true
    );

    try {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Your session expired. Please log in again."
        );
      }

      const response =
        await fetch(
          "/api/reviews",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify(
                {
                  housingSlug:
                    selectedHousing.slug,

                  housingName:
                    selectedHousing.name,

                  overall,

                  noise,

                  cleanliness,

                  amenities,

                  comment:
                    comment.trim(),

                  pros:
                    pros.trim(),

                  cons:
                    cons.trim(),

                  wouldRecommend,
                }
              ),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result?.details ||
            result?.error ||
            "Unable to submit your review."
        );
      }

      setSuccess(
        "Your review has been published!"
      );

      setTimeout(
        () => {
          router.push(
            `/housing/${selectedHousing.slug}`
          );
        },
        1000
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit your review."
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  if (
    authLoading
  ) {
    return (
      <main className="min-h-screen bg-slate-50 pt-28">

        <div className="mx-auto max-w-6xl px-6 py-20 text-center">

          <p className="text-slate-500">
            Checking your account...
          </p>

        </div>

      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pt-20">

      {/* HEADER */}
      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">

          <Link
            href={
              selectedHousing
                ? `/housing/${selectedHousing.slug}`
                : "/browse-housing"
            }
            className="text-sm font-bold text-blue-700 hover:underline"
          >
            ← Back to housing
          </Link>

          <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
            Student Review
          </p>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Share your experience
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Your feedback can help another UTA student understand what living
            here is actually like.
          </p>

        </div>

      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_350px] lg:px-8">

        {/* FORM */}
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-8"
        >

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              ✓ {success}
            </div>
          )}

          {/* PROPERTY */}
          <FormCard
            number="1"
            title="Choose the property"
            description="Tell us which housing option you are reviewing."
          >

            <select
              value={
                selectedSlug
              }
              onChange={(
                event
              ) =>
                setSelectedSlug(
                  event.target.value
                )
              }
              disabled={
                housingLoading
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >

              <option value="">
                Select housing
              </option>

              {housing.map(
                (
                  property
                ) => (
                  <option
                    key={
                      property.slug
                    }
                    value={
                      property.slug
                    }
                  >
                    {
                      property.name
                    }
                  </option>
                )
              )}

            </select>

          </FormCard>

          {/* RATINGS */}
          <FormCard
            number="2"
            title="Rate your experience"
            description="Give other students a quick picture of what living here was like."
          >

            <RatingRow
              title="Overall"
              subtitle="Your overall housing experience"
              value={
                overall
              }
              onChange={
                setOverall
              }
            />

            <RatingRow
              title="Cleanliness"
              subtitle="Condition of rooms and common areas"
              value={
                cleanliness
              }
              onChange={
                setCleanliness
              }
            />

            <RatingRow
              title="Noise"
              subtitle="Your experience with noise levels"
              value={
                noise
              }
              onChange={
                setNoise
              }
            />

            <RatingRow
              title="Amenities"
              subtitle="Quality and usefulness of amenities"
              value={
                amenities
              }
              onChange={
                setAmenities
              }
            />

          </FormCard>

          {/* REVIEW */}
          <FormCard
            number="3"
            title="Tell students what it was like"
            description="Specific and balanced reviews are usually the most helpful."
          >

            <textarea
              value={
                comment
              }
              onChange={(
                event
              ) =>
                setComment(
                  event.target.value
                )
              }
              rows={
                7
              }
              maxLength={
                3000
              }
              placeholder="What was your experience with the location, management, maintenance, parking, roommates, safety, or overall atmosphere?"
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-4 leading-7 text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {comment.length}/3000
            </p>

          </FormCard>

          {/* PROS / CONS */}
          <FormCard
            number="4"
            title="What stood out?"
            description="Highlight the best parts and anything students should know beforehand."
          >

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="font-bold text-emerald-700">
                  Pros
                </label>

                <textarea
                  value={
                    pros
                  }
                  onChange={(
                    event
                  ) =>
                    setPros(
                      event.target.value
                    )
                  }
                  rows={
                    4
                  }
                  placeholder="Close to campus, good amenities..."
                  className="mt-3 w-full resize-none rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />

              </div>

              <div>

                <label className="font-bold text-red-700">
                  Cons
                </label>

                <textarea
                  value={
                    cons
                  }
                  onChange={(
                    event
                  ) =>
                    setCons(
                      event.target.value
                    )
                  }
                  rows={
                    4
                  }
                  placeholder="Parking, weekend noise..."
                  className="mt-3 w-full resize-none rounded-xl border border-red-200 bg-red-50/40 px-4 py-4 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />

              </div>

            </div>

          </FormCard>

          {/* RECOMMEND */}
          <FormCard
            number="5"
            title="Would you recommend it?"
            description="Would you tell another UTA student to consider living here?"
          >

            <div className="grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setWouldRecommend(
                    true
                  )
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  wouldRecommend
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-blue-200"
                }`}
              >

                <p className="text-xl">
                  👍
                </p>

                <p className="mt-3 font-extrabold text-slate-950">
                  Yes, I would
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  I would recommend this property.
                </p>

              </button>

              <button
                type="button"
                onClick={() =>
                  setWouldRecommend(
                    false
                  )
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  !wouldRecommend
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-blue-200"
                }`}
              >

                <p className="text-xl">
                  👎
                </p>

                <p className="mt-3 font-extrabold text-slate-950">
                  Probably not
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  I would choose another option.
                </p>

              </button>

            </div>

          </FormCard>

          {/* SUBMIT */}
          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={
                submitting ||
                !selectedHousing
              }
              className="rounded-xl bg-blue-700 px-8 py-4 font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Publishing review..."
                : "Publish Review"}
            </button>

            {selectedHousing && (
              <Link
                href={`/housing/${selectedHousing.slug}`}
                className="rounded-xl border border-slate-300 bg-white px-8 py-4 text-center font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
            )}

          </div>

        </form>

        {/* SIDEBAR */}
        <aside>

          <div className="sticky top-28 space-y-5">

            {selectedHousing && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="relative h-44">

                  <Image
                    src={resolveImageSrc(
                      selectedHousing
                    )}
                    alt={
                      selectedHousing.name
                    }
                    fill
                    className="object-cover"
                    sizes="350px"
                  />

                </div>

                <div className="p-5">

                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Reviewing
                  </p>

                  <h2 className="mt-2 text-xl font-extrabold text-slate-950">
                    {selectedHousing.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {selectedHousing.address}
                  </p>

                </div>

              </div>
            )}

            {/* USER */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Posting as
              </p>

              <div className="mt-4 flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-lg font-extrabold text-white">
                  {reviewerName
                    .charAt(
                      0
                    )
                    .toUpperCase()}
                </div>

                <div className="min-w-0">

                  <p className="truncate font-extrabold text-slate-950">
                    {reviewerName}
                  </p>

                  {user.email &&
                    reviewerName !==
                      user.email && (
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {user.email}
                      </p>
                    )}

                </div>

              </div>

            </div>

            {/* TIPS */}
            <div className="rounded-3xl bg-slate-950 p-6 text-white">

              <p className="text-lg font-extrabold">
                Write a helpful review
              </p>

              <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">

                <Tip>
                  Be specific about your actual experience.
                </Tip>

                <Tip>
                  Include both positives and negatives.
                </Tip>

                <Tip>
                  Avoid personal information about roommates or staff.
                </Tip>

                <Tip>
                  Focus on facts another student would find useful.
                </Tip>

              </div>

            </div>

          </div>

        </aside>

      </section>

    </main>
  );
}

function FormCard({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      <div className="flex gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 font-extrabold text-white">
          {number}
        </div>

        <div>

          <h2 className="text-xl font-extrabold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>

        </div>

      </div>

      <div className="mt-6">
        {children}
      </div>

    </section>
  );
}

function RatingRow({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: number;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 py-5 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">

      <div>

        <p className="font-extrabold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>

      </div>

      <div className="flex gap-2">

        {[1, 2, 3, 4, 5].map(
          (
            rating
          ) => (
            <button
              key={
                rating
              }
              type="button"
              onClick={() =>
                onChange(
                  rating
                )
              }
              aria-label={`${rating} stars`}
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition ${
                rating <=
                value
                  ? "bg-amber-100 text-amber-500"
                  : "bg-slate-100 text-slate-300 hover:bg-slate-200"
              }`}
            >
              ★
            </button>
          )
        )}

      </div>

    </div>
  );
}

function Tip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">

      <span className="font-bold text-blue-300">
        ✓
      </span>

      <p>
        {children}
      </p>

    </div>
  );
}