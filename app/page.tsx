export default function Home() {
  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-12">
        
        {/* Navigation */}
        <nav className="flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">
            ARC<span className="text-zinc-500">90</span>
          </div>

          <button className="rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-300 transition hover:bg-white/5">
            Sign in
          </button>
        </nav>

        {/* Hero */}
        <div className="flex flex-1 items-center">
          <div className="max-w-4xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
              Your next 90 days
            </p>

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
              Build your arc.
              <br />
              <span className="text-zinc-500">Reach your summit.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
              ARC90 is an open-source challenge platform for turning your goals,
              routines, fitness, learning and ambitions into a focused personal
              expedition.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-full bg-white px-7 py-3.5 font-medium text-black transition hover:bg-zinc-200">
                Start your Arc →
              </button>

              <button className="rounded-full border border-white/10 px-7 py-3.5 font-medium text-zinc-300 transition hover:bg-white/5">
                Explore challenges
              </button>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
          <div>
            <p className="text-2xl font-semibold">90</p>
            <p className="mt-1 text-sm text-zinc-500">days to transform</p>
          </div>

          <div>
            <p className="text-2xl font-semibold">∞</p>
            <p className="mt-1 text-sm text-zinc-500">custom routines</p>
          </div>

          <div>
            <p className="text-2xl font-semibold">XP</p>
            <p className="mt-1 text-sm text-zinc-500">earned through action</p>
          </div>

          <div>
            <p className="text-2xl font-semibold">⌁</p>
            <p className="mt-1 text-sm text-zinc-500">your personal summit</p>
          </div>
        </div>
      </section>
    </main>
  );
}