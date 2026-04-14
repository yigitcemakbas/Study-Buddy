import { useStudyStore } from "@/lib/store";
import { Brain, BookOpen, Target, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { getStats, categories, questions } = useStudyStore();
  const stats = getStats();

  const statCards = [
    { label: "Total Questions", value: stats.total, icon: BookOpen },
    { label: "Mastered", value: stats.mastered, icon: Target },
    { label: "Needs Review", value: stats.needsReview, icon: AlertTriangle },
    { label: "Accuracy", value: stats.totalAsked > 0 ? `${Math.round(stats.accuracy * 100)}%` : "—", icon: Brain },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Your study progress at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {questions.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">Get Started</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add your first questions to start studying.</p>
          <Link to="/questions">
            <Button className="mt-4">Add Questions</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Categories</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(cat => {
              const catQ = questions.filter(q => q.category === cat);
              const mastered = catQ.filter(q => q.status === "mastered").length;
              const pct = catQ.length > 0 ? Math.round((mastered / catQ.length) * 100) : 0;
              return (
                <Link to={`/quiz?category=${encodeURIComponent(cat)}`} key={cat} className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <h3 className="font-medium">{cat}</h3>
                  <p className="text-sm text-muted-foreground">{catQ.length} questions</p>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{pct}% mastered</p>
                </Link>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Link to="/quiz"><Button>Start Quiz</Button></Link>
            <Link to="/questions"><Button variant="outline">Manage Questions</Button></Link>
          </div>
        </div>
      )}
    </div>
  );
}
