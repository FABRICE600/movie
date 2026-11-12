"use client";

import { useState } from "react";
import { type MediaItem } from "@/lib/tmdb";
import { ALL_MEDIA } from "@/lib/mock-data";
import { useAppStore } from "@/store/app-store";
import { MovieCard } from "@/components/site/movie-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Bot, User, Lightbulb, Wand2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  results?: MediaItem[];
}

// Mock natural-language movie search.
// A real deployment would call OpenAI / Gemini here through a server route.
function interpretQuery(q: string): { intent: string; results: MediaItem[]; explanation: string } {
  const lower = q.toLowerCase().trim();

  // Mood-based
  if (/(sad|cry|emotional|tearjerker|touching)/.test(lower)) {
    return {
      intent: "mood_sad",
      results: ALL_MEDIA.filter((m) => m.genres.includes(18)).sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 6),
      explanation: "You're in the mood for something emotional. Here are highly-rated dramas that often leave a lasting impression.",
    };
  }
  if (/(scary|horror|frightening|spooky|creepy)/.test(lower)) {
    return {
      intent: "mood_scary",
      results: ALL_MEDIA.filter((m) => m.genres.includes(27)).slice(0, 6),
      explanation: "Looking for scares? These horror picks range from psychological dread to full supernatural terror.",
    };
  }
  if (/(funny|laugh|comedy|humor|hilarious)/.test(lower)) {
    return {
      intent: "mood_funny",
      results: ALL_MEDIA.filter((m) => m.genres.includes(35)).slice(0, 6),
      explanation: "Need a laugh? These comedies span witty satire to slapstick fun.",
    };
  }
  if (/(thrill|excit|edge|suspense)/.test(lower)) {
    return {
      intent: "mood_thriller",
      results: ALL_MEDIA.filter((m) => m.genres.includes(53) || m.genres.includes(28)).slice(0, 6),
      explanation: "In the mood for thrills — these action and suspense titles should keep your heart rate up.",
    };
  }
  if (/(romance|romantic|love story|date night)/.test(lower)) {
    return {
      intent: "mood_romance",
      results: ALL_MEDIA.filter((m) => m.genres.includes(10749)).slice(0, 6),
      explanation: "Romance picks for a cozy watch — sweeping love stories and intimate character pieces.",
    };
  }
  if (/(family|kids|children)/.test(lower)) {
    return {
      intent: "mood_family",
      results: ALL_MEDIA.filter((m) => m.genres.includes(10751) || m.genres.includes(16)).slice(0, 6),
      explanation: "Family-friendly picks suitable for all ages — animation, adventure, and wholesome stories.",
    };
  }
  if (/(africa|african|rwanda|nollywood|nigerian)/.test(lower)) {
    return {
      intent: "region_africa",
      results: ALL_MEDIA.filter((m) => m.originCountry.some((c) => ["RW", "KE", "NG", "ZA"].includes(c))).slice(0, 6),
      explanation: "African cinema highlights — from Rwandan stories to Nollywood and East African productions.",
    };
  }
  if (/(korean|korea|k-drama|kdrama)/.test(lower)) {
    return {
      intent: "region_korean",
      results: ALL_MEDIA.filter((m) => m.originalLanguage === "ko" || m.originCountry.includes("KR")).slice(0, 6),
      explanation: "Korean cinema and K-drama picks — internationally celebrated for their craft.",
    };
  }
  if (/(anime|japanese|japan)/.test(lower)) {
    return {
      intent: "region_anime",
      results: ALL_MEDIA.filter((m) => m.originalLanguage === "ja" || m.originCountry.includes("JP")).slice(0, 6),
      explanation: "Japanese and anime recommendations — from Studio Ghibli–style wonder to modern masterpieces.",
    };
  }
  if (/(short|under 90|quick watch)/.test(lower)) {
    return {
      intent: "runtime_short",
      results: ALL_MEDIA.filter((m) => (m.runtime ?? 999) < 100).slice(0, 6),
      explanation: "Shorter watches under 100 minutes — perfect for a tight schedule.",
    };
  }
  if (/(documentary|true story|real|factual)/.test(lower)) {
    return {
      intent: "genre_doc",
      results: ALL_MEDIA.filter((m) => m.genres.includes(99)).slice(0, 6),
      explanation: "Documentaries and true-story picks to learn something new.",
    };
  }
  if (/(sci-fi|scifi|science fiction|space|future)/.test(lower)) {
    return {
      intent: "genre_scifi",
      results: ALL_MEDIA.filter((m) => m.genres.includes(878)).slice(0, 6),
      explanation: "Science-fiction picks — speculation about the future, technology, and what it means to be human.",
    };
  }
  if (/(classic|old|vintage|before 1990)/.test(lower)) {
    return {
      intent: "era_classic",
      results: ALL_MEDIA.filter((m) => parseInt(m.year) < 1990).sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 6),
      explanation: "Classic cinema — older titles that have stood the test of time.",
    };
  }
  if (/(new|recent|2023|2024|latest)/.test(lower)) {
    return {
      intent: "era_new",
      results: ALL_MEDIA.filter((m) => parseInt(m.year) >= 2023).slice(0, 6),
      explanation: "Recent releases from the last couple of years.",
    };
  }
  if (/(highly rated|best|top|critically)/.test(lower)) {
    return {
      intent: "quality_top",
      results: [...ALL_MEDIA].sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 6),
      explanation: "The highest-rated titles in our catalog — critically acclaimed and audience favorites.",
    };
  }
  if (/(underrated|hidden gem|overlooked)/.test(lower)) {
    return {
      intent: "quality_underrated",
      results: ALL_MEDIA.filter((m) => m.voteAverage >= 7.0 && m.voteCount < 5000).sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 6),
      explanation: "Hidden gems — highly rated but less widely known. Worth your attention.",
    };
  }

  // Fallback: search by keyword
  const matches = ALL_MEDIA.filter(
    (m) =>
      m.title.toLowerCase().includes(lower) ||
      m.overview.toLowerCase().includes(lower) ||
      m.keywords.some((k) => k.toLowerCase().includes(lower)) ||
      m.genreNames.some((g) => g.toLowerCase().includes(lower))
  );
  return {
    intent: "keyword",
    results: matches.slice(0, 6),
    explanation: matches.length
      ? `Here are titles matching "${q}" — click any card to dive into details.`
      : `I couldn't find a strong match for that. Try one of the suggested prompts below, or rephrase with a mood, genre, year, or region.`,
  };
}

