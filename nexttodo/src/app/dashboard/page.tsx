"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StickyNote, CheckCircle2, Clock, Zap, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { notesAPI, todosAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { format } from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ notes: 0, todos: 0, done: 0, inProgress: 0 });
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notesRes = await notesAPI.getAll({ page: 1, limit: 100 });
        const notes = notesRes.data?.data?.items || [];
        setRecentNotes(notes.slice(0, 4));
        setStats((s) => ({ ...s, notes: notesRes.data?.data?.pagination?.total || 0 }));
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Notes",
      value: stats.notes,
      icon: StickyNote,
      color: "#00d4ff",
      bg: "rgba(0,212,255,0.1)",
      border: "rgba(0,212,255,0.2)",
    },
    {
      label: "Active Tasks",
      value: "∞",
      icon: Clock,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
    },
    {
      label: "Completed",
      value: "—",
      icon: CheckCircle2,
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.2)",
    },
    {
      label: "Productivity",
      value: "🔥",
      icon: TrendingUp,
      color: "#ec4899",
      bg: "rgba(236,72,153,0.1)",
      border: "rgba(236,72,153,0.2)",
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white">
          {greeting},{" "}
          <span className="neon-text">{user?.name?.split(" ")[0] || "there"}</span> 👋
        </h1>
        <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>
          Here's what's happening in your workspace
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="card p-5"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: card.bg, border: `1px solid ${card.border}` }}
            >
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {loading ? (
                <span className="inline-block w-8 h-6 shimmer rounded" />
              ) : (
                card.value
              )}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {card.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Notes + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Notes */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent Notes</h2>
            <Link
              href="/dashboard/notes"
              className="flex items-center gap-1 text-sm transition-colors hover:text-cyan-300"
              style={{ color: "var(--accent-cyan)" }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {loading
              ? Array(3).fill(null).map((_, i) => (
                  <div key={i} className="card p-4 h-20 shimmer" />
                ))
              : recentNotes.length === 0
              ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card p-8 text-center"
                >
                  <StickyNote size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                  <p className="font-medium text-white mb-1">No notes yet</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Create your first note to get started
                  </p>
                  <Link
                    href="/dashboard/notes"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #0066cc, #00d4ff)" }}
                  >
                    <Plus size={14} /> Create Note
                  </Link>
                </motion.div>
              )
              : recentNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  <Link href={`/dashboard/notes/${note.id}`} className="card p-4 flex items-center gap-4 group block">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)" }}
                    >
                      <StickyNote size={18} style={{ color: "var(--accent-cyan)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                        {note.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {format(new Date(note.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--accent-cyan)" }}
                    />
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/notes"
              className="card p-4 flex items-center gap-3 group block"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)" }}
              >
                <Plus size={18} style={{ color: "var(--accent-cyan)" }} />
              </div>
              <div>
                <p className="font-medium text-white text-sm">New Note</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Create a notebook
                </p>
              </div>
              <ChevronRight
                size={16}
                className="ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1"
                style={{ color: "var(--accent-cyan)" }}
              />
            </Link>

            <div
              className="card p-4"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(0,212,255,0.05))" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} style={{ color: "#7c3aed" }} />
                <span className="text-sm font-semibold text-white">Pro Tip</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Organize your tasks with tags like <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded">backend</code>,{" "}
                <code className="text-purple-400 bg-purple-400/10 px-1 rounded">design</code> and
                track progress with status filters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className, style }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} style={style}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
