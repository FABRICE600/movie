"use client";

import { useState } from "react";
import { MOVIES, TV_SHOWS, PEOPLE } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Check, X, RotateCcw, Sparkles, Award } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";

// Trivia questions are dynamically built from the mock dataset.
type Question = {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
};

function buildQuiz(): Question[] {
  const items = [...MOVIES, ...TV_SHOWS];
  const qs: Question[] = [];

  // Genre questions
  const byGenre = (genreName: string) => items.find((m) => m.genreNames.includes(genreName));
  const action = byGenre("Action");
  if (action) {
    const others = items.filter((m) => m.id !== action.id).slice(0, 3);
    qs.push({
      id: 1,
      text: `Which genre best describes "${action.title}"?`,
      options: [
        { id: "a", text: "Action" },
        { id: "b", text: "Romance" },
        { id: "c", text: others[0]?.genreNames[0] ?? "Comedy" },
        { id: "d", text: "Documentary" },
      ],
      correctOptionId: "a",
      explanation: `"${action.title}" includes Action among its primary genres.`,
    });
  }

  // Rating question
  const topRated = [...items].sort((a, b) => b.voteAverage - a.voteAverage)[0];
  if (topRated) {
    qs.push({
      id: 2,
      text: `Which of these is the highest rated title in our catalog?`,
      options: [
        { id: "a", text: topRated.title },
        { id: "b", text: items[5]?.title ?? "Unknown" },
        { id: "c", text: items[10]?.title ?? "Unknown" },
        { id: "d", text: items[15]?.title ?? "Unknown" },
      ],
      correctOptionId: "a",
      explanation: `"${topRated.title}" has a rating of ${topRated.voteAverage.toFixed(1)} — the highest in the catalog.`,
    });
  }

  // Year question
  const newest = [...items].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))[0];
  if (newest) {
    qs.push({
      id: 3,
      text: `When was "${newest.title}" released?`,
      options: [
        { id: "a", text: newest.year },
        { id: "b", text: String(parseInt(newest.year) - 1) },
        { id: "c", text: String(parseInt(newest.year) - 3) },
        { id: "d", text: String(parseInt(newest.year) + 1) },
      ],
      correctOptionId: "a",
      explanation: `"${newest.title}" was released in ${newest.year}.`,
    });
  }

  // Person question
  if (PEOPLE.length > 1) {
    const person = PEOPLE[0];
    qs.push({
      id: 4,
      text: `What is ${person.name} known for?`,
      options: [
        { id: "a", text: person.knownFor },
        { id: "b", text: PEOPLE[1]?.knownFor ?? "Comedy" },
        { id: "c", text: "Sound design" },
        { id: "d", text: "Stunt coordination" },
      ],
      correctOptionId: "a",
      explanation: `${person.name} is known for ${person.knownFor}.`,
    });
  }

  // Origin country question
  const intlMovie = items.find((m) => !m.originCountry.includes("US"));
  if (intlMovie) {
    qs.push({
      id: 5,
      text: `"${intlMovie.title}" originates from which country?`,
      options: [
        { id: "a", text: intlMovie.originCountry[0] ?? "Unknown" },
        { id: "b", text: "US" },
        { id: "c", text: "GB" },
        { id: "d", text: "CA" },
      ],
      correctOptionId: "a",
      explanation: `"${intlMovie.title}" was produced in ${intlMovie.originCountry.join(", ")}.`,
    });
  }

  // Runtime question
  const longMovie = [...items].filter((m) => m.runtime).sort((a, b) => (b.runtime ?? 0) - (a.runtime ?? 0))[0];
  if (longMovie?.runtime) {
    qs.push({
      id: 6,
      text: `Approximately how long is "${longMovie.title}"?`,
      options: [
        { id: "a", text: `${longMovie.runtime} minutes` },
        { id: "b", text: `${(longMovie.runtime ?? 0) - 40} minutes` },
        { id: "c", text: `${(longMovie.runtime ?? 0) + 35} minutes` },
        { id: "d", text: `${Math.round((longMovie.runtime ?? 100) / 2)} minutes` },
      ],
      correctOptionId: "a",
      explanation: `"${longMovie.title}" runs for ${longMovie.runtime} minutes.`,
    });
  }

  return qs;
}

