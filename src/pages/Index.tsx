import { useEffect, useState } from "react";
import { generateGradient, getTodayString, getStored, store, fetchQuote, isLightGradient } from "@/lib/daily";

const Index = () => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [gradient, setGradient] = useState("");
  const [ready, setReady] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    setDateLabel(`${days[now.getDay()]} · ${months[now.getMonth()]} ${now.getDate()}`);

    const init = async () => {
      const today = getTodayString();
      const stored = getStored();

      if (stored && stored.date === today) {
        setQuote(stored.quote);
        setAuthor(stored.author);
        setIsLight(isLightGradient(stored.colors));
        setGradient(`linear-gradient(135deg, ${stored.colors.join(", ")})`);
        setReady(true);
        return;
      }

      const colors = generateGradient(today);
      const { content, author: qAuthor } = await fetchQuote();

      store({ date: today, quote: content, author: qAuthor, colors });
      setQuote(content);
      setAuthor(qAuthor);
      setIsLight(isLightGradient(colors));
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
      {/* Date indicator */}
      <span className="absolute top-6 right-6 z-20 font-body text-xs tracking-widest text-foreground/50">
        {dateLabel}
      </span>

      {/* Glass quote panel */}
      <div
        className={`relative z-10 glass-panel ${ready ? "glass-panel-visible" : ""} ${isLight ? "glass-panel-light" : ""}`}
      >
        {ready && (
          <>
            <blockquote className="quote-enter">
              <p className="font-display text-quote leading-relaxed tracking-wide text-foreground italic text-center max-w-[60ch] mx-auto">
                "{quote}"
              </p>
            </blockquote>
            <p className="author-enter mt-4 font-body text-sm sm:text-base font-light tracking-widest uppercase text-foreground/70 text-center">
              — {author}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
