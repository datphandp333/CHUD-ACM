"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import type {
  HousingItem,
} from "@/app/lib/mapBuilding";

type HomeHousing = HousingItem;

export default function HomePage() {
  const [housing, setHousing] =
    useState<HomeHousing[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadHousing() {
      try {
        const response = await fetch(
          "/api/browse-housing",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load housing"
          );
        }

        const data =
          await response.json();

        setHousing(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Home housing error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadHousing();
  }, []);

  const counts = useMemo(() => {
    return {
      total: housing.length,

      onCampus: housing.filter(
        (property) =>
          property.campusType ===
          "on-campus"
      ).length,

      offCampus: housing.filter(
        (property) =>
          property.campusType ===
          "off-campus"
      ).length,

      residenceHalls:
        housing.filter(
          (property) =>
            property.housingType ===
            "residence-hall"
        ).length,

      utaApartments:
        housing.filter(
          (property) =>
            property.housingType ===
            "uta-apartment"
        ).length,

      privateStudent:
        housing.filter(
          (property) =>
            property.housingType ===
            "private-student-apartment"
        ).length,

      studentApartments:
        housing.filter(
          (property) =>
            property.housingType ===
            "student-apartment"
        ).length,

      apartments:
        housing.filter(
          (property) =>
            property.housingType ===
            "apartment"
        ).length,
    };
  }, [housing]);

  const topRated = useMemo(() => {
    return [...housing]
      .filter(
        (property) =>
          property.reviewCount > 0
      )
      .sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }

        return (
          b.reviewCount -
          a.reviewCount
        );
      })
      .slice(0, 3);
  }, [housing]);

  return (
    <main className="bg-white pt-20">

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">

        <div className="absolute inset-0">

          <Image
            src="/UTA_image2.jpg"
            alt="UTA campus"
            fill
            priority
            className="object-cover opacity-55"
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/25" />

        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">

          <div className="max-w-3xl">

            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              Housing built around the UTA student experience
            </div>

            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Find a place that feels right.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Compare on-campus and off-campus housing near
              UT Arlington, explore locations, and learn from
              student experiences before choosing where to live.
            </p>

            {/* SEARCH */}
            <div className="mt-10 max-w-4xl rounded-2xl bg-white p-3 shadow-2xl">

              <form
                action="/browse-housing"
                className="grid gap-2 md:grid-cols-[1.6fr_1fr_1fr_auto]"
              >

                <div className="rounded-xl px-4 py-3">

                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Where
                  </label>

                  <input
                    name="search"
                    placeholder="Search housing near UTA"
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                  />

                </div>

                <div className="rounded-xl border-slate-200 px-4 py-3 md:border-l">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Housing
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    All housing types
                  </p>

                </div>

                <div className="rounded-xl border-slate-200 px-4 py-3 md:border-l">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Campus
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    On & off campus
                  </p>

                </div>

                <button
                  type="submit"
                  className="flex h-14 items-center justify-center rounded-xl bg-blue-700 px-7 font-bold text-white transition hover:bg-blue-800"
                >
                  Search
                </button>

              </form>

            </div>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                href="/top-rated"
                className="text-sm font-semibold text-white hover:text-blue-200"
              >
                ★ Explore top rated
              </Link>

              <Link
                href="/map"
                className="text-sm font-semibold text-white hover:text-blue-200"
              >
                ◎ Browse on map
              </Link>

              <Link
                href="/write-review"
                className="text-sm font-semibold text-white hover:text-blue-200"
              >
                ✎ Share your experience
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* CAMPUS CHOICE */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        <div>

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
            Start exploring
          </p>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            Where do you want to live?
          </h2>

          <p className="mt-3 max-w-2xl text-slate-600">
            Start with campus location, then narrow your
            search by housing type, ratings, amenities, and
            student feedback.
          </p>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <CampusCard
            title="On Campus"
            description="Explore UTA residence halls, university apartments, and student housing located on campus."
            count={
              loading
                ? null
                : counts.onCampus
            }
            image="/on_campus/residence_halls/MavHallBlock.png"
            href="/browse-housing?campus=on-campus"
            badge="UTA Housing"
          />

          <CampusCard
            title="Off Campus"
            description="Explore student-focused communities and traditional apartments around UT Arlington."
            count={
              loading
                ? null
                : counts.offCampus
            }
            image="/off_campus/student_apartments/the-arlie1.jpg"
            href="/browse-housing?campus=off-campus"
            badge="Near UTA"
          />

        </div>

      </section>

      {/* HOUSING TYPES */}
      <section className="border-y border-slate-200 bg-slate-50">

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                Explore by type
              </p>

              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                Housing for different student needs
              </h2>

            </div>

            <Link
              href="/browse-housing"
              className="font-bold text-blue-700 hover:text-blue-800"
            >
              View all housing →
            </Link>

          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <HousingTypeCard
              icon="🏫"
              title="Residence Halls"
              count={
                counts.residenceHalls
              }
            />

            <HousingTypeCard
              icon="🏠"
              title="UTA Apartments"
              count={
                counts.utaApartments
              }
            />

            <HousingTypeCard
              icon="🎓"
              title="Private Student"
              count={
                counts.privateStudent
              }
            />

            <HousingTypeCard
              icon="🎓"
              title="Student Apartments"
              count={
                counts.studentApartments
              }
            />

            <HousingTypeCard
              icon="🏢"
              title="Apartments"
              count={
                counts.apartments
              }
            />

          </div>

        </div>

      </section>

      {/* TOP RATED */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
              Student feedback
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              Top rated near UTA
            </h2>

            <p className="mt-3 text-slate-600">
              Housing ranked using reviews submitted through CHUD.
            </p>

          </div>

          <Link
            href="/top-rated"
            className="font-bold text-blue-700 hover:text-blue-800"
          >
            See all top rated →
          </Link>

        </div>

        {loading ? (

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-[390px] animate-pulse rounded-3xl bg-slate-100"
                />
              )
            )}
          </div>

        ) : topRated.length > 0 ? (

          <div className="mt-8 grid gap-6 md:grid-cols-3">

            {topRated.map(
              (property) => (
                <TopRatedCard
                  key={property.id}
                  property={property}
                />
              )
            )}

          </div>

        ) : (

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">

            <p className="font-semibold text-slate-600">
              Student ratings will appear here as reviews are added.
            </p>

          </div>

        )}

      </section>

      {/* MAP */}
      <section className="bg-slate-50">

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              Location matters
            </p>

            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
              See housing around campus.
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Explore where each property is located relative
              to UT Arlington and use your current location to
              understand what's nearby.
            </p>

            <div className="mt-7 space-y-4">

              <FeatureLine
                text={`View ${
                  loading
                    ? "all"
                    : counts.total
                } CHUD properties on one interactive map`}
              />

              <FeatureLine text="Identify on-campus and off-campus housing" />

              <FeatureLine text="Use your current location to understand nearby options" />

            </div>

            <Link
              href="/map"
              className="mt-8 inline-flex rounded-xl bg-blue-700 px-6 py-3.5 font-bold text-white transition hover:bg-blue-800"
            >
              Explore the Map →
            </Link>

          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-xl">

            <div className="relative h-[420px] overflow-hidden rounded-[1.5rem]">

              <Image
                src="/UTA-campus-map.png"
                alt="UTA housing map"
                fill
                className="object-cover"
                sizes="50vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />

              <div className="absolute bottom-5 left-5 rounded-2xl bg-white/95 px-5 py-4 shadow-lg backdrop-blur">

                <p className="font-bold text-slate-950">
                  {loading
                    ? "Loading housing..."
                    : `${counts.total} housing locations`}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  On and around UT Arlington
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div className="text-center">

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
            Built for students
          </p>

          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
            Make a more informed housing decision.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            CHUD brings housing details, location, ratings,
            and student experiences together in one place.
          </p>

        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          <TrustCard
            icon="★"
            title="Student feedback"
            description="Read ratings and experiences submitted by students through CHUD."
          />

          <TrustCard
            icon="⌖"
            title="Location first"
            description="Understand whether housing is on campus or off campus and where each property is located."
          />

          <TrustCard
            icon="↔"
            title="Easy comparison"
            description="Compare ratings, amenities, housing type, location, and other important details."
          />

        </div>

      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">

        <div className="relative overflow-hidden rounded-[2rem] bg-blue-700 px-8 py-14 text-white md:px-14">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500 opacity-40" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">
                Help another Maverick
              </p>

              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
                Have experience with UTA housing?
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">
                Share what you learned and help another student
                choose where to live.
              </p>

            </div>

            <Link
              href="/write-review"
              className="inline-flex w-fit rounded-xl bg-white px-7 py-3.5 font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Write a Review →
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

