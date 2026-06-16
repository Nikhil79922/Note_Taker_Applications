"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, StickyNote, Trash2, Edit3, ArrowRight, X, Check, Loader2,
  Calendar, ChevronLeft, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { notesAPI } from "@/lib/api";
import { Note } from "@/types";
import { format } from "date-fns";
import Link from "next/link";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notesAPI.getAll({ page, limit: 9, search: search || undefined });
      setNotes(res.data?.data?.items || []);
      setPagination(res.data?.data?.pagination || null);
    } catch {
      toast.error("Failed to load notes");
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchNotes, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchNotes, search]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return toast.error("Title required");
    setSubmitting(true);
    try {
      await notesAPI.create({ title: newTitle.trim() });
      toast.success("Note created!");
      setNewTitle("");
      setShowCreate(false);
      fetchNotes();
    } catch {
      toast.error("Failed to create note");
    }
    setSubmitting(false);
  };

  const handleUpdate = async () => {
    if (!editNote || !newTitle.trim()) return;
    setSubmitting(true);
    try {
      await notesAPI.update(editNote.id, { title: newTitle.trim() });
      toast.success("Note updated!");
      setEditNote(null);
      setNewTitle("");
      fetchNotes();
    } catch {
      toast.error("Failed to update note");
    }
    setSubmitting(false);
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    try {
      await notesAPI.delete(selectedIds);
      toast.success(`Deleted ${selectedIds.length} note(s)`);
      setSelectedIds([]);
      setDeleteConfirm(false);
      fetchNotes();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">My Notes</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {pagination?.total ?? 0} notebooks in your workspace
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowCreate(true); setNewTitle(""); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{
            background: "linear-gradient(135deg, #0066cc, #00d4ff)",
            boxShadow: "0 4px 20px rgba(0,212,255,0.25)",
          }}
        >
          <Plus size={18} /> New Note
        </motion.button>
      </div>

      {/* Search + Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-11"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-white transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#ef4444",
              }}
            >
              <Trash2 size={14} /> Delete ({selectedIds.length})
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(null).map((_, i) => (
            <div key={i} className="card h-36 shimmer" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <StickyNote size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-lg font-semibold text-white mb-2">
            {search ? "No notes match your search" : "No notes yet"}
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {search ? "Try a different search term" : "Create your first note to get started"}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #0066cc, #00d4ff)" }}
            >
              <Plus size={16} /> Create your first note
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {notes.map((note) => {
            const selected = selectedIds.includes(note.id);
            return (
              <motion.div
                key={note.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="card group relative overflow-hidden cursor-pointer"
                style={{ border: selected ? "1px solid var(--accent-cyan)" : undefined }}
              >
                {/* Select checkbox */}
                <div
                  className="absolute top-3 left-3 z-10"
                  onClick={(e) => { e.preventDefault(); toggleSelect(note.id); }}
                >
                  <div
                    className="w-5 h-5 rounded-md border flex items-center justify-center transition-all"
                    style={{
                      background: selected ? "var(--accent-cyan)" : "transparent",
                      borderColor: selected ? "var(--accent-cyan)" : "var(--border)",
                    }}
                  >
                    {selected && <Check size={12} className="text-black" />}
                  </div>
                </div>

                {/* Edit button */}
                <button
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                  onClick={(e) => {
                    e.preventDefault();
                    setEditNote(note);
                    setNewTitle(note.title);
                  }}
                >
                  <Edit3 size={13} style={{ color: "var(--text-secondary)" }} />
                </button>

                {/* Gradient accent */}
                <div
                  className="absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))" }}
                />

                <Link href={`/dashboard/notes/${note.id}`} className="block p-5 pt-10">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.12)" }}
                  >
                    <StickyNote size={18} style={{ color: "var(--accent-cyan)" }} />
                  </div>
                  <h3 className="font-semibold text-white text-base mb-2 truncate group-hover:text-cyan-400 transition-colors">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Calendar size={12} />
                    {format(new Date(note.created_at), "MMM d, yyyy")}
                  </div>
                  <div
                    className="flex items-center gap-1 mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: "var(--accent-cyan)" }}
                  >
                    Open note <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPreviousPage}
            className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNextPage}
            className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(showCreate || editNote) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreate(false);
                setEditNote(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">
                  {editNote ? "Rename Note" : "New Note"}
                </h2>
                <button
                  onClick={() => { setShowCreate(false); setEditNote(null); }}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (editNote ? handleUpdate() : handleCreate())}
                placeholder="Note title..."
                className="input-field mb-5"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCreate(false); setEditNote(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={editNote ? handleUpdate : handleCreate}
                  disabled={submitting || !newTitle.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #0066cc, #00d4ff)" }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : (editNote ? "Save" : "Create")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
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
              <h3 className="text-lg font-bold text-white mb-2">Delete Notes?</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                This will permanently delete {selectedIds.length} note(s) and all their todos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#ef4444", color: "white" }}
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
