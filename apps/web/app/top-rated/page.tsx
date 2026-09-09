import Link from "next/link";
import Image from "next/image";
import { utaHousing } from "@/app/data/utaHousing";

const sortedHousing = [...utaHousing].sort((a, b) => b.rating - a.rating);

export default function TopRatedPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-28">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Top Rated Housing
          </p>

          <h1 className="mt-3 text-4xl font-bold text-blue-900 md:text-5xl">
            Best Rated Housing Near UTA
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Explore the highest-rated housing options based on reviews,
            ratings, and overall student experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {sortedHousing.map((housing, index) => (
            <div
              key={housing.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={housing.image}
                  alt={housing.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                    #{index + 1} Ranked
                  </span>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {housing.priceLevel}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-blue-900">
                  {housing.name}
                </h2>

                <p className="mt-2 text-slate-500">{housing.address}</p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-lg font-bold text-yellow-500">
                    ★ {housing.rating.toFixed(1)}
                  </span>

                  <span className="text-slate-500">
                    ({housing.reviewCount} reviews)
                  </span>
                </div>

                <p className="mt-4 text-slate-600">{housing.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {housing.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {housing.distanceFromUTA}
                  </span>

                  <Link
                    href={`/housing/${housing.id}`}
                    className="font-semibold text-blue-700 hover:text-blue-900"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
