import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Folder,
  File as FileIcon,
  Search,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Loader2,
  X,
  FileImage,
  FileVideo,
  FileText,
  Lock,
  ChevronRight,
  Copy,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

interface CryptFile {
  id: string | number;
  original_name: string;
  is_folder: boolean;
  mime_type: string | null;
  size: number;
  created_at: string;
  parent_id?: string | number | null;
}

export function McdCryptPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const folderParam = searchParams.get("folder");

  const [files, setFiles] = useState<CryptFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string; original_name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isRenaming, setIsRenaming] = useState<CryptFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<CryptFile | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFile, setPreviewFile] = useState<CryptFile | null>(null);
  const [clipboard, setClipboard] = useState<{
    id: string | number;
    name: string;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file?: CryptFile;
    isBackground?: boolean;
  } | null>(null);
  const [draggedId, setDraggedId] = useState<string | number | null>(null);
  const [dragOverId, setDragOverId] = useState<string | number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFilesAndBreadcrumbs();
  }, [folderParam]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  async function fetchFilesAndBreadcrumbs() {
    setLoading(true);
    try {
      const parentQuery = folderParam ? `?parent_id=${folderParam}` : "";
      const resFiles = await fetch(`/api/mcdcrypt/files${parentQuery}`);
      const dataFiles = (await resFiles.json()) as any;
      if (dataFiles.success && Array.isArray(dataFiles.files)) {
        setFiles(dataFiles.files);
      }

      if (folderParam) {
        const resBc = await fetch(
          `/api/mcdcrypt/breadcrumbs?folder_id=${folderParam}`
        );
        const dataBc = (await resBc.json()) as any;
        if (dataBc.breadcrumbs) {
          setBreadcrumbs(dataBc.breadcrumbs);
        }
      } else {
        setBreadcrumbs([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const navigateToFolder = (id: string | number | null) => {
    if (id) {
      setSearchParams({ folder: String(id) });
    } else {
      setSearchParams({});
    }
  };

  const filteredFiles = files.filter((f) =>
    f.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (folderParam) formData.append("parent_id", folderParam);

    try {
      const res = await fetch("/api/mcdcrypt/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as any;
      if (!data.success) {
        alert(data.error || "Gagal mengupload file");
      } else {
        fetchFilesAndBreadcrumbs();
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      const res = await fetch("/api/mcdcrypt/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parent_id: folderParam ? Number(folderParam) : null,
        }),
      });
      const data = (await res.json()) as any;
      if (data.success) {
        setIsCreatingFolder(false);
        setNewFolderName("");
        fetchFilesAndBreadcrumbs();
      } else {
        alert(data.error || "Gagal membuat folder");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsCreatingFolder(false);
    }
  }

  async function handleRename() {
    if (!isRenaming || !renameValue.trim()) return;
    try {
      const res = await fetch(`/api/mcdcrypt/rename/${isRenaming.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      const data = (await res.json()) as any;
      if (data.success) {
        setIsRenaming(null);
        fetchFilesAndBreadcrumbs();
      } else {
        alert(data.error || "Gagal mengubah nama");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  async function handleConfirmDelete() {
    if (!isDeleting) return;
    try {
      const res = await fetch(`/api/mcdcrypt/items/${isDeleting.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as any;
      if (data.success) {
        setIsDeleting(null);
        fetchFilesAndBreadcrumbs();
      } else {
        alert(data.error || "Gagal menghapus item");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  async function handlePaste() {
    if (!clipboard) return;
    setIsUploading(true);
    try {
      const res = await fetch(`/api/mcdcrypt/duplicate/${clipboard.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_id: folderParam ? Number(folderParam) : null,
        }),
      });
      const data = (await res.json()) as any;
      if (data.success) {
        setClipboard(null);
        fetchFilesAndBreadcrumbs();
      } else {
        alert(data.error || "Gagal menyalin item");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  }

  const onItemContextMenu = (e: React.MouseEvent, file: CryptFile) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const onBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, isBackground: true });
  };

  const onDragStart = (e: React.DragEvent, id: string | number) => {
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", String(id));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (
    e: React.DragEvent,
    targetId?: string | number | null,
    isFolderTarget: boolean = true
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFolderTarget && targetId !== draggedId) {
      setDragOverId(targetId || "ROOT");
    } else {
      setDragOverId(null);
    }
  };

  const onDrop = async (
    e: React.DragEvent,
    targetFolderId: string | number | null
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    setDragOverId(null);
    setDraggedId(null);
    if (id && id !== targetFolderId) {
      setIsUploading(true);
      try {
        const res = await fetch(`/api/mcdcrypt/move/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            parent_id: targetFolderId ? Number(targetFolderId) : null,
          }),
        });
        const data = (await res.json()) as any;
        if (data.success) {
          fetchFilesAndBreadcrumbs();
        } else {
          alert("Gagal memindahkan: " + data.error);
        }
      } catch (err: any) {
        alert("Error: " + err.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  function getFileIcon(file: CryptFile) {
    if (file.is_folder)
      return (
        <Folder
          className="w-10 h-10"
          style={{
            color: "var(--silver-500)",
            fill: "var(--silver-600)",
            opacity: 0.7,
          }}
        />
      );
    if (file.mime_type?.startsWith("image/"))
      return (
        <FileImage
          className="w-10 h-10"
          style={{ color: "var(--silver-400)" }}
        />
      );
    if (file.mime_type?.startsWith("video/"))
      return (
        <FileVideo
          className="w-10 h-10"
          style={{ color: "var(--silver-400)" }}
        />
      );
    return (
      <FileText className="w-10 h-10" style={{ color: "var(--silver-500)" }} />
    );
  }

  function formatSize(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
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
      className="h-[calc(100vh-5rem)] -m-8 flex flex-col relative overflow-hidden bg-black animate-in fade-in duration-500"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, folderParam || null)}
    >
      {/* ── Toolbar ── */}
      <div
        className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0"
        style={{
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Breadcrumb */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigateToFolder(null)}
              onDragOver={(e) => onDragOver(e, "ROOT")}
              onDrop={(e) => onDrop(e, null)}
              className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all px-2 py-1 rounded-lg cursor-pointer font-mono ${
                dragOverId === "ROOT" ? "text-black" : "hover:text-white"
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
                <ChevronRight
                  className="w-3 h-3"
                  style={{ color: "var(--silver-700)" }}
                />
                <button
                  onClick={() => navigateToFolder(crumb.id)}
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
            <p
              className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono"
              style={{ color: "var(--silver-600)" }}
            >
              Secure Access Environment
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--silver-600)" }}
            />
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
              style={{
                background: "var(--bg-hover)",
                border: "1px solid var(--border-subtle)",
                color: "var(--silver-400)",
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Folder</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer font-mono font-black uppercase tracking-widest disabled:opacity-50"
              style={{
                background: "var(--silver-200)",
                color: "#0f0f13",
                border: "1px solid var(--silver-300)",
              }}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Upload</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* ── File Grid ── */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar p-8"
        style={{ background: "var(--bg-root)" }}
        onContextMenu={onBackgroundContextMenu}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "var(--silver-500)" }}
            />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Lock
                className="w-10 h-10"
                style={{ color: "var(--silver-600)" }}
              />
            </div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.3em] font-mono"
              style={{ color: "var(--silver-600)" }}
            >
              No encrypted items here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => onDragStart(e, file.id)}
                onDragOver={(e) => onDragOver(e, file.id, file.is_folder)}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => file.is_folder && onDrop(e, file.id)}
                onContextMenu={(e) => onItemContextMenu(e, file)}
                onDoubleClick={() => {
                  if (file.is_folder) navigateToFolder(file.id);
                  else setPreviewFile(file);
                }}
                className={`group relative flex flex-col items-center rounded-2xl p-5 transition-all duration-200 cursor-pointer select-none ${
                  draggedId === file.id ? "opacity-25" : "opacity-100"
                }`}
                style={
                  dragOverId === file.id
                    ? {
                        background: "var(--bg-active)",
                        border: "1px solid var(--border-silver)",
                        transform: "scale(1.05)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      }
                    : clipboard?.id === file.id
                    ? {
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-silver)",
                        opacity: 0.5,
                      }
                    : {
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                      }
                }
              >
                <div className="mb-3 transition-transform group-hover:scale-110 duration-300">
                  {getFileIcon(file)}
                </div>
                <div className="w-full text-center">
                  <p
                    className="text-xs font-bold truncate group-hover:text-white transition-colors"
                    title={file.original_name}
                    style={{ color: "var(--silver-400)" }}
                  >
                    {file.original_name}
                  </p>
                  {!file.is_folder && (
                    <p
                      className="text-[9px] mt-1 uppercase font-black tracking-widest font-mono"
                      style={{ color: "var(--silver-700)" }}
                    >
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
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-silver)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.isBackground ? (
            <div className="space-y-1">
              <div
                className="px-3 py-2 mb-1"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <p
                  className="text-[9px] font-black uppercase tracking-widest font-mono"
                  style={{ color: "var(--silver-600)" }}
                >
                  Workspace
                </p>
              </div>
              <CtxBtn
                icon={<Upload className="w-3.5 h-3.5" />}
                label="Upload File"
                onClick={() => {
                  fileInputRef.current?.click();
                  setContextMenu(null);
                }}
              />
              <CtxBtn
                icon={<Plus className="w-3.5 h-3.5" />}
                label="Create Folder"
                onClick={() => {
                  setIsCreatingFolder(true);
                  setContextMenu(null);
                }}
              />
              {clipboard && (
                <>
                  <div
                    className="h-px my-1 mx-2"
                    style={{ background: "var(--border-subtle)" }}
                  />
                  <CtxBtn
                    icon={<ClipboardList className="w-3.5 h-3.5" />}
                    label={`Paste "${clipboard.name}"`}
                    onClick={() => {
                      handlePaste();
                      setContextMenu(null);
                    }}
                  />
                </>
              )}
            </div>
          ) : (
            contextMenu.file && (
              <div className="space-y-1">
                <div
                  className="px-3 py-2 mb-1"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <p
                    className="text-[9px] font-black uppercase tracking-widest font-mono truncate"
                    style={{ color: "var(--silver-600)" }}
                  >
                    {contextMenu.file.original_name}
                  </p>
                </div>
                <CtxBtn
                  icon={<Eye className="w-3.5 h-3.5" />}
                  label="Open / View"
                  onClick={() => {
                    if (contextMenu.file!.is_folder)
                      navigateToFolder(contextMenu.file!.id);
                    else setPreviewFile(contextMenu.file!);
                    setContextMenu(null);
                  }}
                />
                <CtxBtn
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                  label="Rename"
                  onClick={() => {
                    setRenameValue(contextMenu.file!.original_name);
                    setIsRenaming(contextMenu.file!);
                    setContextMenu(null);
                  }}
                />
                <CtxBtn
                  icon={<Copy className="w-3.5 h-3.5" />}
                  label="Copy"
                  onClick={() => {
                    setClipboard({
                      id: contextMenu.file!.id,
                      name: contextMenu.file!.original_name,
                    });
                    setContextMenu(null);
                  }}
                />
                <div
                  className="h-px my-1 mx-2"
                  style={{ background: "var(--border-subtle)" }}
                />
                <CtxBtn
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  label="Delete"
                  onClick={() => {
                    setIsDeleting(contextMenu.file!);
                    setContextMenu(null);
                  }}
                  danger
                />
              </div>
            )
          )}
        </div>
      )}

      {/* ── Delete Modal ── */}
      {isDeleting && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="w-full max-w-sm overflow-hidden animate-in zoom-in-95"
            style={modalStyle}
          >
            <div className="h-px bg-red-600 opacity-60" />
            <div className="p-8 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3
                className="text-sm font-black uppercase tracking-widest font-mono mb-2"
                style={{ color: "var(--silver-100)" }}
              >
                Secure Destruction
              </h3>
              <p
                className="text-xs leading-relaxed mb-8 px-4"
                style={{ color: "var(--silver-500)" }}
              >
                Delete{" "}
                <span className="text-red-400 font-bold">
                  "{isDeleting.original_name}"
                </span>
                ? This is permanent.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-700 transition-all cursor-pointer"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setIsDeleting(null)}
                  className="w-full py-4 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-pointer"
                  style={{
                    background: "var(--bg-hover)",
                    color: "var(--silver-500)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename Modal ── */}
      {isRenaming && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="w-full max-w-sm overflow-hidden animate-in zoom-in-95"
            style={modalStyle}
          >
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <h3
                className="text-[10px] font-black uppercase tracking-widest font-mono"
                style={{ color: "var(--silver-500)" }}
              >
                Rename Item
              </h3>
              <button
                onClick={() => setIsRenaming(null)}
                className="cursor-pointer p-1 rounded transition-all"
                style={{ color: "var(--silver-500)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                autoFocus
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                style={inputStyle}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsRenaming(null)}
                  className="flex-1 py-3 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest"
                  style={{
                    background: "var(--bg-hover)",
                    color: "var(--silver-500)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  className="flex-1 py-3 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest"
                  style={{ background: "var(--silver-200)", color: "#0f0f13" }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Folder Modal ── */}
      {isCreatingFolder && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="w-full max-w-sm overflow-hidden animate-in zoom-in-95"
            style={modalStyle}
          >
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <h3
                className="text-[10px] font-black uppercase tracking-widest font-mono"
                style={{ color: "var(--silver-500)" }}
              >
                Create Folder
              </h3>
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="cursor-pointer p-1"
                style={{ color: "var(--silver-500)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                autoFocus
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                style={inputStyle}
              />
              <button
                onClick={handleCreateFolder}
                className="w-full py-3 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest"
                style={{ background: "var(--silver-200)", color: "#0f0f13" }}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[100] flex flex-col animate-in fade-in"
          style={{
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{
              borderBottom: "1px solid var(--border-subtle)",
              background: "rgba(15,15,19,0.8)",
            }}
          >
            <div>
              <h3
                className="text-sm font-black uppercase tracking-widest"
                style={{ color: "var(--silver-100)" }}
              >
                {previewFile.original_name}
              </h3>
              <p
                className="text-[10px] font-mono uppercase"
                style={{ color: "var(--silver-600)" }}
              >
                Secure Preview • {previewFile.mime_type}
              </p>
            </div>
            <button
              onClick={() => setPreviewFile(null)}
              className="p-3 rounded-xl transition-all cursor-pointer"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--silver-400)",
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            <div
              className="flex flex-col items-center gap-4"
              style={{ color: "var(--silver-600)" }}
            >
              <FileIcon
                className="w-20 h-20"
                style={{ color: "var(--silver-700)" }}
              />
              <p
                className="text-xs uppercase tracking-widest font-black font-mono"
                style={{ color: "var(--silver-600)" }}
              >
                Encrypted File • Preview Protected
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CtxBtn({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer"
      style={{
        color: danger ? "#ef4444" : "var(--silver-400)",
        border: "1px solid transparent",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default McdCryptPage;
