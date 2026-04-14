import { useState, useCallback } from "react";

export type QuestionStatus = "new" | "learning" | "mastered" | "needs_review";

export interface Question {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: QuestionStatus;
  timesAsked: number;
  timesCorrect: number;
  lastAsked?: string;
}

export interface QuizResult {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  timestamp: string;
}

export interface QuizSession {
  id: string;
  category: string;
  results: QuizResult[];
  startedAt: string;
  completedAt?: string;
}

const DATA_KEY = "studybuddy_data";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function loadQuestions(): Question[] {
  try {
    const data = localStorage.getItem(DATA_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveQuestions(questions: Question[]) {
  localStorage.setItem(DATA_KEY, JSON.stringify(questions));
}

export function useStudyStore() {
  const [questions, setQuestions] = useState<Question[]>(loadQuestions);

  const persist = useCallback((updated: Question[]) => {
    setQuestions(updated);
    saveQuestions(updated);
  }, []);

  const addQuestion = useCallback((q: Omit<Question, "id" | "status" | "timesAsked" | "timesCorrect">) => {
    const newQ: Question = {
      ...q,
      id: generateId(),
      status: "new",
      timesAsked: 0,
      timesCorrect: 0,
    };
    persist([...loadQuestions(), newQ]);
    return newQ;
  }, [persist]);

  const updateQuestion = useCallback((id: string, updates: Partial<Pick<Question, "question" | "answer" | "category">>) => {
    const all = loadQuestions();
    const updated = all.map(q => q.id === id ? { ...q, ...updates } : q);
    persist(updated);
  }, [persist]);

  const deleteQuestion = useCallback((id: string) => {
    persist(loadQuestions().filter(q => q.id !== id));
  }, [persist]);

  const recordAnswer = useCallback((id: string, correct: boolean) => {
    const all = loadQuestions();
    const updated = all.map(q => {
      if (q.id !== id) return q;
      const timesAsked = q.timesAsked + 1;
      const timesCorrect = q.timesCorrect + (correct ? 1 : 0);
      const accuracy = timesCorrect / timesAsked;
      let status: QuestionStatus = q.status;
      if (timesAsked >= 3 && accuracy >= 0.8) status = "mastered";
      else if (timesAsked >= 2 && accuracy < 0.5) status = "needs_review";
      else if (timesAsked >= 1) status = "learning";
      return { ...q, timesAsked, timesCorrect, status, lastAsked: new Date().toISOString() };
    });
    persist(updated);
  }, [persist]);

  const categories = [...new Set(questions.map(q => q.category))].sort();

  const getQuestionsByCategory = useCallback((cat: string) => {
    return questions.filter(q => q.category === cat);
  }, [questions]);

  const getStats = useCallback(() => {
    const total = questions.length;
    const mastered = questions.filter(q => q.status === "mastered").length;
    const needsReview = questions.filter(q => q.status === "needs_review").length;
    const learning = questions.filter(q => q.status === "learning").length;
    const newQ = questions.filter(q => q.status === "new").length;
    const totalAsked = questions.reduce((a, q) => a + q.timesAsked, 0);
    const totalCorrect = questions.reduce((a, q) => a + q.timesCorrect, 0);
    return { total, mastered, needsReview, learning, new: newQ, totalAsked, totalCorrect, accuracy: totalAsked > 0 ? totalCorrect / totalAsked : 0 };
  }, [questions]);

  return { questions, categories, addQuestion, updateQuestion, deleteQuestion, recordAnswer, getQuestionsByCategory, getStats };
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
  const user = normalize(userAnswer);
  const correct = normalize(correctAnswer);
  if (user === correct) return true;
  // Simple fuzzy: check if >70% of words match
  const userWords = user.split(" ");
  const correctWords = correct.split(" ");
  const matches = correctWords.filter(w => userWords.includes(w)).length;
  return matches / correctWords.length >= 0.7;
}
