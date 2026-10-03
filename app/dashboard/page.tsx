"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type Task = {
  id: number;
  title: string;
  category: string;
  time: string;
  xp: number;
};

type Message = {
  role: "user" | "coach";
  text: string;
};

type Arc = {
  name?: string;
  duration?: number;
  focus?: string[];
  createdAt?: string;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Morning mobility",
    category: "Recovery",
    time: "06:30",
    xp: 20,
  },
  {
    id: 2,
    title: "Strength workout",
    category: "Fitness",
    time: "07:00",
    xp: 40,
  },
  {
    id: 3,
    title: "Protein-rich breakfast",
    category: "Nutrition",
    time: "08:30",
    xp: 20,
  },
  {
    id: 4,
    title: "Deep learning session",
    category: "Learning",
    time: "19:00",
    xp: 30,
  },
  {
    id: 5,
    title: "Plan tomorrow",
    category: "Personal",
    time: "21:30",
    xp: 20,
  },
];

const starterMessage: Message = {
  role: "coach",
  text: "I'm ARC90 Coach. You can talk to me normally — ask me anything, explain a problem, build a plan, review your routine, or just think something through.",
};

export default function Dashboard() {
  const [arc, setArc] = useState<Arc | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completed, setCompleted] = useState<number[]>([]);

  const [coachOpen, setCoachOpen] = useState(true);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([starterMessage]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ---------------------------------------------------------
     LOAD ARC + TASK PROGRESS
  --------------------------------------------------------- */

  useEffect(() => {
    try {
      const savedArc = localStorage.getItem("arc90");
      const savedCompleted = localStorage.getItem("arc90_tasks");
      const savedMessages = localStorage.getItem("arc90_chat");

      if (savedArc) {
        setArc(JSON.parse(savedArc));
      }

      if (savedCompleted) {
        setCompleted(JSON.parse(savedCompleted));
      }

      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (error) {
      console.error("ARC90 local storage error:", error);
    }
  }, []);

  /* ---------------------------------------------------------
     SAVE CHAT
  --------------------------------------------------------- */

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("arc90_chat", JSON.stringify(messages));
    }
  }, [messages]);

  /* ---------------------------------------------------------
     AUTO SCROLL CHAT
  --------------------------------------------------------- */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* ---------------------------------------------------------
     TASK COMPLETION
  --------------------------------------------------------- */

  function toggleTask(id: number) {
    const next = completed.includes(id)
      ? completed.filter((taskId) => taskId !== id)
      : [...completed, id];

    setCompleted(next);

    localStorage.setItem(
      "arc90_tasks",
      JSON.stringify(next)
    );
  }

  /* ---------------------------------------------------------
     PROGRESS
  --------------------------------------------------------- */

  const earnedXP = useMemo(() => {
    return tasks
      .filter((task) => completed.includes(task.id))
      .reduce((total, task) => total + task.xp, 0);
  }, [completed, tasks]);

  const totalXP = useMemo(() => {
    return tasks.reduce((total, task) => total + task.xp, 0);
  }, [tasks]);

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;

    return Math.round(
      (completed.length / tasks.length) * 100
    );
  }, [completed, tasks]);

  const level = Math.max(
    1,
    Math.floor(earnedXP / 100) + 1
  );

  const xpIntoLevel = earnedXP % 100;

  /* ---------------------------------------------------------
     ARC CONTEXT FOR AI
  --------------------------------------------------------- */

  function buildAIContext() {
    const completedTasks = tasks
      .filter((task) => completed.includes(task.id))
      .map(
        (task) =>
          `${task.time} — ${task.title} (${task.category}, +${task.xp} XP)`
      )
      .join("\n");

    const currentTasks = tasks
      .filter((task) => !completed.includes(task.id))
      .map(
        (task) =>
          `${task.time} — ${task.title} (${task.category}, +${task.xp} XP)`
      )
      .join("\n");

    return {
      arcName: arc?.name ?? "My ARC90",
      duration: arc?.duration ?? 90,
      focus: arc?.focus ?? [],
      progress: `${progress}% complete, ${earnedXP} XP earned, Level ${level}`,
      completedTasks: completedTasks || "None yet",
      tasks: currentTasks || "All current tasks completed",
    };
  }

  /* ---------------------------------------------------------
     SEND MESSAGE TO REAL AI
  --------------------------------------------------------- */

  async function sendMessage() {
    const trimmed = question.trim();

    if (!trimmed || loading) return;

    const userMessage: Message = {
      role: "user",
      text: trimmed,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,

          history: messages
            .slice(-10)
            .map((message) => ({
              role: message.role,
              text: message.text,
            })),

          context: buildAIContext(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "AI request failed."
        );
      }

      const aiMessage: Message = {
        role: "coach",
        text:
          data.response ||
          "I didn't receive a response from the AI.",
      };

      setMessages((current) => [
        ...current,
        aiMessage,
      ]);
    } catch (error) {
      console.error("ARC90 AI error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "coach",
          text:
            "I couldn't connect to the ARC90 AI right now. Check that your Gemini API key is configured correctly and that the development server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------
     FORM SUBMIT
  --------------------------------------------------------- */

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    sendMessage();
  }

  /* ---------------------------------------------------------
     ENTER / SHIFT+ENTER
  --------------------------------------------------------- */

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      sendMessage();
    }
  }

  /* ---------------------------------------------------------
     CLEAR CHAT
  --------------------------------------------------------- */

  function clearChat() {
    const confirmed = window.confirm(
      "Clear your ARC90 Coach conversation?"
    );

    if (!confirmed) return;

    setMessages([starterMessage]);

    localStorage.removeItem("arc90_chat");
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08090c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div>
            <p className="text-lg font-bold tracking-tight">
              ARC<span className="text-zinc-500">90</span>
            </p>

            <p className="text-xs text-zinc-500">
              Personal expedition dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                Level {level}
              </p>

              <p className="text-xs text-zinc-500">
                {earnedXP} XP
              </p>
            </div>

            <button
              onClick={() => setCoachOpen(true)}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              ✦ AI Coach
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* ARC HEADER */}

        <section className="mb-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-zinc-500">
                Current expedition
              </p>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {arc?.name || "My ARC90"}
              </h1>

              <p className="mt-3 text-zinc-400">
                {arc?.duration || 90} day personal expedition
              </p>

              {arc?.focus && arc.focus.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {arc.focus.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* PROGRESS */}

            <div className="w-full max-w-sm">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-zinc-400">
                  Today's progress
                </span>

                <span className="font-medium">
                  {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Today's XP"
            value={`${earnedXP}`}
          />

          <Stat
            label="Level"
            value={`${level}`}
          />

          <Stat
            label="Completed"
            value={`${completed.length}/${tasks.length}`}
          />

          <Stat
            label="XP to next level"
            value={`${100 - xpIntoLevel}`}
          />
        </section>

        {/* DASHBOARD + COACH */}

        <div
          className={`grid gap-6 ${
            coachOpen
              ? "lg:grid-cols-[minmax(0,1fr)_430px]"
              : "grid-cols-1"
          }`}
        >
          {/* DAILY QUESTS */}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                  Today
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Daily route
                </h2>
              </div>

              <button
                onClick={() => setCoachOpen(true)}
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                Open Coach
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => {
                const isDone = completed.includes(
                  task.id
                );

                return (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      isDone
                        ? "border-white/10 bg-white/[0.05]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* CHECK */}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                        isDone
                          ? "border-white bg-white text-black"
                          : "border-white/15 text-transparent group-hover:border-white/30"
                      }`}
                    >
                      ✓
                    </div>

                    {/* TASK */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`font-medium ${
                            isDone
                              ? "text-zinc-500 line-through"
                              : "text-white"
                          }`}
                        >
                          {task.title}
                        </p>

                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-500">
                          {task.category}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-zinc-600">
                        {task.time}
                      </p>
                    </div>

                    {/* XP */}

                    <div
                      className={`text-sm font-medium ${
                        isDone
                          ? "text-zinc-600"
                          : "text-zinc-400"
                      }`}
                    >
                      +{task.xp}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SUMMIT */}

            <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                  ⛰
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                    Expedition status
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    {progress === 100
                      ? "Summit reached for today"
                      : progress >= 60
                      ? "High camp"
                      : progress >= 30
                      ? "First ridge"
                      : "Base camp"}
                  </h3>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-zinc-500">
                Keep moving one task at a time. ARC90 is about
                consistency across the entire expedition, not one
                perfect day.
              </p>
            </div>
          </section>

          {/* AI COACH */}

          {coachOpen && (
            <section className="flex min-h-[650px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f13]">
              {/* COACH HEADER */}

              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                    ✦
                  </div>

                  <div>
                    <p className="font-semibold">
                      ARC90 Coach
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                      <span className="text-xs text-zinc-500">
                        AI assistant
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={clearChat}
                    className="rounded-lg px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-white"
                    title="Clear conversation"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => setCoachOpen(false)}
                    className="rounded-lg px-3 py-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                    title="Close coach"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* CHAT */}

              <div className="flex-1 overflow-y-auto px-4 py-5">
                <div className="space-y-5">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={`${message.role}-${index}`}
                      message={message}
                    />
                  ))}

                  {/* THINKING */}

                  {loading && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs text-black">
                        ✦
                      </div>

                      <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* COMPOSER */}

              <div className="border-t border-white/10 p-4">
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl border border-white/10 bg-black/20 transition focus-within:border-white/20"
                >
                  <textarea
                    ref={textareaRef}
                    value={question}
                    onChange={(event) =>
                      setQuestion(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    rows={3}
                    placeholder="Message ARC90 Coach..."
                    className="w-full resize-none bg-transparent px-4 pt-4 text-sm text-white outline-none placeholder:text-zinc-700 disabled:opacity-50"
                  />

                  <div className="flex items-center justify-between px-3 pb-3">
                    <p className="hidden text-[11px] text-zinc-700 sm:block">
                      Enter to send · Shift + Enter for new line
                    </p>

                    <div className="ml-auto flex items-center gap-2">
                      {/* VOICE FOUNDATION */}

                      <button
                        type="button"
                        disabled
                        title="Voice coming next"
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-700"
                      >
                        ◉
                      </button>

                      {/* SEND */}

                      <button
                        type="submit"
                        disabled={
                          !question.trim() || loading
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-600"
                      >
                        ↑
                      </button>
                    </div>
                  </div>
                </form>

                <p className="mt-2 text-center text-[10px] text-zinc-700">
                  ARC90 Coach can make mistakes. For medical or
                  medication decisions, consult an appropriate
                  healthcare professional.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   STAT
============================================================ */

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   CHAT MESSAGE
============================================================ */

function ChatMessage({
  message,
}: {
  message: Message;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs text-black">
          ✦
        </div>
      )}

      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "rounded-tr-md bg-white text-black"
            : "rounded-tl-md border border-white/10 bg-white/[0.04] text-zinc-300"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}