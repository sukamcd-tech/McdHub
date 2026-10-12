import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Loader2,
  AlertTriangle,
  FileDown,
  Info,
  ListPlus,
  Calendar,
  HardDrive,
} from "lucide-react";

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

export const AppsPage: React.FC = () => {
  const [releases, setReleases] = useState<ReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<ReleaseItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<ReleaseItem | null>(null);

  const [appName, setAppName] = useState("McdWallet");
  const [version, setVersion] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const [changelogRaw, setChangelogRaw] = useState("");
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [isLatest, setIsLatest] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const refreshReleases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apps/releases?app=McdWallet");
      const data = (await res.json()) as any;
      if (data?.success && Array.isArray(data.releases)) {
        setReleases(data.releases);
      }
    } catch (err) {
      console.error("Failed to load releases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshReleases();
  }, []);

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
      setApkFile(null);

      const notes =
        release.changelog
          ?.map((item) => `${item.type}: ${item.text}`)
          .join("\n") || "";
      setChangelogRaw(notes);
    } else {
      setEditingRelease(null);
      setAppName("McdWallet");
      setVersion("");
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
      const parsedChangelog = changelogRaw
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          const [typeRaw, ...rest] = line.split(":");
          const type = ["new", "fix", "improve"].includes(
            typeRaw.toLowerCase()
          )
            ? typeRaw.toLowerCase()
            : "new";
          const text = rest.join(":").trim() || line;
          return { type, text };
        });

      if (editingRelease) {
        const res = await fetch(`/api/apps/releases/${editingRelease.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            version,
            release_date: releaseDate,
            size_label: sizeLabel,
            changelog: parsedChangelog,
            is_latest: isLatest,
            force_update: forceUpdate,
          }),
        });
        const data = (await res.json()) as any;
        if (res.ok && data.success) {
          setIsModalOpen(false);
          await refreshReleases();
        } else {
          alert(`Error: ${data.error || "Gagal memperbarui rilis"}`);
        }
      } else {
        const payload = {
          app_name: appName,
          version,
          release_date: releaseDate,
          size_label: sizeLabel || "15 MB",
          apk_path: apkFile ? `releases/${appName}-${version}.apk` : `releases/${appName}-${version}.apk`,
          apk_size_bytes: apkFile ? apkFile.size : 15728640,
          changelog: parsedChangelog,
          is_latest: isLatest,
          force_update: forceUpdate,
        };

        const res = await fetch("/api/apps/releases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as any;
        if (res.ok && data.success) {
          setIsModalOpen(false);
          await refreshReleases();
        } else {
          alert(`Error: ${data.error || "Gagal membuat rilis"}`);
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
      const res = await fetch(`/api/apps/releases/${isDeleting.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setIsDeleting(null);
        await refreshReleases();
      } else {
        alert(`Error: ${data.error || "Gagal menghapus rilis"}`);
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
    new: "text-zinc-100 bg-white/[0.12] border-white/[0.22]",
    fix: "text-zinc-300 bg-white/[0.08] border-white/[0.14]",
    improve: "text-zinc-400 bg-white/[0.04] border-white/[0.08]",
  };

  const typeLabel: Record<string, string> = {
    new: "Baru",
    fix: "Perbaikan",
    improve: "Peningkatan",
  };

  return (
    <div
      className="flex-1 flex flex-col min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700 select-none"
      style={{ background: "var(--bg-root)" }}
    >
      {/* ── Page Header ── */}
      <div
        className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div>
          <p
            className="text-[9px] uppercase tracking-[0.25em] font-black font-mono mb-1"
            style={{ color: "var(--silver-600)" }}
          >
            Distribution Management
          </p>
          <h1
            className="text-2xl font-black tracking-tight flex items-center gap-3"
            style={{ color: "var(--silver-100)" }}
          >
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
            (e.currentTarget as HTMLElement).style.background =
              "var(--silver-100)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 20px var(--silver-glow), 0 4px 16px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "var(--silver-200)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 4px 16px rgba(0,0,0,0.3)";
          }}
        >
          <Plus className="w-4 h-4" />
          New Release
        </button>
      </div>

      {/* ── Content ── */}
      <div className="p-8 flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[var(--silver-400)] animate-spin" />
          </div>
        ) : releases.length === 0 ? (
          <div className="max-w-md mx-auto mt-24 text-center select-none">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Smartphone
                className="w-10 h-10"
                style={{ color: "var(--silver-700)" }}
              />
            </div>
            <h3
              className="text-sm font-black uppercase tracking-widest font-mono mb-2"
              style={{ color: "var(--silver-300)" }}
            >
              No Releases Configured
            </h3>
            <p
              className="text-xs leading-relaxed mb-8 px-4"
              style={{ color: "var(--silver-600)" }}
            >
              No build uploads or releases are currently registered. Upload your first APK package to enable user downloads.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer font-mono"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-soft)",
                color: "var(--silver-300)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border-silver)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border-soft)";
              }}
            >
              Configure First Release
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {releases.map((release) => (
              <div
                key={release.id}
                className="group relative overflow-hidden rounded-xl transition-all duration-300 cursor-default bg-[#141418] border border-white/[0.06] hover:border-white/[0.12]"
              >
                <div className="p-4 sm:p-4.5">
                  <div className="flex items-start justify-between gap-4 mb-3 select-none">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[8.5px] font-black uppercase tracking-widest font-mono px-2 py-0.5 rounded bg-[#1c1c22] border border-white/[0.06] text-zinc-400">
                          {release.app_name}
                        </span>
                        {release.is_latest && (
                          <span className="text-[8.5px] font-black uppercase tracking-widest font-mono px-2 py-0.5 rounded bg-[#1c1c22] border border-white/[0.08] text-zinc-300">
                            Latest Version
                          </span>
                        )}
                        {release.force_update && (
                          <span className="text-[8.5px] font-black uppercase tracking-widest font-mono px-2 py-0.5 rounded bg-[#1c1c22] border border-white/[0.08] text-zinc-400">
                            Force Update
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black tracking-tight text-zinc-100 flex items-baseline gap-1">
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

                  <div
                    className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-active)]/50 space-y-1.5 font-mono text-[11px] mb-5"
                    style={{ color: "var(--silver-400)" }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ color: "var(--silver-600)" }}>
                        Storage Path:
                      </span>
                      <span
                        className="text-right truncate max-w-[280px]"
                        title={release.apk_path || "No path"}
                      >
                        {release.apk_path || "Not uploaded"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-[9px] font-black uppercase tracking-widest font-mono text-[var(--silver-600)] flex items-center gap-1.5">
                      <ListPlus className="w-3 h-3" />
                      Changelog / Release Notes
                    </p>
                    {!release.changelog || release.changelog.length === 0 ? (
                      <p className="text-xs italic text-[var(--silver-600)] pl-1">
                        No notes added.
                      </p>
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
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--silver-500)",
                        }}
                        title="Edit Release Metadata"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsDeleting(release)}
                        className="p-2 rounded-lg transition-all cursor-pointer text-xs"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--silver-500)",
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
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-6"
          style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 relative rounded-2xl"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-silver)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--silver-400), transparent)",
              }}
            />

            <form onSubmit={handleSubmit}>
              <div
                className="px-7 py-5 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <div>
                  <h3
                    className="text-sm font-black uppercase tracking-widest font-mono"
                    style={{ color: "var(--silver-100)" }}
                  >
                    {editingRelease ? "Modify App Release" : "Publish New Release"}
                  </h3>
                  <p
                    className="text-[9px] font-black uppercase tracking-widest font-mono mt-1"
                    style={{ color: "var(--silver-600)" }}
                  >
                    {editingRelease
                      ? `Editing v${editingRelease.version}`
                      : "Upload package & define changelog"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: "var(--bg-hover)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--silver-500)",
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-7 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      className="text-[8px] font-black uppercase tracking-widest font-mono"
                      style={{ color: "var(--silver-500)" }}
                    >
                      App Name
                    </label>
                    <input
                      required
                      type="text"
                      disabled={!!editingRelease}
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="disabled:opacity-50"
                      style={inputStyle}
                      placeholder="e.g. McdWallet"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-[8px] font-black uppercase tracking-widest font-mono"
                      style={{ color: "var(--silver-500)" }}
                    >
                      Version String
                    </label>
                    <input
                      required
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      style={inputStyle}
                      placeholder="e.g. 2.5.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      className="text-[8px] font-black uppercase tracking-widest font-mono"
                      style={{ color: "var(--silver-500)" }}
                    >
                      Release Date
                    </label>
                    <input
                      required
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="font-mono"
                      style={{ ...inputStyle, colorScheme: "dark" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-[8px] font-black uppercase tracking-widest font-mono"
                      style={{ color: "var(--silver-500)" }}
                    >
                      Size Label
                    </label>
                    <input
                      required
                      type="text"
                      value={sizeLabel}
                      onChange={(e) => setSizeLabel(e.target.value)}
                      style={inputStyle}
                      placeholder="e.g. ~15.2 MB"
                    />
                  </div>
                </div>

                {/* APK File Input (Create only) */}
                {!editingRelease && (
                  <div className="space-y-2">
                    <label
                      className="text-[8px] font-black uppercase tracking-widest font-mono"
                      style={{ color: "var(--silver-500)" }}
                    >
                      APK Binary File
                    </label>
                    <div
                      className="relative border border-dashed border-[var(--border-soft)] hover:border-[var(--border-silver)] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[var(--bg-active)]/20"
                      onClick={() => document.getElementById("apk-upload-input")?.click()}
                    >
                      <input
                        id="apk-upload-input"
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
                          {apkFile
                            ? `${(apkFile.size / (1024 * 1024)).toFixed(2)} MB`
                            : "Accepts Android APK binaries only"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      className="text-[8px] font-black uppercase tracking-widest font-mono"
                      style={{ color: "var(--silver-500)" }}
                    >
                      Changelog / Release Notes (Line by line)
                    </label>
                    <span className="text-[9px] font-bold text-[var(--silver-600)] font-mono">
                      Prefix options: new:, fix:, improve:
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={changelogRaw}
                    onChange={(e) => setChangelogRaw(e.target.value)}
                    className="resize-none font-mono text-[11px]"
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
                    <label
                      htmlFor="force-update-chk"
                      className="text-xs text-[var(--silver-300)] cursor-pointer select-none"
                    >
                      Wajibkan Update (Force Update)
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-active)]/20">
                    <input
                      id="is-latest-chk"
                      type="checkbox"
                      checked={isLatest}
                      onChange={(e) => setIsLatest(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer accent-[#ffffff]"
                    />
                    <label
                      htmlFor="is-latest-chk"
                      className="text-xs text-[var(--silver-300)] cursor-pointer select-none"
                    >
                      Jadikan Versi Terkini (Latest)
                    </label>
                  </div>
                </div>

                {uploadStatus && (
                  <p className="text-[10px] text-center font-mono text-[var(--silver-400)]">
                    {uploadStatus} {uploadProgress !== null ? `(${uploadProgress}%)` : ""}
                  </p>
                )}

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 cursor-pointer font-mono transition-all mt-6"
                  style={{
                    background: "var(--silver-200)",
                    color: "#0f0f13",
                    border: "1px solid var(--silver-300)",
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingRelease
                    ? "Update Release Metadata"
                    : "Establish Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {isDeleting && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center p-6"
          style={{
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative rounded-2xl"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid rgba(239,68,68,0.25)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-red-600 opacity-60" />
            <div className="p-8 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6"
                style={{ border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3
                className="text-sm font-black uppercase tracking-widest font-mono mb-2"
                style={{ color: "var(--silver-100)" }}
              >
                Confirm Destruction
              </h3>
              <p
                className="text-xs leading-relaxed mb-8 px-4"
                style={{ color: "var(--silver-500)" }}
              >
                Delete release{" "}
                <span className="text-red-400 font-bold">
                  "{isDeleting.app_name} v{isDeleting.version}"
                </span>
                ? This action is permanent and irreversible.
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
                  style={{
                    background: "var(--bg-hover)",
                    color: "var(--silver-500)",
                    border: "1px solid var(--border-subtle)",
                  }}
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
};

export default AppsPage;
