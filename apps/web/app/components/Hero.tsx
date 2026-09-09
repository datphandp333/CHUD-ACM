import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-6 py-12">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="animate-fade-up mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              UTA Housing Reviews
            </p>

            <h1 className="animate-fade-up-delay-1 text-4xl font-bold leading-tight text-blue-900 md:text-5xl lg:text-7xl">
              Find the Best Housing Near UT Arlington
            </h1>

            <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Compare student housing, read honest reviews, and explore popular
              apartments like Campus Edge, The Arlie, and LIV+ Arlington to find
              the best fit for your lifestyle and budget.
            </p>

            <div className="animate-fade-up-delay-2 mt-6 inline-flex items-center rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              Trusted by UTA students for honest housing reviews
            </div>

            <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap gap-4">
              <Link
                href="/browse-housing"
                className="rounded-full bg-blue-600 px-7 py-3 font-medium text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
              >
                Browse Housing
              </Link>

              <Link
                href="/write-review"
                className="rounded-full border border-blue-600 bg-white px-7 py-3 font-medium text-blue-600 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Write a Review
              </Link>
            </div>

            <div className="animate-fade-up-delay-3 mt-12 flex flex-wrap gap-10 text-sm text-slate-500">
              <div>
                <p className="text-3xl font-bold text-blue-800">3+</p>
                <p>Featured Apartments</p>
              </div>

              <div>
                <p className="text-3xl font-bold text-blue-800">Student</p>
                <p>Written Reviews</p>
              </div>

              <div>
                <p className="text-3xl font-bold text-blue-800">Near UTA</p>
                <p>Housing Options</p>
              </div>
            </div>
          </div>

          <div className="animate-fade-up-delay-2 flex flex-col gap-6">
            <div className="group flex gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-36 w-52 flex-shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src="/campus-edge1.jpg"
                  alt="Campus Edge near UT Arlington"
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-blue-900 transition duration-300 group-hover:text-blue-700">
                  Campus Edge
                </h3>
                <p className="mt-1 text-sm text-slate-500">Near UTA Boulevard</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Popular student housing with convenient campus access and
                  modern amenities.
                </p>
              </div>
            </div>

            <div className="group flex gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-36 w-52 flex-shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src="/the-arlie1.jpg"
                  alt="The Arlie student apartments"
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-blue-900 transition duration-300 group-hover:text-blue-700">
                  The Arlie
                </h3>
                <p className="mt-1 text-sm text-slate-500">Student Apartments</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Modern off-campus housing offering spacious units and a strong
                  student community.
                </p>
              </div>
            </div>

            <div className="group flex gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-36 w-52 flex-shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src="/liv-plus1.jpg"
                  alt="LIV+ Arlington student housing"
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-blue-900 transition duration-300 group-hover:text-blue-700">
                  LIV+ Arlington
                </h3>
                <p className="mt-1 text-sm text-slate-500">Near UT Arlington</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  A popular student housing option with strong amenities and
                  convenient campus access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}