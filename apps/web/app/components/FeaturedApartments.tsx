"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

type HousingItem = {
  id: string;
  name: string;
  category: "apartment" | "residence-hall";
  address: string;
  shortLocation: string;
  description: string;
  image: string;
  priceLevel: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  distanceFromUTA: string;
};

function normalizeText(
  value:
    | string
    | null
    | undefined
) {
  return (
    value ?? ""
  )
    .trim()
    .toLowerCase();
}

function resolveImageSrc(
  apartment: HousingItem
) {
  const rawImage =
    apartment.image.trim();

  const id =
    normalizeText(
      apartment.id
    );

  const name =
    normalizeText(
      apartment.name
    );

  const imageMap:
    Record<
      string,
      string
    > = {
    "the-arlie":
      "/the-arlie1.jpg",

    "the arlie":
      "/the-arlie1.jpg",

    "campus-edge":
      "/campus-edge1.jpg",

    "campus edge":
      "/campus-edge1.jpg",

    "liv-plus":
      "/liv-plus1.jpg",

    "liv+ arlington":
      "/liv-plus1.jpg",

    "arbor-oaks":
      "/Arbor-Oaks1.jpg",

    "arbor oaks":
      "/Arbor-Oaks1.jpg",

    "arlington-hall":
      "/Arlington_Hall.png",

    "arlington hall":
      "/Arlington_Hall.png",

    "kc-hall":
      "/KC_Hall.png",

    "kc hall":
      "/KC_Hall.png",

    "maverick-hall":
      "/MavHallBlock.png",

    "maverick hall":
      "/MavHallBlock.png",

    "meadow-run":
      "/Meadow_Run.png",

    "meadow run":
      "/Meadow_Run.png",

    "the-lofts":
      "/The-Lofts.jpeg",

    "the lofts":
      "/The-Lofts.jpeg",

    "heights-on-pecan":
      "/Pecan1.jpeg",

    "the heights on pecan":
      "/Pecan1.jpeg",

    "timber-brook":
      "/Timber Brook.png",

    "timber brook":
      "/Timber Brook.png",

    "university-village":
      "/University_Village.png",

    "university village":
      "/University_Village.png",

    "vandergriff-hall":
      "/vandergriffsite.jpeg",

    "vandergriff hall":
      "/vandergriffsite.jpeg",

    "west-hall":
      "/West-Hall.jpg",

    "west hall":
      "/West-Hall.jpg",
  };

  if (rawImage) {
    return rawImage.startsWith(
      "/"
    )
      ? rawImage
      : `/${rawImage}`;
  }

  return (
    imageMap[id] ||
    imageMap[name] ||
    "/UTA-Logo.png"
  );
}

function normalizeHousingItem(
  item:
    Record<
      string,
      unknown
    >
): HousingItem {
  const rawCategory =
    String(
      item.category ??
        item.type ??
        ""
    ).toLowerCase();

  const category:
    | "apartment"
    | "residence-hall" =
    rawCategory.includes(
      "apartment"
    )
      ? "apartment"
      : "residence-hall";

  return {
    id:
      String(
        item.slug ??
          item.id ??
          ""
      ),

    name:
      String(
        item.name ??
          "Unknown Housing"
      ),

    category,

    address:
      String(
        item.address ??
          "UTA area"
      ),

    shortLocation:
      String(
        item.short_location ??
          item.shortLocation ??
          item.location ??
          "Near UTA"
      ),

    description:
      String(
        item.description ??
          "Housing information is not available yet."
      ),

    image:
      String(
        item.image ??
          ""
      ),

    priceLevel:
      String(
        item.price_level ??
          item.priceLevel ??
          "$$"
      ),

    tags:
      Array.isArray(
        item.tags
      )
        ? (
            item.tags as string[]
          )
        : [],

    rating:
      Number(
        item.rating ??
          0
      ),

    reviewCount:
      Number(
        item.review_count ??
          item.reviewCount ??
          0
      ),

    distanceFromUTA:
      String(
        item.distance_from_uta ??
          item.distanceFromUTA ??
          "Distance unavailable"
      ),
  };
}

