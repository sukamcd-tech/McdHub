"use client";

import { useState, useEffect } from "react";
import {
  Smartphone, Plus, Trash2, Edit3, X, AlertCircle, Save,
  Loader2, AlertTriangle, FileDown, CheckCircle2, Info, ListPlus,
  Calendar, HardDrive, Tag
} from "lucide-react";
import {
  getAppReleases,
  createAppRelease,
  updateAppRelease,
  deleteAppRelease
} from "@/lib/actions/app-release-actions";
import { useRouter } from "next/navigation";

interface ReleaseItem {
  id: string;
  app_name: string;
  version: string;
  release_date: string;
  size_label: string;
  apk_path: string | null;
  apk_size_bytes: number | null;
  changelog: Array<{ type: string; text: string }>;
  is_latest: boolean;
  force_update: boolean;
  created_at: string;
  updated_at: string;
}

interface AppsClientProps {
  initialReleases: ReleaseItem[];
}

export default function AppsClient({ initialReleases }: AppsClientProps) {
  const [releases, setReleases] = useState<ReleaseItem[]>(initialReleases);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<ReleaseItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<ReleaseItem | null>(null);
  
  // Form State
  const [appName, setAppName] = useState("McdWallet");
  const [version, setVersion] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const [changelogRaw, setChangelogRaw] = useState("");
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [isLatest, setIsLatest] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  // Upload Progress State
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    setReleases(initialReleases);
  }, [initialReleases]);

  async function refreshReleases() {
    const data = await getAppReleases();
    setReleases(data as ReleaseItem[]);
  }

  const handleOpenModal = (release: ReleaseItem | null = null) => {
    setUploadProgress(null);
    setUploadStatus("");

    if (release) {
      setEditingRelease(release);
      setAppName(release.app_name);
      setVersion(release.version);
      setReleaseDate(release.release_date);
      setSizeLabel(release.size_label || "");
      setIsLatest(release.is_latest);
      setForceUpdate(release.force_update ?? false);
      setApkFile(null); // No re-upload by default
      
      // Parse changelog array back into line-by-line text
      const notes = release.changelog?.map((item) => `${item.type}: ${item.text}`).join("\n") || "";
      setChangelogRaw(notes);
    } else {
      setEditingRelease(null);
      setAppName("McdWallet");
      setVersion("");
      // Default to today's date formatted as YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];
      setReleaseDate(today);
      setSizeLabel("");
      setChangelogRaw("");
      setApkFile(null);
      setIsLatest(true);
      setForceUpdate(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingRelease) {
        // Parse changelog for update
        const parsedChangelog = changelogRaw
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => {
            const [typeRaw, ...rest] = line.split(":");
            const type = ["new", "fix", "improve"].includes(typeRaw.toLowerCase())
              ? typeRaw.toLowerCase()
              : "new";
            const text = rest.join(":").trim() || line;
            return { type, text };
          });

        const result = await updateAppRelease(editingRelease.id, {
          version,
          release_date: releaseDate,
          size_label: sizeLabel,
          changelog: parsedChangelog,
          is_latest: isLatest,
          force_update: forceUpdate
        });

        if (result.success) {
          setIsModalOpen(false);
          await refreshReleases();
          router.refresh();
        } else {
          alert(`Error: ${result.error}`);
        }
      } else {
        // Create requires APK file
        if (!apkFile) {
          alert("Please select an APK file to upload.");
          setIsSubmitting(false);
          return;
        }

        setUploadStatus("Menyiapkan upload...");
        
        // 1. Dapatkan Signed URL
        const signedUrlRes = await fetch("/api/admin/apps/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            app_name: appName,
            version: version,
          }),
        });

        if (!signedUrlRes.ok) {
          const errData = await signedUrlRes.json().catch(() => ({}));
          alert(`Error: ${errData.error || "Gagal mendapatkan upload URL."}`);
          setIsSubmitting(false);
          return;
        }

        const signedUrlData = await signedUrlRes.json();
        if (!signedUrlData.success || !signedUrlData.signedUrl) {
          alert(`Error: ${signedUrlData.error || "Gagal mendapatkan upload URL."}`);
          setIsSubmitting(false);
          return;
        }

        setUploadStatus("Mengupload ke Supabase...");
        setUploadProgress(0);

        // 2. Upload langsung ke Supabase Storage via PUT
        const uploadResult = await new Promise<{ success: boolean; apkPath?: string; apkSizeBytes?: number; error?: string }>((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signedUrlData.signedUrl, true);
          
          xhr.setRequestHeader("Content-Type", apkFile.type || "application/vnd.android.package-archive");

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({
                success: true,
                apkPath: signedUrlData.fileName,
                apkSizeBytes: apkFile.size,
              });
            } else {
              resolve({
                success: false,
                error: `Upload gagal dengan status ${xhr.status} (${xhr.statusText})`,
              });
            }
          };

          xhr.onerror = () => {
            resolve({ success: false, error: "Kesalahan jaringan saat mengupload ke storage." });
          };

          xhr.send(apkFile);
        });

        if (!uploadResult.success) {
          alert(`Error: ${uploadResult.error}`);
          setUploadProgress(null);
          setUploadStatus("");
          setIsSubmitting(false);
          return;
        }

        setUploadStatus("Menyimpan rilis...");
        setUploadProgress(null);

        const formData = new FormData();
        formData.append("app_name", appName);
        formData.append("version", version);
        formData.append("release_date", releaseDate);
        formData.append("size_label", sizeLabel);
        formData.append("changelog", changelogRaw);
        formData.append("force_update", String(forceUpdate));
        if (uploadResult.apkPath) {
          formData.append("apk_path", uploadResult.apkPath);
        }
        if (uploadResult.apkSizeBytes) {
          formData.append("apk_size_bytes", String(uploadResult.apkSizeBytes));
        }

        const result = await createAppRelease(formData);
        if (result.success) {
          setIsModalOpen(false);
          await refreshReleases();
          router.refresh();
        } else {
          alert(`Error: ${result.error}`);
        }
      }
    } catch (err: any) {
      alert(`System Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
      setUploadStatus("");
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    setIsSubmitting(true);
    
    try {
      const result = await deleteAppRelease(isDeleting.id, isDeleting.apk_path);
      if (result.success) {
        setIsDeleting(null);
        await refreshReleases();
        router.refresh();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err: any) {
      alert(`System Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
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

  const typeColors: Record<string, string> = {
    new: "text-emerald-400 bg-emerald-950/20 border-emerald-800/25",
    fix: "text-amber-400 bg-amber-950/20 border-amber-800/25",
    improve: "text-blue-400 bg-blue-950/20 border-blue-800/25",
  };

  const typeLabel: Record<string, string> = {
    new: "Baru",
    fix: "Perbaikan",
    improve: "Peningkatan"
  };

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
            Distribution Management
          </p>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: "var(--silver-100)" }}>
            <Smartphone className="w-5 h-5" style={{ color: "var(--silver-400)" }} />
            App Release Control
          </h1>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer font-mono"
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
          New Release
        </button>
      </div>

      {/* ── Content ── */}
      <div className="p-8 flex-1 overflow-y-auto">
        {releases.length === 0 ? (
          <div className="max-w-md mx-auto mt-24 text-center select-none">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
            >
              <Smartphone className="w-10 h-10" style={{ color: "var(--silver-700)" }} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest font-mono mb-2" style={{ color: "var(--silver-300)" }}>
              No Releases Configured
            </h3>
            <p className="text-xs leading-relaxed mb-8 px-4" style={{ color: "var(--silver-600)" }}>
              No build uploads or releases are currently registered. Upload your first APK package to enable user downloads.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer font-mono"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-soft)", color: "var(--silver-300)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-silver)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)"; }}
            >
              Configure First Release
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {releases.map((release) => (
              <div
                key={release.id}
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
                {/* Accent line indicating if latest */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: release.is_latest
                      ? "linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)"
                      : "linear-gradient(90deg, transparent, var(--border-soft), transparent)",
                  }}
                />

                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-4 select-none">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest font-mono px-2 py-0.5 rounded bg-[var(--bg-active)] border border-[var(--border-soft)] text-[var(--silver-400)]">
                          {release.app_name}
                        </span>
                        {release.is_latest && (
                          <span className="text-[9px] font-black uppercase tracking-widest font-mono px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-800/30 text-emerald-400">
                            Latest Version
                          </span>
                        )}
                        {release.force_update && (
                          <span className="text-[9px] font-black uppercase tracking-widest font-mono px-2 py-0.5 rounded bg-red-950/20 border border-red-800/30 text-red-400">
                            Force Update
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black tracking-tight text-[var(--silver-100)] flex items-baseline gap-1">
                        v{release.version}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end text-right font-mono text-[10px] text-[var(--silver-500)] gap-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--silver-600)]" />
                        <span>{release.release_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-[var(--silver-600)]" />
                        <span>{release.size_label || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* APK Details */}
                  <div
                    className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-active)]/50 space-y-1.5 font-mono text-[11px] mb-5"
                    style={{ color: "var(--silver-400)" }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ color: "var(--silver-600)" }}>Storage Path:</span>
                      <span className="text-right truncate max-w-[280px]" title={release.apk_path || "No path"}>
                        {release.apk_path || "Not uploaded"}
                      </span>
                    </div>
                    {release.apk_size_bytes && (
                      <div className="flex justify-between items-center">
                        <span style={{ color: "var(--silver-600)" }}>Size In Bytes:</span>
                        <span>{release.apk_size_bytes.toLocaleString()} bytes</span>
                      </div>
                    )}
                  </div>

                  {/* Changelog Entries */}
                  <div className="space-y-2 mb-6">
                    <p className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-600)] flex items-center gap-1.5">
                      <ListPlus className="w-3 h-3" />
                      Changelog / Release Notes
                    </p>
                    {(!release.changelog || release.changelog.length === 0) ? (
                      <p className="text-xs italic text-[var(--silver-600)] pl-1">No notes added.</p>
                    ) : (
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                        {release.changelog.map((note, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2.5 p-2 rounded-lg bg-[var(--bg-active)]/20 border border-[var(--border-subtle)] text-[11px] leading-relaxed text-[var(--silver-450)]"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border shrink-0 ${
                                typeColors[note.type] || typeColors.new
                              }`}
                            >
                              {typeLabel[note.type] || "Baru"}
                            </span>
                            <span className="font-light">{note.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div
                    className="pt-4 flex items-center justify-between select-none"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
                  >
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--silver-500)]">
                      <Info className="w-3 h-3 text-[var(--silver-600)]" />
                      <span>ID: {release.id.slice(0, 8)}...</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(release)}
                        className="p-2 rounded-lg transition-all cursor-pointer text-xs"
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-silver)";
                          (e.currentTarget as HTMLElement).style.color = "var(--silver-200)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                          (e.currentTarget as HTMLElement).style.color = "var(--silver-500)";
                        }}
                        title="Edit Release Metadata"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsDeleting(release)}
                        className="p-2 rounded-lg transition-all cursor-pointer text-xs"
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)";
                          (e.currentTarget as HTMLElement).style.color = "#ef4444";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                          (e.currentTarget as HTMLElement).style.color = "var(--silver-500)";
                        }}
                        title="Delete Release"
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

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}>
          <div
            className="w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 relative rounded-2xl"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-silver)", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--silver-400), transparent)" }} />

            <form onSubmit={handleSubmit}>
              <div className="px-7 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-100)" }}>
                    {editingRelease ? "Modify App Release" : "Publish New Release"}
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest font-mono mt-1" style={{ color: "var(--silver-600)" }}>
                    {editingRelease ? `Editing v${editingRelease.version}` : "Upload package & define changelog"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl cursor-pointer transition-all"
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-7 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>App Name</label>
                    <input
                      required
                      type="text"
                      disabled={!!editingRelease}
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="premium-input disabled:opacity-50"
                      style={inputStyle}
                      placeholder="e.g. McdWallet"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>Version String</label>
                    <input
                      required
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="premium-input"
                      style={inputStyle}
                      placeholder="e.g. 2.5.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>Release Date</label>
                    <input
                      required
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="premium-input font-mono"
                      style={{ ...inputStyle, colorScheme: "dark" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>Size Label</label>
                    <input
                      required
                      readOnly
                      type="text"
                      value={sizeLabel}
                      className="premium-input opacity-70 cursor-not-allowed"
                      style={inputStyle}
                      placeholder="Akan terisi otomatis saat upload APK..."
                    />
                  </div>
                </div>

                {/* APK File Input (Create only) */}
                {!editingRelease && (
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>APK Binary File</label>
                    <div
                      className="relative border border-dashed border-[var(--border-soft)] hover:border-[var(--border-silver)] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[var(--bg-active)]/20"
                      onClick={() => document.getElementById("apk-upload-input")?.click()}
                    >
                      <input
                        id="apk-upload-input"
                        required
                        type="file"
                        accept=".apk"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setApkFile(file);
                            const sizeInMb = file.size / (1024 * 1024);
                            const formatted = `~${sizeInMb.toFixed(1)} MB`;
                            setSizeLabel(formatted);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-1">
                        <FileDown className="w-7 h-7 text-[var(--silver-500)] mb-1" />
                        <p className="text-xs font-bold text-[var(--silver-300)]">
                          {apkFile ? apkFile.name : "Select or Drop APK File"}
                        </p>
                        <p className="text-[10px] text-[var(--silver-600)] font-mono">
                          {apkFile ? `${(apkFile.size / (1024 * 1024)).toFixed(2)} MB` : "Accepts Android APK binaries only"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>
                      Changelog / Release Notes (Line by line)
                    </label>
                    <span className="text-[9px] font-bold text-[var(--silver-600)] font-mono">Prefix options: new:, fix:, improve:</span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={changelogRaw}
                    onChange={(e) => setChangelogRaw(e.target.value)}
                    className="premium-input resize-none font-mono text-[11px]"
                    style={inputStyle}
                    placeholder={`new: Realtime widget support\nfix: Corrected splash background\nimprove: Optimized update rates`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-active)]/20">
                    <input
                      id="force-update-chk"
                      type="checkbox"
                      checked={forceUpdate}
                      onChange={(e) => setForceUpdate(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer accent-[#ffffff]"
                    />
                    <label htmlFor="force-update-chk" className="text-xs text-[var(--silver-300)] cursor-pointer select-none">
                      Wajibkan Update (Force Update)
                    </label>
                  </div>

                  {editingRelease && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-active)]/20">
                      <input
                        id="is-latest-chk"
                        type="checkbox"
                        checked={isLatest}
                        onChange={(e) => setIsLatest(e.target.checked)}
                        className="w-4 h-4 rounded cursor-pointer accent-[#ffffff]"
                      />
                      <label htmlFor="is-latest-chk" className="text-xs text-[var(--silver-300)] cursor-pointer select-none">
                        Jadikan Versi Terkini (Latest)
                      </label>
                    </div>
                  )}
                </div>

                {isSubmitting && (uploadProgress !== null || uploadStatus) && (
                  <div className="space-y-2 mt-4 p-4 rounded-xl border" style={{ borderColor: "var(--border-soft)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: "var(--silver-400)" }}>
                      <span className="flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "var(--silver-400)" }} />
                        {uploadStatus}
                      </span>
                      {uploadProgress !== null && (
                        <span className="font-bold" style={{ color: "var(--silver-200)" }}>{uploadProgress}%</span>
                      )}
                    </div>
                    {uploadProgress !== null && (
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid var(--border-subtle)", marginTop: "8px" }}>
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${uploadProgress}%`,
                            background: "linear-gradient(90deg, #10b981, #06b6d4)",
                            boxShadow: "0 0 12px rgba(16,185,129,0.4)",
                            height: "100%"
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 cursor-pointer font-mono transition-all mt-6"
                  style={{ background: "var(--silver-200)", color: "#0f0f13", border: "1px solid var(--silver-300)" }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      (e.currentTarget as HTMLElement).style.background = "var(--silver-100)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px var(--silver-glow)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--silver-200)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingRelease ? "Update Release Metadata" : "Upload & Establish Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {isDeleting && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
          <div
            className="w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative rounded-2xl"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(239,68,68,0.25)", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-red-600 opacity-60" />
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest font-mono mb-2" style={{ color: "var(--silver-100)" }}>
                Confirm Destruction
              </h3>
              <p className="text-xs leading-relaxed mb-8 px-4" style={{ color: "var(--silver-500)" }}>
                Delete release <span className="text-red-400 font-bold">"{isDeleting.app_name} v{isDeleting.version}"</span>? This will also remove the APK binary from Supabase Storage and is irreversible.
              </p>
              <div className="flex flex-col w-full gap-3 font-mono">
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-red-700 transition-all cursor-pointer"
                >
                  {isSubmitting ? "Processing..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => setIsDeleting(null)}
                  className="w-full py-4 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all cursor-pointer"
                  style={{ background: "var(--bg-hover)", color: "var(--silver-500)", border: "1px solid var(--border-subtle)" }}
                >
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
