"use client";

import { useState, useEffect } from "react";
import {
  Rocket, Plus, Trash2, Edit3, X, Globe, Lock, AlertCircle, Save,
  Loader2, AlertTriangle, ShieldCheck
} from "lucide-react";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/actions/project-actions";
import { useRouter } from "next/navigation";

interface ProjectsClientProps {
  initialProjects: any[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<any[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Tool",
    status: "OFFLINE",
    url: "",
    icon_name: "rocket",
    display_order: 0
  });

  const router = useRouter();

  useEffect(() => { setProjects(initialProjects); }, [initialProjects]);

  async function fetchProjects() {
    const data = await getProjects();
    setProjects(data);
  }

  const handleOpenModal = (project: any = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description || "",
        category: project.category || "Tool",
        status: project.status,
        url: project.url || "",
        icon_name: project.icon_name || "rocket",
        display_order: project.display_order || 0
      });
    } else {
      setEditingProject(null);
      setFormData({ title: "", description: "", category: "Tool", status: "OFFLINE", url: "", icon_name: "rocket", display_order: projects.length });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let result;
    if (editingProject) {
      result = await updateProject(editingProject.id, formData);
    } else {
      result = await createProject(formData);
    }
    if (result.success) {
      setIsModalOpen(false);
      await fetchProjects();
      router.refresh();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const inputStyle = {
    background: "rgba(10,10,14,0.8)",
    border: "1px solid var(--border-soft)",
    color: "var(--silver-200)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "12px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  } as React.CSSProperties;

  return (
    <div
      className="flex-1 flex flex-col min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ background: "var(--bg-root)" }}
    >
      {/* ── Page Header ── */}
      <div
        className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] font-black font-mono mb-1" style={{ color: "var(--silver-600)" }}>
            Ecosystem Management
          </p>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: "var(--silver-100)" }}>
            <Rocket className="w-5 h-5" style={{ color: "var(--silver-400)" }} />
            Node Central
          </h1>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
          style={{
            background: "var(--silver-200)",
            color: "#0f0f13",
            border: "1px solid var(--silver-300)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--silver-100)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px var(--silver-glow), 0 4px 16px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--silver-200)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
          }}
        >
          <Plus className="w-4 h-4" />
          Deploy Node
        </button>
      </div>

      {/* ── Grid Content ── */}
      <div className="p-8 flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="max-w-md mx-auto mt-24 text-center select-none">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
            >
              <Rocket className="w-10 h-10" style={{ color: "var(--silver-700)" }} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest font-mono mb-2" style={{ color: "var(--silver-300)" }}>
              No Nodes Detected
            </h3>
            <p className="text-xs leading-relaxed mb-8 px-4" style={{ color: "var(--silver-600)" }}>
              Your administrative gateway is empty. Initialize system nodes to showcase active projects.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer font-mono"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-soft)", color: "var(--silver-300)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-silver)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)"; }}
            >
              Initialize First Node
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-default"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "var(--bg-elevated)";
                  el.style.borderColor = "var(--border-silver)";
                  el.style.transform = "translateY(-3px)";
                  el.style.boxShadow = "0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,212,216,0.06)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "var(--bg-surface)";
                  el.style.borderColor = "var(--border-subtle)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.4)";
                }}
              >
                {/* Status top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${
                      project.status === "ONLINE" ? "rgba(16,185,129,0.5)" :
                      project.status === "MAINTENANCE" ? "rgba(245,158,11,0.5)" :
                      "rgba(239,68,68,0.3)"
                    }, transparent)`,
                  }}
                />

                <div className="p-7">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4 select-none">
                    <div>
                      <span
                        className="text-[8px] font-black uppercase tracking-widest font-mono px-2 py-0.5 rounded block mb-2 w-max"
                        style={{ background: "var(--bg-active)", border: "1px solid var(--border-soft)", color: "var(--silver-500)" }}
                      >
                        {project.category}
                      </span>
                      <h3
                        className="text-base font-extrabold uppercase tracking-tight font-mono"
                        style={{ color: "var(--silver-100)" }}
                      >
                        {project.title}
                      </h3>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        project.status === "ONLINE" ? "bg-emerald-900/10 border-emerald-800/25 text-emerald-400" :
                        project.status === "MAINTENANCE" ? "bg-amber-900/10 border-amber-800/25 text-amber-400" :
                        "bg-red-900/10 border-red-800/25 text-red-400"
                      }`}
                    >
                      {project.status === "ONLINE" ? <Globe className="w-4 h-4" /> :
                       project.status === "MAINTENANCE" ? <AlertCircle className="w-4 h-4" /> :
                       <Lock className="w-4 h-4" />}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed line-clamp-2 min-h-[36px]" style={{ color: "var(--silver-600)" }}>
                    {project.description || "No description for this node."}
                  </p>

                  {/* Footer Actions */}
                  <div className="mt-6 pt-4 flex items-center justify-between select-none" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        project.status === "ONLINE" ? "bg-emerald-500" :
                        project.status === "MAINTENANCE" ? "bg-amber-500" :
                        "bg-red-500"
                      }`} />
                      <span className="text-[9px] font-black tracking-widest uppercase font-mono" style={{ color: "var(--silver-500)" }}>
                        {project.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(project)}
                        className="p-2 rounded-lg transition-all cursor-pointer"
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-silver)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-200)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-500)"; }}
                        title="Edit Node"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsDeleting(project)}
                        className="p-2 rounded-lg transition-all cursor-pointer"
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-500)"; }}
                        title="Delete Node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Configure Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}>
          <div
            className="w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 relative rounded-2xl"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-silver)", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--silver-400), transparent)" }} />

            <form onSubmit={handleSubmit}>
              <div className="px-7 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-100)" }}>
                    {editingProject ? "Reconfigure Node" : "Initialize Node"}
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest font-mono mt-1" style={{ color: "var(--silver-600)" }}>
                    Ecosystem Integration
                  </p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl cursor-pointer transition-all" style={{ background: "var(--bg-hover)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-7 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>Node Name</label>
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="premium-input" style={inputStyle} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="premium-input" style={{...inputStyle, cursor: "pointer"}}>
                      {["Tool","Personal","Portfolio","E-Commerce","Service"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>Description</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="premium-input resize-none" style={inputStyle} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="premium-input" style={{...inputStyle, cursor: "pointer", color: formData.status === "ONLINE" ? "#10b981" : formData.status === "MAINTENANCE" ? "#f59e0b" : "#ef4444"}}>
                      <option value="ONLINE" style={{ color: "#10b981", background: "#0f0f13" }}>ONLINE</option>
                      <option value="OFFLINE" style={{ color: "#ef4444", background: "#0f0f13" }}>OFFLINE</option>
                      <option value="MAINTENANCE" style={{ color: "#f59e0b", background: "#0f0f13" }}>MAINTENANCE</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>URL</label>
                    <input type="text" value={formData.url} placeholder="https://..." onChange={(e) => setFormData({...formData, url: e.target.value})} className="premium-input" style={inputStyle} />
                  </div>
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 cursor-pointer font-mono transition-all"
                  style={{ background: "var(--silver-200)", color: "#0f0f13", border: "1px solid var(--silver-300)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--silver-100)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px var(--silver-glow)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--silver-200)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingProject ? "Apply Reconfiguration" : "Establish Node"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {isDeleting && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative rounded-2xl"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(239,68,68,0.25)", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-red-600 opacity-60" />
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest font-mono mb-2" style={{ color: "var(--silver-100)" }}>
                Confirm Destruction
              </h3>
              <p className="text-xs leading-relaxed mb-8 px-4" style={{ color: "var(--silver-500)" }}>
                Delete node <span className="text-red-400 font-bold">"{isDeleting.title}"</span>? This is a permanent and irreversible action.
              </p>
              <div className="flex flex-col w-full gap-3 font-mono">
                <button onClick={async () => { setIsSubmitting(true); const r = await deleteProject(isDeleting.id); if (r.success) { setIsDeleting(null); await fetchProjects(); router.refresh(); } else alert(r.error); setIsSubmitting(false); }} disabled={isSubmitting} className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-red-700 transition-all cursor-pointer">
                  {isSubmitting ? "Processing..." : "Confirm Delete"}
                </button>
                <button onClick={() => setIsDeleting(null)} className="w-full py-4 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all cursor-pointer" style={{ background: "var(--bg-hover)", color: "var(--silver-500)", border: "1px solid var(--border-subtle)" }}>
                  Abort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