function CampusCard({
  title,
  description,
  count,
  image,
  href,
  badge,
}: {
  title: string;
  description: string;
  count: number | null;
  image: string;
  href: string;
  badge: string;
}) {
  return (
    <Link
      href={href}
      className="group relative h-[360px] overflow-hidden rounded-[2rem]"
    >

      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

      <div className="absolute left-6 top-6 rounded-full bg-white/95 px-4 py-2 text-xs font-extrabold text-slate-900 shadow-sm backdrop-blur">
        {badge}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-7 text-white">

        <p className="text-sm font-bold text-blue-200">
          {count === null
            ? "Loading..."
            : `${count} ${
                count === 1
                  ? "property"
                  : "properties"
              }`}
        </p>

        <h3 className="mt-2 text-3xl font-extrabold">
          {title}
        </h3>

        <p className="mt-3 max-w-lg leading-7 text-slate-200">
          {description}
        </p>

        <p className="mt-5 font-bold">
          Explore {title} →
        </p>

      </div>

    </Link>
  );
}

function HousingTypeCard({
  icon,
  title,
  count,
}: {
  icon: string;
  title: string;
  count: number;
}) {
  return (
    <Link
      href="/browse-housing"
      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
    >

      <div className="text-2xl">
        {icon}
      </div>

      <h3 className="mt-4 font-extrabold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {count}{" "}
        {count === 1
          ? "property"
          : "properties"}
      </p>

    </Link>
  );
}

