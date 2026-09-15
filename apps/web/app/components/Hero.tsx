import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-blue-50 to-slate-50 pt-24">
      <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <div className="inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            Student housing information for UT Arlington
          </div>

          <h1 className="mt-7 max-w-3xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Find a better place to live near UTA.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Browse student apartments and residence halls, compare ratings,
            explore locations, and read experiences shared by other students.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/browse-housing"
              className="rounded-xl bg-blue-700 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              Browse Housing
            </Link>

            <Link
              href="/map"
              className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Explore Map
            </Link>

            <Link
              href="/write-review"
              className="rounded-xl border border-blue-200 bg-blue-50 px-7 py-3.5 font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Write a Review
            </Link>
          </div>

          <div className="mt-12 grid max-w-2xl gap-5 sm:grid-cols-3">
            <Stat
              value="UTA"
              label="Focused housing"
            />

            <Stat
              value="Student"
              label="Written reviews"
            />

            <Stat
              value="Live"
              label="Housing data"
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />

          <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-indigo-200/40 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-4 shadow-2xl shadow-blue-900/10">
            <div className="relative h-[500px] overflow-hidden rounded-[1.5rem]">
              <Image
                src="/UTA_image2.jpg"
                alt="University of Texas at Arlington campus"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/90 p-5 shadow-lg backdrop-blur">
                <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                  Housing around UTA
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Compare before you choose.
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  See location, ratings, reviews, amenities, and housing details
                  in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-2xl font-bold text-blue-800">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}