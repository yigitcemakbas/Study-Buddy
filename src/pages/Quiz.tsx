import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useStudyStore, checkAnswer } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Brain } from "lucide-react";
import { Link } from "react-router-dom";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const { questions, categories, recordAnswer } = useStudyStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [started, setStarted] = useState(!!categoryParam);
  const [quizQuestions, setQuizQuestions] = useState<typeof questions>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<null | { correct: boolean; correctAnswer: string }>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  const availableQuestions = useMemo(() => {
    if (selectedCategory) return questions.filter(q => q.category === selectedCategory);
    return questions;
  }, [questions, selectedCategory]);

  const startQuiz = () => {
    const shuffled = shuffle(availableQuestions);
    setQuizQuestions(shuffled);
    setCurrentIdx(0);
    setScore({ correct: 0, total: 0 });
    setResult(null);
    setUserAnswer("");
    setFinished(false);
    setStarted(true);
  };

  const submitAnswer = () => {
    if (!userAnswer.trim()) return;
    const q = quizQuestions[currentIdx];
    const correct = checkAnswer(userAnswer, q.answer);
    recordAnswer(q.id, correct);
    setResult({ correct, correctAnswer: q.answer });
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= quizQuestions.length) {
      setFinished(true);
    } else {
      setCurrentIdx(i => i + 1);
      setUserAnswer("");
      setResult(null);
    }
  };

  if (!started || quizQuestions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Start a Quiz</h1>
        {questions.length === 0 ? (
          <div className="rounded-lg border p-10 text-center">
            <p className="text-muted-foreground">No questions available. Add some first!</p>
            <Link to="/questions"><Button className="mt-4">Add Questions</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">Select a category or quiz all questions.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button onClick={() => setSelectedCategory(null)} className={`rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 ${selectedCategory === null ? "ring-2 ring-primary" : ""}`}>
                <h3 className="font-medium">All Categories</h3>
                <p className="text-sm text-muted-foreground">{questions.length} questions</p>
              </button>
              {categories.map(cat => {
                const count = questions.filter(q => q.category === cat).length;
                return (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 ${selectedCategory === cat ? "ring-2 ring-primary" : ""}`}>
                    <h3 className="font-medium">{cat}</h3>
                    <p className="text-sm text-muted-foreground">{count} questions</p>
                  </button>
                );
              })}
            </div>
            <Button onClick={startQuiz} disabled={availableQuestions.length === 0}>
              <Brain className="mr-2 h-4 w-4" /> Start Quiz ({availableQuestions.length} questions)
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (finished) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-lg border p-8 text-center">
          <Brain className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-3 text-2xl font-bold">Quiz Complete!</h1>
          <p className="mt-2 text-4xl font-bold">{pct}%</p>
          <p className="text-muted-foreground">{score.correct} of {score.total} correct</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={startQuiz}>
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Link to="/"><Button variant="outline">Dashboard</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const q = quizQuestions[currentIdx];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Question {currentIdx + 1} of {quizQuestions.length}</p>
        <p className="text-sm font-medium">{score.correct}/{score.total} correct</p>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }} />
      </div>

      <div className="rounded-lg border p-6">
        <span className="text-xs font-medium text-primary">{q.category}</span>
        <h2 className="mt-2 text-lg font-semibold">{q.question}</h2>
      </div>

      {!result ? (
        <div className="space-y-3">
          <Textarea
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder="Type your answer..."
            rows={4}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
            autoFocus
          />
          <Button onClick={submitAnswer} className="w-full" disabled={!userAnswer.trim()}>
            Submit Answer
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`rounded-lg border p-4 ${result.correct ? "border-success/50 bg-success/5" : "border-destructive/50 bg-destructive/5"}`}>
            <div className="flex items-center gap-2">
              {result.correct ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
              <p className="font-medium">{result.correct ? "Correct!" : "Not quite right"}</p>
            </div>
            {!result.correct && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Your answer: {userAnswer}</p>
                <p className="mt-1 text-sm font-medium">Correct answer: {result.correctAnswer}</p>
              </div>
            )}
          </div>
          <Button onClick={nextQuestion} className="w-full">
            {currentIdx + 1 >= quizQuestions.length ? "See Results" : "Next Question"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
