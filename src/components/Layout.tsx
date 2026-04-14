import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, Brain, BarChart3, PlusCircle } from "lucide-react";

const navItems = [
  { to: "/", icon: BookOpen, label: "Dashboard" },
  { to: "/questions", icon: PlusCircle, label: "Questions" },
  { to: "/quiz", icon: Brain, label: "Quiz" },
  { to: "/stats", icon: BarChart3, label: "Stats" },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">StudyBuddy</span>
          </NavLink>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