// Movie trivia facts (illustrative)
const TRIVIA_FACTS = [
  "The first motion picture was created in 1888 by Louis Le Prince, lasting just 2.11 seconds.",
  "Akira Kurosawa's 'Seven Samurai' (1954) inspired countless remakes and remains a masterclass in editing.",
  "Nollywood (Nigerian cinema) is the second-largest film industry in the world by output, after Bollywood.",
  "The 'Bechdel Test' asks whether a work features at least two women talking to each other about something other than a man.",
  "Studio Ghibli's films are hand-drawn, with some shots taking months to complete.",
  "Rwandan cinema has grown significantly since the 2000s, with films like 'Kigali Nights' gaining international attention.",
  "The longest film ever made is 'Logistics' (2012), clocking in at 857 hours (35 days).",
  "The 'language' of cinema was largely established during the silent era — close-ups, cross-cutting, and parallel editing.",
];

export function TriviaView() {
  const navigate = useAppStore((s) => s.navigate);
  const [quiz] = useState(buildQuiz);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  const q = quiz[currentQ];

  const selectAnswer = (optionId: string) => {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    if (optionId === q.correctOptionId) {
      setScore((s) => s + 1);
      toast.success("Correct!");
    } else {
      toast.error("Not quite.");
    }
  };

  const next = () => {
    if (currentQ + 1 >= quiz.length) {
      setShowResult(true);
      return;
    }
    setCurrentQ((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  };

  const restart = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswered(false);
    setShowResult(false);
  };

  const nextFact = () => setFactIndex((i) => (i + 1) % TRIVIA_FACTS.length);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            Movie Trivia & Quizzes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Test your movie knowledge with our quiz.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Quiz section */}
        <div className="space-y-4">
          {!showResult ? (
            <Card className="bg-card border-border">
              <CardContent className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Question {currentQ + 1} of {quiz.length}</span>
                  <Badge variant="secondary">Score: {score}</Badge>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((currentQ + (answered ? 1 : 0)) / quiz.length) * 100}%` }}
                  />
                </div>
                <h2 className="text-lg font-bold">{q.text}</h2>
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const isCorrect = opt.id === q.correctOptionId;
                    const isSelected = opt.id === selected;
                    let style = "border-border hover:bg-muted/40";
                    if (answered && isCorrect) style = "border-green-500 bg-green-500/10";
                    else if (answered && isSelected) style = "border-red-500 bg-red-500/10";
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectAnswer(opt.id)}
                        disabled={answered}
                        className={`w-full text-left p-3 rounded-md border-2 text-sm transition-colors flex items-center justify-between ${style}`}
                      >
                        <span>{opt.text}</span>
                        {answered && isCorrect && <Check className="h-4 w-4 text-green-500" />}
                        {answered && isSelected && !isCorrect && <X className="h-4 w-4 text-red-500" />}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className="text-sm bg-muted/40 rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">Explanation</p>
                    <p>{q.explanation}</p>
                  </div>
                )}
                {answered && (
                  <div className="flex justify-end">
                    <Button onClick={next}>
                      {currentQ + 1 >= quiz.length ? "See results" : "Next question"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-card to-primary/10 border-border">
              <CardContent className="p-8 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-yellow-500/15 text-yellow-500 flex items-center justify-center mx-auto">
                  <Trophy className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Quiz complete!</h2>
                <p className="text-muted-foreground">
                  You scored <span className="font-bold text-primary">{score}</span> out of {quiz.length}
                </p>
                <div className="text-4xl font-black">
                  {Math.round((score / quiz.length) * 100)}%
                </div>
                {score === quiz.length && (
                  <Badge className="bg-yellow-500 text-yellow-foreground">
                    <Sparkles className="h-3 w-3 mr-1" /> Perfect score!
                  </Badge>
                )}
                <Button onClick={restart} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Play again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Trivia fact sidebar */}
        <aside className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm">Did you know?</h3>
              </div>
              <p className="text-sm text-muted-foreground">{TRIVIA_FACTS[factIndex]}</p>
              <Button variant="outline" size="sm" onClick={nextFact}>Next fact</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <h3 className="font-bold text-sm">Achievements</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Complete quizzes to earn achievement badges on your profile. Perfect scores unlock the &quot;Cinephile&quot; badge.
              </p>
              <Button variant="ghost" size="sm" onClick={() => navigate("profile")}>View badges</Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <p className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/30">
        Quiz questions are generated dynamically from the catalog data. Real deployments could expand this with a
        curated trivia database, multiplayer modes, leaderboards, and AI-generated questions.
      </p>
    </div>
  );
}