function TopRatedCard({
  property,
}: {
  property: HomeHousing;
}) {
  const image =
    property.image?.startsWith("/")
      ? property.image
      : property.image
      ? `/${property.image}`
      : "/UTA-Logo.png";

  return (
    <Link
      href={`/housing/${property.id}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >

      <div className="relative h-60 overflow-hidden">

        <Image
          src={image}
          alt={property.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="33vw"
        />

        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-slate-800 shadow">
          {property.campusType ===
          "on-campus"
            ? "🏫 On Campus"
            : "🏙️ Off Campus"}
        </div>

      </div>

      <div className="p-6">

        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
          {property.shortLocation}
        </p>

        <h3 className="mt-2 text-2xl font-extrabold text-slate-950">
          {property.name}
        </h3>

        <div className="mt-4 flex items-center gap-2">

          <span className="text-amber-400">
            ★
          </span>

          <span className="font-extrabold text-slate-950">
            {property.rating.toFixed(
              1
            )}
          </span>

          <span className="text-sm text-slate-500">
            ({property.reviewCount}{" "}
            {property.reviewCount === 1
              ? "review"
              : "reviews"})
          </span>

        </div>

        <p className="mt-5 font-bold text-blue-700">
          View property →
        </p>

      </div>

    </Link>
  );
}

function FeatureLine({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
        ✓
      </div>

      <p className="font-medium text-slate-700">
        {text}
      </p>

    </div>
  );
}

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>

    </article>
  );
}