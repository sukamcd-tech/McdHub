"use client";

import { useState, useEffect, useRef } from "react";
import {
  Folder, File as FileIcon, Search, Upload, Plus,
  Trash2, Edit3, Download, Eye, Loader2, X,
  FileImage, FileVideo, FileText, Lock, ArrowLeft,
  ChevronRight, Copy, ClipboardList, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createFolder, uploadFile, deleteItem, renameItem, moveItem, duplicateItem } from "@/lib/actions/mcdcrypt-actions";

interface CryptFile {
  id: string;
  original_name: string;
  is_folder: boolean;
  mime_type: string | null;
  size: number;
  created_at: string;
  parent_id?: string | null;
}

interface McdCryptExplorerProps {
  initialFiles: CryptFile[];
  currentFolder: any | null;
  breadcrumbs: { id: string; original_name: string }[];
}

export default function McdCryptExplorer({ initialFiles, currentFolder, breadcrumbs }: McdCryptExplorerProps) {
  const [files, setFiles] = useState<CryptFile[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isRenaming, setIsRenaming] = useState<CryptFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<CryptFile | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFile, setPreviewFile] = useState<CryptFile | null>(null);
  const [clipboard, setClipboard] = useState<{ id: string; name: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file?: CryptFile; isBackground?: boolean } | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { setFiles(initialFiles); }, [initialFiles]);

  const filteredFiles = files.filter(f =>
    f.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (currentFolder) formData.append("parent_id", currentFolder.id);
    const result = await uploadFile(formData);
    if (!result.success) alert(result.error);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    const result = await createFolder(newFolderName, currentFolder?.id);
    if (result.success) { setIsCreatingFolder(false); setNewFolderName(""); router.refresh(); }
    else alert(result.error);
    setIsCreatingFolder(false);
  }

  async function handleRename() {
    if (!isRenaming || !renameValue.trim()) return;
    const result = await renameItem(isRenaming.id, renameValue);
    if (result.success) { setIsRenaming(null); router.refresh(); }
    else alert(result.error);
  }

  async function handleConfirmDelete() {
    if (!isDeleting) return;
    const result = await deleteItem(isDeleting.id);
    if (result.success) { setIsDeleting(null); router.refresh(); }
    else alert(result.error);
  }

  async function handlePaste() {
    if (!clipboard) return;
    setIsUploading(true);
    const result = await duplicateItem(clipboard.id, currentFolder?.id || null);
    setIsUploading(false);
    if (result.success) { setClipboard(null); router.refresh(); }
    else alert(result.error);
  }

  const onItemContextMenu = (e: React.MouseEvent, file: CryptFile) => {
    e.preventDefault(); e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const onBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, isBackground: true });
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const onDragOver = (e: React.DragEvent, targetId?: string | null, isFolderTarget: boolean = true) => {
    e.preventDefault(); e.stopPropagation();
    if (isFolderTarget && targetId !== draggedId) setDragOverId(targetId || "ROOT");
    else setDragOverId(null);
  };

  const onDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault(); e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    setDragOverId(null); setDraggedId(null);
    if (id && id !== targetFolderId) {
      setIsUploading(true);
      const result = await moveItem(id, targetFolderId);
      setIsUploading(false);
      if (result.success) router.refresh();
      else alert("Gagal memindahkan item: " + result.error);
    }
  };

  function getFileIcon(file: CryptFile) {
    if (file.is_folder) return <Folder className="w-10 h-10" style={{ color: "var(--silver-500)", fill: "var(--silver-600)", opacity: 0.7 }} />;
    if (file.mime_type?.startsWith("image/")) return <FileImage className="w-10 h-10" style={{ color: "var(--silver-400)" }} />;
    if (file.mime_type?.startsWith("video/")) return <FileVideo className="w-10 h-10" style={{ color: "var(--silver-400)" }} />;
    return <FileText className="w-10 h-10" style={{ color: "var(--silver-500)" }} />;
  }

  function formatSize(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const modalStyle: React.CSSProperties = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-silver)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
    borderRadius: "20px",
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(10,10,14,0.8)",
    border: "1px solid var(--border-soft)",
    color: "var(--silver-200)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      className="flex flex-col h-full relative animate-in fade-in duration-500"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, currentFolder?.id || null)}
    >
      {/* ── Toolbar ── */}
      <div
        className="px-6 py-4 flex flex-wrap items-center justify-between gap-4"
        style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        {/* Breadcrumb */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => router.push("/admin/mcdcrypt")}
              onDragOver={(e) => onDragOver(e, "ROOT")}
              onDrop={(e) => onDrop(e, null)}
              className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all px-2 py-1 rounded-lg cursor-pointer font-mono ${
                dragOverId === "ROOT"
                  ? "text-black"
                  : "hover:text-white"
              }`}
              style={
                dragOverId === "ROOT"
                  ? { background: "var(--silver-300)", color: "#0f0f13" }
                  : { color: "var(--silver-500)" }
              }
            >
              McdCrypt
            </button>
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.id} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3" style={{ color: "var(--silver-700)" }} />
                <button
                  onClick={() => router.push(`/admin/mcdcrypt?folder=${crumb.id}`)}
                  onDragOver={(e) => onDragOver(e, crumb.id)}
                  onDrop={(e) => onDrop(e, crumb.id)}
                  disabled={idx === breadcrumbs.length - 1}
                  className="text-[9px] font-black uppercase tracking-[0.2em] transition-all px-2 py-1 rounded-lg max-w-[120px] truncate cursor-pointer font-mono"
                  style={
                    dragOverId === crumb.id
                      ? { background: "var(--silver-300)", color: "#0f0f13" }
                      : idx === breadcrumbs.length - 1
                      ? { color: "var(--silver-300)", cursor: "default" }
                      : { color: "var(--silver-500)" }
                  }
                >
                  {crumb.original_name}
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3" style={{ color: "var(--silver-700)" }} />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono" style={{ color: "var(--silver-600)" }}>
              Secure Access Environment
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--silver-600)" }} />
            <input
              type="text"
              placeholder="Search encrypted files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: "40px" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer font-mono font-black uppercase tracking-widest"
              style={{ background: "var(--bg-hover)", border: "1px solid var(--border-subtle)", color: "var(--silver-400)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-silver)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-200)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-400)"; }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Folder</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer font-mono font-black uppercase tracking-widest disabled:opacity-50"
              style={{ background: "var(--silver-200)", color: "#0f0f13", border: "1px solid var(--silver-300)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--silver-100)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px var(--silver-glow)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--silver-200)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span className="hidden sm:inline">Upload</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          </div>
        </div>
      </div>

      {/* ── File Grid ── */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar p-8"
        style={{ background: "var(--bg-root)" }}
        onContextMenu={onBackgroundContextMenu}
      >
        {filteredFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <Lock className="w-10 h-10" style={{ color: "var(--silver-600)" }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] font-mono" style={{ color: "var(--silver-600)" }}>
              No encrypted items here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => onDragStart(e, file.id)}
                onDragOver={(e) => onDragOver(e, file.id, file.is_folder)}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => file.is_folder && onDrop(e, file.id)}
                onContextMenu={(e) => onItemContextMenu(e, file)}
                onDoubleClick={() => {
                  if (file.is_folder) router.push(`/admin/mcdcrypt?folder=${file.id}`);
                  else setPreviewFile(file);
                }}
                className={`group relative flex flex-col items-center rounded-2xl p-5 transition-all duration-200 cursor-pointer select-none ${
                  draggedId === file.id ? "opacity-25" : "opacity-100"
                }`}
                style={
                  dragOverId === file.id
                    ? { background: "var(--bg-active)", border: "1px solid var(--border-silver)", transform: "scale(1.05)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }
                    : clipboard?.id === file.id
                    ? { background: "var(--bg-elevated)", border: "1px solid var(--border-silver)", opacity: 0.5 }
                    : { background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }
                }
                onMouseEnter={(e) => {
                  if (dragOverId !== file.id && clipboard?.id !== file.id) {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (dragOverId !== file.id && clipboard?.id !== file.id) {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }
                }}
              >
                <div className="mb-3 transition-transform group-hover:scale-110 duration-300">
                  {getFileIcon(file)}
                </div>
                <div className="w-full text-center">
                  <p className="text-xs font-bold truncate group-hover:text-white transition-colors" title={file.original_name} style={{ color: "var(--silver-400)" }}>
                    {file.original_name}
                  </p>
                  {!file.is_folder && (
                    <p className="text-[9px] mt-1 uppercase font-black tracking-widest font-mono" style={{ color: "var(--silver-700)" }}>
                      {formatSize(file.size)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div
          className="fixed z-[200] w-60 p-2 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          style={{ top: contextMenu.y, left: contextMenu.x, background: "var(--bg-elevated)", border: "1px solid var(--border-silver)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.isBackground ? (
            <div className="space-y-1">
              <div className="px-3 py-2 mb-1" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <p className="text-[9px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-600)" }}>Workspace</p>
              </div>
              <CtxBtn icon={<Upload className="w-3.5 h-3.5" />} label="Upload File" onClick={() => { fileInputRef.current?.click(); setContextMenu(null); }} />
              <CtxBtn icon={<Plus className="w-3.5 h-3.5" />} label="Create Folder" onClick={() => { setIsCreatingFolder(true); setContextMenu(null); }} />
              {clipboard && (
                <>
                  <div className="h-px my-1 mx-2" style={{ background: "var(--border-subtle)" }} />
                  <CtxBtn icon={<ClipboardList className="w-3.5 h-3.5" />} label={`Paste "${clipboard.name}"`} onClick={() => { handlePaste(); setContextMenu(null); }} />
                </>
              )}
            </div>
          ) : contextMenu.file && (
            <div className="space-y-1">
              <div className="px-3 py-2 mb-1" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <p className="text-[9px] font-black uppercase tracking-widest font-mono truncate" style={{ color: "var(--silver-600)" }}>{contextMenu.file.original_name}</p>
              </div>
              <CtxBtn icon={<Eye className="w-3.5 h-3.5" />} label="Open / View" onClick={() => { if (contextMenu.file!.is_folder) router.push(`/admin/mcdcrypt?folder=${contextMenu.file!.id}`); else setPreviewFile(contextMenu.file!); setContextMenu(null); }} />
              <CtxBtn icon={<Edit3 className="w-3.5 h-3.5" />} label="Rename" onClick={() => { setRenameValue(contextMenu.file!.original_name); setIsRenaming(contextMenu.file!); setContextMenu(null); }} />
              <CtxBtn icon={<Copy className="w-3.5 h-3.5" />} label="Copy" onClick={() => { setClipboard({ id: contextMenu.file!.id, name: contextMenu.file!.original_name }); setContextMenu(null); }} />
              {!contextMenu.file.is_folder && (
                <a href={`/api/mcdcrypt/serve/${contextMenu.file.id}?download=1`} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer" style={{ color: "var(--silver-400)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-200)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--silver-400)"; }}
                >
                  <Download className="w-3.5 h-3.5" /> <span>Download</span>
                </a>
              )}
              <div className="h-px my-1 mx-2" style={{ background: "var(--border-subtle)" }} />
              <CtxBtn icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete" onClick={() => { setIsDeleting(contextMenu.file!); setContextMenu(null); }} danger />
            </div>
          )}
        </div>
      )}

      {/* ── Delete Modal ── */}
      {isDeleting && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-sm overflow-hidden animate-in zoom-in-95" style={modalStyle}>
            <div className="h-px bg-red-600 opacity-60" />
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest font-mono mb-2" style={{ color: "var(--silver-100)" }}>Secure Destruction</h3>
              <p className="text-xs leading-relaxed mb-8 px-4" style={{ color: "var(--silver-500)" }}>
                Delete <span className="text-red-400 font-bold">"{isDeleting.original_name}"</span>? This is permanent.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button onClick={handleConfirmDelete} className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-700 transition-all cursor-pointer">Confirm Delete</button>
                <button onClick={() => setIsDeleting(null)} className="w-full py-4 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-pointer" style={{ background: "var(--bg-hover)", color: "var(--silver-500)", border: "1px solid var(--border-subtle)" }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename Modal ── */}
      {isRenaming && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-sm overflow-hidden animate-in zoom-in-95" style={modalStyle}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 className="text-[10px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>Rename Item</h3>
              <button onClick={() => setIsRenaming(null)} className="cursor-pointer p-1 rounded transition-all" style={{ color: "var(--silver-500)" }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input autoFocus type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRename()} style={inputStyle} />
              <div className="flex gap-2">
                <button onClick={() => setIsRenaming(null)} className="flex-1 py-3 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest" style={{ background: "var(--bg-hover)", color: "var(--silver-500)", border: "1px solid var(--border-subtle)" }}>Cancel</button>
                <button onClick={handleRename} className="flex-1 py-3 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest" style={{ background: "var(--silver-200)", color: "#0f0f13" }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Folder Modal ── */}
      {isCreatingFolder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-sm overflow-hidden animate-in zoom-in-95" style={modalStyle}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 className="text-[10px] font-black uppercase tracking-widest font-mono" style={{ color: "var(--silver-500)" }}>Create Folder</h3>
              <button onClick={() => setIsCreatingFolder(false)} className="cursor-pointer p-1" style={{ color: "var(--silver-500)" }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input autoFocus type="text" placeholder="Folder name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()} style={inputStyle} />
              <button onClick={handleCreateFolder} className="w-full py-3 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest" style={{ background: "var(--silver-200)", color: "#0f0f13" }}>Create Folder</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in" style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(15,15,19,0.8)" }}>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: "var(--silver-100)" }}>{previewFile.original_name}</h3>
              <p className="text-[10px] font-mono uppercase" style={{ color: "var(--silver-600)" }}>Secure Preview • {previewFile.mime_type}</p>
            </div>
            <button onClick={() => setPreviewFile(null)} className="p-3 rounded-xl transition-all cursor-pointer" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--silver-400)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-400)"; }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            {previewFile.mime_type?.startsWith("image/") ? (
              <img src={`/api/mcdcrypt/serve/${previewFile.id}`} alt={previewFile.original_name} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" style={{ border: "1px solid var(--border-soft)" }} />
            ) : previewFile.mime_type?.startsWith("video/") ? (
              <video src={`/api/mcdcrypt/serve/${previewFile.id}`} controls className="max-w-full max-h-full rounded-2xl" style={{ border: "1px solid var(--border-soft)" }} />
            ) : (
              <div className="flex flex-col items-center gap-4" style={{ color: "var(--silver-600)" }}>
                <FileIcon className="w-20 h-20" style={{ color: "var(--silver-700)" }} />
                <p className="text-xs uppercase tracking-widest font-black font-mono" style={{ color: "var(--silver-600)" }}>No Preview Available</p>
                <a href={`/api/mcdcrypt/serve/${previewFile.id}?download=1`} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all" style={{ background: "var(--silver-200)", color: "#0f0f13" }}>Download to View</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CtxBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer"
      style={{ color: danger ? "#ef4444" : "var(--silver-400)", border: "1px solid transparent" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = danger ? "rgba(239,68,68,0.08)" : "var(--bg-hover)";
        (e.currentTarget as HTMLElement).style.color = danger ? "#ef4444" : "var(--silver-200)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.color = danger ? "#ef4444" : "var(--silver-400)";
      }}
    >
      {icon}<span>{label}</span>
    </button>
  );
}
