import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-12">

        <nav className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            ARC<span className="text-zinc-500">90</span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            Dashboard
          </Link>
        </nav>

        <section className="flex flex-1 items-center py-20">
          <div className="max-w-4xl">

            <p className="mb-6 text-sm uppercase tracking-[0.3em] text-zinc-500">
              Your next 90 days
            </p>

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
              Build your arc.
              <br />
              <span className="text-zinc-500">Reach your summit.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
              Turn your goals, routines, fitness, learning and ambitions into
              a focused personal expedition.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/arc/create"
                className="rounded-full bg-white px-7 py-3.5 text-center font-medium text-black transition hover:scale-105 hover:bg-zinc-200"
              >
                Start your Arc →
              </Link>

              <Link
                href="/dashboard"
                className="rounded-full border border-white/10 px-7 py-3.5 text-center font-medium text-zinc-300 transition hover:bg-white/5"
              >
                Open Dashboard
              </Link>

            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
          <Stat value="90" label="days to transform" />
          <Stat value="∞" label="custom routines" />
          <Stat value="XP" label="earned through action" />
          <Stat value="⌁" label="your personal summit" />
        </div>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}