const SUGGESTED_PROMPTS = [
  "I want something emotional and sad",
  "Scary movies for tonight",
  "Funny comedy for a laugh",
  "African cinema highlights",
  "Korean drama recommendations",
  "Hidden gem sci-fi",
  "Highly rated classics before 1990",
  "Family friendly for kids",
  "Quick watch under 90 minutes",
  "Romance for date night",
];

export function AiAssistantView() {
  const navigate = useAppStore((s) => s.navigate);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm CineBot, your AI movie companion. Ask me anything — moods, genres, regions, decades — and I'll suggest titles you'll love. Try \"I want something scary\" or \"Korean drama recommendations\".",
    },
  ]);
  const [input, setInput] = useState("");

  const askAssistant = (query: string) => {
    if (!query.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: query };
    const { results, explanation } = interpretQuery(query);
    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: explanation,
      results: results.length ? results : undefined,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            AI Movie Assistant
            <Badge variant="secondary" className="text-[10px]">BETA</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ask in natural language — mood, genre, region, decade, length — and get curated picks.
          </p>
        </div>
      </div>

      {/* Chat area */}
      <Card className="border-border bg-card min-h-[400px] flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[55vh]">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "assistant"
                    ? "bg-gradient-to-br from-primary to-accent text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={`flex-1 ${m.role === "user" ? "text-right" : ""}`}>
                <div
                  className={`inline-block text-left rounded-lg px-3 py-2 text-sm ${
                    m.role === "assistant"
                      ? "bg-muted/60 text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {m.content}
                </div>
                {m.results && m.results.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 max-w-2xl">
                    {m.results.map((item) => (
                      <MovieCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          askAssistant(input);
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything — 'something thrilling', 'African cinema', 'best sci-fi before 2000'..."
          className="flex-1"
        />
        <Button type="submit" className="gap-2">
          <Send className="h-4 w-4" /> Ask
        </Button>
      </form>

      {/* Suggested prompts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lightbulb className="h-4 w-4" /> Try one of these prompts:
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => askAssistant(p)}
              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground border border-border transition-colors flex items-center gap-1.5"
            >
              <Wand2 className="h-3 w-3" /> {p}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/30">
        <strong>Note:</strong> This assistant uses a built-in natural-language interpreter. For production deployments,
        wire it to a real LLM provider (OpenAI, Anthropic, or Gemini) through a server-side API route. Never expose LLM
        API keys in client code.
      </div>
    </div>
  );
}
