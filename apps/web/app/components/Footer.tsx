import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-700 bg-slate-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        <div className="translate-y-0 animate-[fadeUp_0.7s_ease-out] opacity-100">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Mav Housing
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            Find Better Housing Near UTA
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            Mav Housing helps UT Arlington students explore apartments, compare
            options, read reviews, and find housing that fits their lifestyle
            and budget.
          </p>
        </div>

        <div className="translate-y-0 animate-[fadeUp_0.9s_ease-out] opacity-100">
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <Link
              href="/"
              className="block transition duration-300 hover:translate-x-1 hover:text-blue-300"
            >
              Home
            </Link>
            <Link
              href="/browse-housing"
              className="block transition duration-300 hover:translate-x-1 hover:text-blue-300"
            >
              Browse Housing
            </Link>
            <Link
              href="/top-rated"
              className="block transition duration-300 hover:translate-x-1 hover:text-blue-300"
            >
              Top Rated
            </Link>
            <Link
              href="/map"
              className="block transition duration-300 hover:translate-x-1 hover:text-blue-300"
            >
              Map
            </Link>
            <Link
              href="/write-review"
              className="block transition duration-300 hover:translate-x-1 hover:text-blue-300"
            >
              Write Review
            </Link>
          </div>
        </div>

        <div className="translate-y-0 animate-[fadeUp_1.1s_ease-out] opacity-100">
          <h3 className="text-lg font-semibold text-white">Student Support</h3>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <p className="transition duration-300 hover:text-white">
              Compare ratings, pricing, and distance from UTA.
            </p>
            <p className="transition duration-300 hover:text-white">
              Read real student feedback before making a housing decision.
            </p>
            <p className="transition duration-300 hover:text-white">
              Explore nearby apartment options in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p className="transition duration-300 hover:text-slate-200">
            © 2026 Mav Housing. Built for UT Arlington students.
          </p>
          <p className="transition duration-300 hover:text-slate-200">
            Designed to help students compare housing with confidence.
          </p>
        </div>
      </div>
    </footer>
  );
}