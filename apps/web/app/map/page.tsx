import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

type BuildingRow = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  description: string | null;
  image: string | null;
  price_level: string | null;
  tags: string[] | null;
  rating: number | null;
  review_count: number | null;
  distance_from_uta: string | null;
};

function renderStars(rating: number) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={index < rounded ? "text-amber-400" : "text-slate-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function getSafeImage(image: string | null) {
  if (!image || image.trim() === "") {
    return "/UTA-Logo.png";
  }
  return image.startsWith("/") ? image : `/${image}`;
}

export default async function MapPage() {
  const { data, error } = await supabase
    .from("buildings")
    .select(
      "id, slug, name, address, description, image, price_level, tags, rating, review_count, distance_from_uta"
    )
    .in("slug", ["campus-edge", "the-arlie", "liv-plus"]);

  if (error) {
    console.error("Supabase error:", error);
  }

  const mapHousing: BuildingRow[] = (data ?? []) as BuildingRow[];

  return (
    <main className="min-h-screen bg-slate-50 pt-28">
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Housing Map
          </p>

          <h1 className="mt-3 text-4xl font-bold text-blue-900 md:text-5xl">
            Explore Housing Near UT Arlington
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-slate-600">
            View popular student housing options around campus and compare their
            locations, ratings, and distance from UTA.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-blue-900">UTA Campus Map</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                Housing Nearby
              </span>
            </div>

            <div className="relative h-[700px] w-full rounded-2xl bg-slate-50">
              <Image
                src="/UTA-campus-map.png"
                alt="UTA Campus Map"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>

          <div className="space-y-5">
            {mapHousing.map((building) => (
              <div
                key={building.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">
                      {building.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {building.address ?? "UTA area"}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {building.price_level ?? "N/A"}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  {renderStars(Number(building.rating ?? 0))}
                  <span className="text-sm font-medium text-slate-700">
                    {Number(building.rating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({Number(building.review_count ?? 0)} reviews)
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {building.distance_from_uta ?? "Not listed"}
                </p>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {building.description ?? "No description available."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(building.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl">
                  <Image
                    src={getSafeImage(building.image)}
                    alt={building.name}
                    width={500}
                    height={260}
                    className="h-44 w-full object-cover"
                  />
                </div>

                <Link
                  href={`/housing/${building.slug}`}
                  className="mt-5 inline-block rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}