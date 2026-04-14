import { useState } from "react";
import { useStudyStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

export default function Questions() {
  const { questions, categories, addQuestion, updateQuestion, deleteQuestion } = useStudyStore();
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "" });

  const filtered = filter === "all" ? questions : questions.filter(q => q.category === filter);

  const handleSubmit = () => {
    if (!form.question.trim() || !form.answer.trim() || !form.category.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (editId) {
      updateQuestion(editId, form);
      toast.success("Question updated!");
    } else {
      addQuestion(form);
      toast.success("Question added!");
    }
    setForm({ question: "", answer: "", category: "" });
    setEditId(null);
    setDialogOpen(false);
  };

  const openEdit = (q: typeof questions[0]) => {
    setEditId(q.id);
    setForm({ question: q.question, answer: q.answer, category: q.category });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm({ question: "", answer: "", category: "" });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground">{questions.length} total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Question" : "Add Question"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Biology, History..."
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="text-sm font-medium">Question</label>
                <Textarea
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  placeholder="Enter your question..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Answer</label>
                <Textarea
                  value={form.answer}
                  onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                  placeholder="Enter the correct answer..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editId ? "Update" : "Add"} Question
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
        {categories.map(c => (
          <Button key={c} variant={filter === c ? "default" : "outline"} size="sm" onClick={() => setFilter(c)}>{c}</Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No questions yet. Add some to get started!
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(q => (
            <div key={q.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary">{q.category}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <p className="font-medium">{q.question}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{q.answer}</p>
                  {q.timesAsked > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {q.timesCorrect}/{q.timesAsked} correct ({Math.round((q.timesCorrect / q.timesAsked) * 100)}%)
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { deleteQuestion(q.id); toast.success("Deleted"); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
