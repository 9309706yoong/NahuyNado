"use client";

import { useEffect, useRef, useState } from "react";

type Entry = {
  id: number;
  idea: string;
  message: string;
  category: string;
};

const SHUFFLE_TEXTS = [
  "Анализирую твою хуету...",
  "Ищу причину забить...",
  "Подбираю самое обидное...",
  "Считаю, сколько людей уже сдались...",
  "Проверяю, кому это надо...",
];

export default function HomePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const nextId = useRef(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idea = input.trim();
    if (!idea) return;

    setLoading(true);
    let message = "";
    let category = "общее";

    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      if (!res.ok) throw new Error("respond failed");
      const data = (await res.json()) as { message?: string; category?: string };
      message = data.message ?? "Нафиг надо.";
      category = data.category ?? "общее";
    } catch {
      const fallback = [
        "эта идея изначально тупиковая и полная хуйня, ты потратишь время, силы и нервы, а взамен получишь пустоту, в итоге останешься с разбитой психикой и чувством провала, так что забей нахуй, ляг и не позорься своими попытками.",
        "забудь про эту ебаную затею, она не принесет ничего, кроме боли, никому это не нужно, включая тех, ради кого ты это затеял, через неделю все покажется глупым, оставь это дерьмо в покое.",
        "это путь в никуда, и ты это прекрасно чувствуешь, реальность сломает твои планы быстрее, чем ты успеешь порадоваться, ложись спать, забудь и больше не вспоминай.",
      ];
      message = `Нафиг надо, ${fallback[Math.floor(Math.random() * fallback.length)]}`;
      category = "общее";
    }

    setEntries((prev) => [
      { id: nextId.current++, idea, message, category },
      ...prev,
    ]);
    setInput("");
    setLoading(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-10 text-[#f3f0fa]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 18% 22%, rgba(168,85,247,0.25), transparent 32%), radial-gradient(circle at 82% 78%, rgba(255,77,109,0.2), transparent 32%), radial-gradient(circle at 50% 120%, rgba(80,40,140,0.35), transparent 45%), linear-gradient(135deg, #0b0a12, #150d1f, #241636)",
          backgroundSize: "220% 220%",
        }}
      />

      <section className="w-full max-w-2xl rounded-[30px] border border-white/10 bg-white/[0.06] p-8 shadow-[0_28px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-12">
        <header className="mb-2 flex items-start gap-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#a855f7] text-3xl shadow-lg">
            🥀
          </div>
          <div>
            <h1 className="text-[clamp(2.1rem,6.5vw,3.2rem)] font-bold leading-none tracking-tight">
              Нафиг надо
            </h1>
            <p className="mt-2 text-[#b6adc8]">
              У тебя появилась идея? Сейчас подберем к ней идеальное,
              смысловое и максимально грубое обесценивание.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-wide text-[#cbbee0]">
                100+ отмазок
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-wide text-[#cbbee0]">
                Смысловой подбор
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-wide text-[#cbbee0]">
                Токсичность 9000
              </span>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={700}
              required
              placeholder="Опиши идею подробнее — чем больше деталей, тем точнее попадание..."
              className="min-h-[130px] w-full resize-y rounded-[20px] border-2 border-white/10 bg-black/25 p-5 text-base text-[#f3f0fa] placeholder-[#7a708a] outline-none transition focus:border-[#ff4d6d] focus:shadow-[0_0_0_4px_rgba(255,77,109,0.15)]"
            />
            <span className="pointer-events-none absolute bottom-4 right-4 text-xs text-[#6b617a]">
              Enter — отправить
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border-[3px] border-black bg-[#ff4d6d] px-7 py-4 text-lg font-extrabold text-white shadow-[6px_6px_0_#000] transition hover:bg-[#ff6b85] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0_#000] disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:justify-self-start"
          >
            <span>💀</span>
            <span>Обесценить</span>
          </button>
        </form>

        <div className="mt-8 grid gap-4">
          {entries.length === 0 && (
            <p className="py-6 text-center text-[#b6adc8]">
              Пока ничего не обесценено. Время начинать.
            </p>
          )}
          {entries.map((entry) => (
            <AnswerCard
              key={entry.id}
              idea={entry.idea}
              message={entry.message}
              category={entry.category}
            />
          ))}
        </div>
      </section>

      <p className="mt-4 text-center text-xs text-[#5d5470]">
        Идея была взята у одного из участников чата.
      </p>
    </main>
  );
}

function AnswerCard({
  idea,
  message,
  category,
}: {
  idea: string;
  message: string;
  category: string;
}) {
  const [phase, setPhase] = useState<"shuffle" | "reveal">("shuffle");
  const [shuffleText, setShuffleText] = useState(SHUFFLE_TEXTS[0]);
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    let i = 0;
    setPhase("shuffle");
    setVisibleText("");
    const interval = setInterval(() => {
      setShuffleText(SHUFFLE_TEXTS[i % SHUFFLE_TEXTS.length]);
      i++;
    }, 90);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPhase("reveal");
      let pos = 0;
      const type = setInterval(() => {
        pos += 1;
        setVisibleText(message.slice(0, pos));
        if (pos >= message.length) clearInterval(type);
      }, 12);
      return () => clearInterval(type);
    }, 550);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [message]);

  return (
    <div className="rounded-[22px] border border-white/10 bg-black/25 p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="text-sm text-[#b6adc8]">Твоя идея: «{idea}»</p>
        <span className="rounded-full border border-[#a855f7]/25 bg-[#a855f7]/15 px-2 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-wide text-[#d8c8f0]">
          {category}
        </span>
      </div>
      {phase === "shuffle" ? (
        <p className="text-sm italic text-[#8b7fa0]">{shuffleText}</p>
      ) : (
        <p className="text-[clamp(1.25rem,4.2vw,1.7rem)] font-extrabold leading-snug">
          <span className="bg-gradient-to-r from-[#ff4d6d] to-[#a855f7] bg-clip-text text-transparent">
            {visibleText}
          </span>
          <span className="ml-1 inline-block h-[1em] w-[3px] animate-pulse bg-[#ff4d6d] align-middle" />
        </p>
      )}
    </div>
  );
}
