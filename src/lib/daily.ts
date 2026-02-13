// Deterministic seed from a date string
function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Seeded pseudo-random number generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateGradient(dateStr: string): string[] {
  const seed = hashDate(dateStr);
  const rand = seededRandom(seed);

  const count = 2 + Math.floor(rand() * 3); // 2-4 colors
  const colors: string[] = [];

  const baseHue = Math.floor(rand() * 360);

  for (let i = 0; i < count; i++) {
    const hue = (baseHue + Math.floor(rand() * 120) - 30 + 360) % 360;
    const sat = 60 + Math.floor(rand() * 30); // 60-90
    const light = 45 + Math.floor(rand() * 20); // 45-65
    colors.push(`hsl(${hue}, ${sat}%, ${light}%)`);
  }

  return colors;
}

export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

interface DailyData {
  date: string;
  quote: string;
  author: string;
  colors: string[];
}

const STORAGE_KEY = 'daily-motivation';

export function getStored(): DailyData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DailyData;
  } catch {
    return null;
  }
}

export function store(data: DailyData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Fallback quotes in case API is down
const FALLBACK_QUOTES = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { content: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { content: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
];

export async function fetchQuote(): Promise<{ content: string; author: string }> {
  try {
    const res = await fetch('https://api.quotable.io/random', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return { content: data.content, author: data.author };
  } catch {
    // Use deterministic fallback based on today
    const seed = hashDate(getTodayString());
    const idx = seed % FALLBACK_QUOTES.length;
    return FALLBACK_QUOTES[idx];
  }
}
