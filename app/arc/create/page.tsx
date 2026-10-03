"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const durations = [7, 30, 60, 90];

const categories = [
  ["🏋️", "Fitness"],
  ["📚", "Learning"],
  ["💼", "Career"],
  ["🥗", "Nutrition"],
  ["😴", "Sleep"],
  ["🧠", "Personal"],
];

export default function CreateArc() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(90);
  const [focus, setFocus] = useState<string[]>([]);

  function toggleFocus(item: string) {
    setFocus((old) =>
      old.includes(item)
        ? old.filter((x) => x !== item)
        : [...old, item]
    );
  }

  function launchArc() {
    const arc = {
      name: name || "My ARC90",
      duration,
      focus,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("arc90", JSON.stringify(arc));

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#08090c] px-6 py-8 text-white">
      <div className="mx-auto max-w-4xl">

        <header className="flex items-center justify-between">
          <a href="/" className="text-xl font-bold">
            ARC<span className="text-zinc-500">90</span>
          </a>

          <span className="text-sm text-zinc-500">
            Step {step} / 3
          </span>
        </header>

        <div className="mt-8 h-1 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${step * 33.33}%` }}
          />
        </div>

        {step === 1 && (
          <section className="py-16">

            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Step 01
            </p>

            <h1 className="mt-4 text-5xl font-semibold">
              Define your Arc.
            </h1>

            <p className="mt-5 text-zinc-400">
              Decide what this expedition means to you.
            </p>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Winter Arc 2026"
              className="mt-10 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-lg outline-none focus:border-white/40"
            />

            <p className="mb-4 mt-10 text-sm text-zinc-400">
              Choose duration
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {durations.map((days) => (
                <button
                  key={days}
                  onClick={() => setDuration(days)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    duration === days
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="text-2xl font-semibold">{days}</div>
                  <div className="text-sm opacity-60">days</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-10 rounded-full bg-white px-7 py-3 font-semibold text-black"
            >
              Continue →
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="py-16">

            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Step 02
            </p>

            <h1 className="mt-4 text-5xl font-semibold">
              Choose your focus.
            </h1>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {categories.map(([icon, title]) => {
                const selected = focus.includes(title);

                return (
                  <button
                    key={title}
                    onClick={() => toggleFocus(title)}
                    className={`rounded-2xl border p-6 text-left transition ${
                      selected
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
                    }`}
                  >
                    <span className="text-3xl">{icon}</span>

                    <h2 className="mt-5 text-lg font-semibold">
                      {title}
                    </h2>

                    <p className="mt-1 text-sm opacity-60">
                      {selected ? "Selected ✓" : "Add to your Arc"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-full border border-white/10 px-6 py-3"
              >
                ← Back
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={focus.length === 0}
                className="rounded-full bg-white px-7 py-3 font-semibold text-black disabled:opacity-30"
              >
                Continue →
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="py-16">

            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Final step
            </p>

            <h1 className="mt-4 text-5xl font-semibold">
              Ready to begin?
            </h1>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-7">

              <p className="text-sm text-zinc-500">YOUR ARC</p>

              <h2 className="mt-2 text-3xl font-semibold">
                {name || "My ARC90"}
              </h2>

              <div className="mt-6 flex gap-10">
                <div>
                  <p className="text-3xl font-semibold">{duration}</p>
                  <p className="text-sm text-zinc-500">days</p>
                </div>

                <div>
                  <p className="text-3xl font-semibold">{focus.length}</p>
                  <p className="text-sm text-zinc-500">focus areas</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {focus.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 px-3 py-2 text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={launchArc}
              className="mt-8 w-full rounded-2xl bg-white py-4 font-semibold text-black transition hover:scale-[1.01]"
            >
              Launch my Arc 🚀
            </button>

            <button
              onClick={() => setStep(2)}
              className="mt-4 w-full py-3 text-sm text-zinc-500"
            >
              ← Edit
            </button>

          </section>
        )}

      </div>
    </main>
  );
}