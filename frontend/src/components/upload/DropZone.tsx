import React, { useRef, useState } from 'react';
import { UploadCloud, Image, Music, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { formatFileSize, getFileTypeIcon } from '../../utils/formatters';

interface DropZoneProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  acceptedFile: File | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.webp,.pdf,.mp3,.wav,.ogg,.webm,.m4a';

export const DropZone: React.FC<DropZoneProps> = ({
  onFileSelect,
  disabled = false,
  acceptedFile,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large (${formatFileSize(file.size)}). Maximum limit is 10MB.`);
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setError(null);
  };

  const FileIconComponent = acceptedFile ? getFileTypeIcon(acceptedFile.type.split('/')[0] || 'text') : UploadCloud;

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />

      {!acceptedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
            disabled
              ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
              : isDragOver
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40 hover:bg-slate-50'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm border border-indigo-100">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-base font-semibold text-slate-800 mb-1">
            Drag & drop your file here, or <span className="text-indigo-600 hover:underline">browse</span>
          </p>
          <p className="text-xs text-slate-500 mb-4 max-w-sm">
            Upload images (screenshots, memes), audio notes, or PDF documents to inspect claims.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              <Image className="w-3.5 h-3.5 text-blue-500" /> Images (PNG, JPG, WEBP)
            </span>
            <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              <FileText className="w-3.5 h-3.5 text-emerald-500" /> PDF Documents
            </span>
            <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              <Music className="w-3.5 h-3.5 text-purple-500" /> Audio (MP3, WAV, M4A)
            </span>
            <span className="text-slate-400">Max size: 10MB</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5 flex items-center justify-between transition">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileIconComponent className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 truncate block">
                  {acceptedFile.name}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatFileSize(acceptedFile.size)} • {acceptedFile.type || 'Document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 transition disabled:opacity-50"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
