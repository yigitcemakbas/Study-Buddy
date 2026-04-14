import { useStudyStore } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";
import { BarChart3, Target, AlertTriangle, BookOpen } from "lucide-react";

export default function Stats() {
  const { questions, categories, getStats } = useStudyStore();
  const stats = getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground">Track your learning.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total", value: stats.total, icon: BookOpen },
          { label: "Accuracy", value: stats.totalAsked > 0 ? `${Math.round(stats.accuracy * 100)}%` : "—", icon: Target },
          { label: "Answered", value: stats.totalAsked, icon: BarChart3 },
          { label: "Mastered", value: stats.mastered, icon: Target },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Status Breakdown</h2>
        <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-muted">
          {stats.total > 0 && (
            <>
              {stats.mastered > 0 && <div className="bg-success" style={{ width: `${(stats.mastered / stats.total) * 100}%` }} />}
              {stats.learning > 0 && <div className="bg-secondary-foreground/40" style={{ width: `${(stats.learning / stats.total) * 100}%` }} />}
              {stats.needsReview > 0 && <div className="bg-destructive" style={{ width: `${(stats.needsReview / stats.total) * 100}%` }} />}
              {stats.new > 0 && <div className="bg-muted-foreground/20" style={{ width: `${(stats.new / stats.total) * 100}%` }} />}
            </>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success inline-block" /> Mastered ({stats.mastered})</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-secondary-foreground/40 inline-block" /> Learning ({stats.learning})</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-destructive inline-block" /> Needs Review ({stats.needsReview})</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20 inline-block" /> New ({stats.new})</span>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">By Category</h2>
          {categories.map(cat => {
            const catQ = questions.filter(q => q.category === cat);
            const mastered = catQ.filter(q => q.status === "mastered").length;
            const needsReview = catQ.filter(q => q.status === "needs_review").length;
            const asked = catQ.reduce((a, q) => a + q.timesAsked, 0);
            const correct = catQ.reduce((a, q) => a + q.timesCorrect, 0);
            const acc = asked > 0 ? Math.round((correct / asked) * 100) : 0;
            return (
              <div key={cat} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{cat}</h3>
                    <p className="text-sm text-muted-foreground">{catQ.length} questions · {acc}% accuracy</p>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {needsReview > 0 && (
                      <span className="flex items-center gap-1 text-destructive">
                        <AlertTriangle className="h-3 w-3" /> {needsReview}
                      </span>
                    )}
                    <span>{mastered}/{catQ.length} mastered</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${catQ.length > 0 ? (mastered / catQ.length) * 100 : 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">All Questions</h2>
          <div className="space-y-1">
            {questions
              .slice()
              .sort((a, b) => (a.timesCorrect / Math.max(a.timesAsked, 1)) - (b.timesCorrect / Math.max(b.timesAsked, 1)))
              .map(q => (
                <div key={q.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{q.question}</p>
                    <p className="text-xs text-muted-foreground">{q.category} · {q.timesCorrect}/{q.timesAsked}</p>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
