import { useEffect, useState } from "react";
import { generateGradient, getTodayString, getStored, store, fetchQuote } from "@/lib/daily";

const Index = () => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [gradient, setGradient] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const today = getTodayString();
      const stored = getStored();

      if (stored && stored.date === today) {
        setQuote(stored.quote);
        setAuthor(stored.author);
        setGradient(`linear-gradient(135deg, ${stored.colors.join(", ")})`);
        setReady(true);
        return;
      }

      const colors = generateGradient(today);
      const { content, author: qAuthor } = await fetchQuote();

      store({ date: today, quote: content, author: qAuthor, colors });
      setQuote(content);
      setAuthor(qAuthor);
      setGradient(`linear-gradient(135deg, ${colors.join(", ")})`);
      setReady(true);
    };

    init();
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center animate-gradient noise-overlay dark-scrim"
      style={{ background: gradient || "hsl(0, 0%, 5%)" }}
    >
      <div className="relative z-10 max-w-2xl px-8 text-center">
        {ready && (
          <>
            <blockquote className="animate-fade-up">
              <p className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-tight tracking-tight text-foreground italic">
                "{quote}"
              </p>
            </blockquote>
            <p className="animate-fade-up-delay mt-8 font-body text-base sm:text-lg font-light tracking-widest uppercase text-foreground/70">
              — {author}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
