"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Search, Trash2, Edit3, X, Check, Loader2, Tag,
  ChevronLeft, ChevronRight, Filter, CheckCircle2, Clock, Circle,
  StickyNote, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { todosAPI, notesAPI } from "@/lib/api";
import { Todo, TodoStatus } from "@/types";
import { format } from "date-fns";
import Link from "next/link";

const STATUS_CONFIG = {
  NEW: { label: "New", icon: Circle, color: "#00d4ff", bg: "rgba(0,212,255,0.1)", border: "rgba(0,212,255,0.25)" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  DONE: { label: "Done", icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
};

const TAG_COLORS = [
  { bg: "rgba(0,212,255,0.12)", color: "#00d4ff", border: "rgba(0,212,255,0.3)" },
  { bg: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "rgba(124,58,237,0.3)" },
  { bg: "rgba(236,72,153,0.12)", color: "#f472b6", border: "rgba(236,72,153,0.3)" },
  { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
];

function getTagColor(tag: string) {
  let hash = 0;
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) % TAG_COLORS.length;
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

const STATUSES: TodoStatus[] = ["NEW", "IN_PROGRESS", "DONE"];

const DEFAULT_FORM = { body: "", tag: "", status: "NEW" as TodoStatus };

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const noteId = parseInt(id);

  const [note, setNote] = useState<any>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TodoStatus | "">("");
  const [filterTag, setFilterTag] = useState("");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await todosAPI.getAll(noteId, {
        page,
        limit: 10,
        search: search || undefined,
        status: filterStatus || undefined,
        tag: filterTag || undefined,
      });
      const data = res.data?.data;
      setNote(data?.note);
      setTodos(data?.todos || []);
      setPagination(data?.pagination);
    } catch {
      toast.error("Failed to load todos");
    }
    setLoading(false);
  }, [noteId, page, search, filterStatus, filterTag]);

  useEffect(() => {
    const t = setTimeout(fetchTodos, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchTodos, search]);

  const handleCreate = async () => {
    if (!form.body.trim()) return toast.error("Task body required");
    setSubmitting(true);
    try {
      await todosAPI.create({ ...form, note_id: String(noteId) });
      toast.success("Task created!");
      setForm(DEFAULT_FORM);
      setShowCreate(false);
      fetchTodos();
    } catch {
      toast.error("Failed to create task");
    }
    setSubmitting(false);
  };

  const handleUpdate = async () => {
    if (!editTodo) return;
    setSubmitting(true);
    try {
      await todosAPI.update(editTodo.id, { body: form.body, tag: form.tag, status: form.status });
      toast.success("Task updated!");
      setEditTodo(null);
      setForm(DEFAULT_FORM);
      fetchTodos();
    } catch {
      toast.error("Failed to update task");
    }
    setSubmitting(false);
  };

  const handleQuickStatus = async (todo: Todo, status: TodoStatus) => {
    try {
      await todosAPI.update(todo.id, { status });
      setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, status } : t));
      toast.success(`Marked as ${STATUS_CONFIG[status].label}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await todosAPI.delete(selectedIds);
      toast.success(`Deleted ${selectedIds.length} task(s)`);
      setSelectedIds([]);
      setDeleteConfirm(false);
      fetchTodos();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const openEdit = (todo: Todo) => {
    setEditTodo(todo);
    setForm({ body: todo.body, tag: todo.tag || "", status: todo.status });
  };

  const activeFilters = [filterStatus, filterTag].filter(Boolean).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back + Note Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/notes"
          className="inline-flex items-center gap-2 text-sm mb-4 transition-colors hover:text-white"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={15} /> Back to Notes
        </Link>

        {note ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StickyNote size={16} style={{ color: "var(--accent-cyan)" }} />
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    NOTE #{note.id}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{note.title}</h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Created {format(new Date(note.created_at), "MMMM d, yyyy")} · {pagination?.total ?? 0} tasks
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setShowCreate(true); setForm(DEFAULT_FORM); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #0066cc, #00d4ff)",
                  boxShadow: "0 4px 16px rgba(0,212,255,0.2)",
                }}
              >
                <Plus size={16} /> Add Task
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="h-16 shimmer rounded-xl" />
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-11 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "var(--text-muted)" }}>
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative"
          style={{
            border: `1px solid ${activeFilters ? "var(--accent-cyan)" : "var(--border)"}`,
            color: activeFilters ? "var(--accent-cyan)" : "var(--text-secondary)",
            background: activeFilters ? "rgba(0,212,255,0.05)" : "transparent",
          }}
        >
          <Filter size={15} />
          Filters
          {activeFilters > 0 && (
            <span
              className="w-4 h-4 rounded-full text-xs flex items-center justify-center text-black font-bold"
              style={{ background: "var(--accent-cyan)" }}
            >
              {activeFilters}
            </span>
          )}
        </button>
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
            >
              <Trash2 size={14} /> ({selectedIds.length})
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="rounded-xl p-4 flex flex-wrap gap-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              {/* Status filter */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>STATUS</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus("")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: !filterStatus ? "rgba(0,212,255,0.12)" : "transparent",
                      border: `1px solid ${!filterStatus ? "rgba(0,212,255,0.3)" : "var(--border)"}`,
                      color: !filterStatus ? "var(--accent-cyan)" : "var(--text-secondary)",
                    }}
                  >
                    All
                  </button>
                  {STATUSES.map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s === filterStatus ? "" : s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: filterStatus === s ? cfg.bg : "transparent",
                          border: `1px solid ${filterStatus === s ? cfg.border : "var(--border)"}`,
                          color: filterStatus === s ? cfg.color : "var(--text-secondary)",
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Tag filter */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>TAG</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Filter by tag..."
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="input-field text-xs py-1.5 px-3"
                    style={{ width: 150 }}
                  />
                  {filterTag && (
                    <button onClick={() => setFilterTag("")} style={{ color: "var(--text-muted)" }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo List */}
      <div className="space-y-3">
        {loading ? (
          Array(4).fill(null).map((_, i) => (
            <div key={i} className="h-20 shimmer rounded-xl" />
          ))
        ) : todos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            {search || filterStatus || filterTag ? (
              <>
                <AlertCircle size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                <h3 className="font-semibold text-white mb-1">No matching tasks</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Try adjusting your filters</p>
              </>
            ) : (
              <>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.12)" }}
                >
                  <Plus size={28} style={{ color: "var(--accent-cyan)" }} />
                </div>
                <h3 className="font-semibold text-white mb-2">No tasks yet</h3>
                <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                  Add your first task to this note
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #0066cc, #00d4ff)" }}
                >
                  <Plus size={16} /> Add First Task
                </button>
              </>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {todos.map((todo, idx) => {
              const cfg = STATUS_CONFIG[todo.status];
              const selected = selectedIds.includes(todo.id);
              const tagColor = todo.tag ? getTagColor(todo.tag) : null;

              return (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="rounded-xl p-4 flex items-start gap-3 group"
                  style={{
                    background: "var(--bg-card)",
                    border: `1px solid ${selected ? "var(--accent-cyan)" : "var(--border)"}`,
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Select */}
                  <div
                    className="mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 cursor-pointer"
                    style={{
                      background: selected ? "var(--accent-cyan)" : "transparent",
                      borderColor: selected ? "var(--accent-cyan)" : "var(--border)",
                    }}
                    onClick={() => toggleSelect(todo.id)}
                  >
                    {selected && <Check size={12} className="text-black" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium text-white leading-relaxed"
                      style={{ textDecoration: todo.status === "DONE" ? "line-through" : "none", opacity: todo.status === "DONE" ? 0.5 : 1 }}
                    >
                      {todo.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {/* Status badge */}
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        <cfg.icon size={10} />
                        {cfg.label}
                      </span>
                      {/* Tag */}
                      {todo.tag && tagColor && (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: tagColor.bg, color: tagColor.color, border: `1px solid ${tagColor.border}` }}
                        >
                          <Tag size={9} />
                          {todo.tag}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {format(new Date(todo.created_at), "MMM d")}
                      </span>
                    </div>
                  </div>

                  {/* Quick status cycle + edit */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Cycle status */}
                    {STATUSES.filter((s) => s !== todo.status).map((s) => {
                      const c = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => handleQuickStatus(todo, s)}
                          className="p-1.5 rounded-lg text-xs transition-all"
                          title={`Mark as ${c.label}`}
                          style={{ background: c.bg, border: `1px solid ${c.border}` }}
                        >
                          <c.icon size={12} style={{ color: c.color }} />
                        </button>
                      );
                    })}
                    <button
                      onClick={() => openEdit(todo)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                    >
                      <Edit3 size={13} style={{ color: "var(--text-secondary)" }} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPreviousPage}
            className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNextPage}
            className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(showCreate || editTodo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreate(false);
                setEditTodo(null);
              }
            }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 22 }}
              className="w-full max-w-lg rounded-2xl p-6"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">
                  {editTodo ? "Edit Task" : "New Task"}
                </h2>
                <button
                  onClick={() => { setShowCreate(false); setEditTodo(null); }}
                  className="p-1.5 rounded-lg hover:bg-white/5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Body */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Task Description *
                  </label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    placeholder="What needs to be done?"
                    rows={3}
                    className="input-field resize-none"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Tag */}
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Tag
                    </label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        value={form.tag}
                        onChange={(e) => setForm({ ...form, tag: e.target.value })}
                        placeholder="e.g. backend"
                        className="input-field pl-9 text-sm"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as TodoStatus })}
                      className="input-field text-sm appearance-none cursor-pointer"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Preview */}
                <div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: STATUS_CONFIG[form.status].bg, border: `1px solid ${STATUS_CONFIG[form.status].border}` }}
                >
                  {(() => {
                    const cfg = STATUS_CONFIG[form.status];
                    return (
                      <>
                        <cfg.icon size={16} style={{ color: cfg.color }} />
                        <span className="text-sm font-medium" style={{ color: cfg.color }}>
                          Will be marked as {cfg.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => { setShowCreate(false); setEditTodo(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={editTodo ? handleUpdate : handleCreate}
                  disabled={submitting || !form.body.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #0066cc, #00d4ff)" }}
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editTodo ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(239,68,68,0.1)" }}
              >
                <Trash2 size={24} style={{ color: "#ef4444" }} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete Tasks?</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                {selectedIds.length} task(s) will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#ef4444" }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
