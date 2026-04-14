import type { QuestionStatus } from "@/lib/store";

const styles: Record<QuestionStatus, string> = {
  new: "bg-muted text-muted-foreground",
  learning: "bg-primary/10 text-primary",
  mastered: "bg-success/15 text-success",
  needs_review: "bg-destructive/10 text-destructive",
};

const labels: Record<QuestionStatus, string> = {
  new: "New",
  learning: "Learning",
  mastered: "Mastered",
  needs_review: "Needs Review",
};

export default function StatusBadge({ status }: { status: QuestionStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