function Stars({
  rating,
}: {
  rating: number;
}) {
  const rounded =
    Math.round(
      rating
    );

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(
        (
          star
        ) => (
          <span
            key={
              star
            }
            className={
              star <= rounded
                ? "text-amber-400"
                : "text-slate-300"
            }
          >
            ★
          </span>
        )
      )}
    </div>
  );
}

export default function FeaturedApartments() {
  const [
    apartments,
    setApartments,
  ] =
    useState<
      HousingItem[]
    >([]);

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
    async function loadHousing() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/browse-housing",
            {
              cache:
                "no-store",
            }
          );

        if (
          !response.ok
        ) {
          const result =
            await response
              .json()
              .catch(
                () =>
                  null
              );

          throw new Error(
            result?.details ||
              result?.error ||
              "Failed to load housing."
          );
        }

        const data =
          (await response.json()) as
            Record<
              string,
              unknown
            >[];

        setApartments(
          data.map(
            normalizeHousingItem
          )
        );
      } catch (error) {
        console.error(
          "Featured housing error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load housing."
        );
      } finally {
        setLoading(
          false
        );
      }
    }

    loadHousing();
  }, []);

  const featured =
    useMemo(() => {
      const preferredIds = [
        "the-arlie",
        "campus-edge",
        "liv-plus",
      ];

      const preferred =
        preferredIds
          .map(
            (
              id
            ) =>
              apartments.find(
                (
                  apartment
                ) =>
                  apartment.id ===
                  id
              )
          )
          .filter(
            (
              apartment
            ): apartment is HousingItem =>
              Boolean(
                apartment
              )
          );

      const remaining =
        apartments.filter(
          (
            apartment
          ) =>
            !preferredIds.includes(
              apartment.id
            )
        );

      return [
        ...preferred,
        ...remaining,
      ].slice(
        0,
        6
      );
    }, [
      apartments,
    ]);

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              Popular near campus
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Featured Housing
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Start with some of the housing options students commonly consider
              around UT Arlington.
            </p>
          </div>

          <Link
            href="/browse-housing"
            className="inline-flex w-fit rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View All Housing
          </Link>
        </div>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600">
              Loading housing...
            </p>
          </div>
        )}

        {!loading &&
          error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
              <p className="font-semibold text-red-800">
                Unable to load featured housing
              </p>

              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          featured.length ===
            0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-slate-900">
                No housing data available yet.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          featured.length >
            0 && (
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {featured.map(
                (
                  apartment
                ) => (
                  <article
                    key={
                      apartment.id
                    }
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={resolveImageSrc(
                          apartment
                        )}
                        alt={
                          apartment.name
                        }
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />

                      <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold capitalize text-slate-800 shadow-sm">
                        {apartment.category ===
                        "apartment"
                          ? "Apartment"
                          : "Residence Hall"}
                      </div>

                      <div className="absolute right-4 top-4 rounded-full bg-slate-950/80 px-3 py-1.5 text-sm font-bold text-white">
                        {
                          apartment.priceLevel
                        }
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <h3 className="text-xl font-bold text-slate-950">
                            {
                              apartment.name
                            }
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {
                              apartment.shortLocation
                            }
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Stars
                          rating={
                            apartment.rating
                          }
                        />

                        <span className="font-bold text-slate-900">
                          {apartment.rating.toFixed(
                            1
                          )}
                        </span>

                        <span className="text-sm text-slate-500">
                          (
                          {
                            apartment.reviewCount
                          }{" "}
                          reviews)
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-3 leading-7 text-slate-600">
                        {
                          apartment.description
                        }
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          {
                            apartment.distanceFromUTA
                          }
                        </span>

                        {apartment.tags
                          .slice(
                            0,
                            2
                          )
                          .map(
                            (
                              tag
                            ) => (
                              <span
                                key={
                                  tag
                                }
                                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                              >
                                {
                                  tag
                                }
                              </span>
                            )
                          )}
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Link
                          href={`/housing/${apartment.id}`}
                          className="flex-1 rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
                        >
                          View Details
                        </Link>

                        <Link
                          href={`/map?housing=${encodeURIComponent(
                            apartment.id
                          )}`}
                          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Map
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
      </div>
    </section>
  );
}